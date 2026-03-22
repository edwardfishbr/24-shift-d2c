import type { AutomationEventType, AutomationTaskType } from "../shared/types";
import { getSupabase } from "./clients";
import { getOptionalEnv } from "./env";

const MAX_RETRIES = 5;

interface EventInsertResult {
  id: string;
  event_type: AutomationEventType;
}

const ORDER_PAID_PLAN: Array<{ taskType: AutomationTaskType; hoursFromNow: number }> = [
  { taskType: "send_confirmation", hoursFromNow: 0 },
  { taskType: "education_24h", hoursFromNow: 24 },
  { taskType: "review_7d", hoursFromNow: 24 * 7 },
  { taskType: "reorder_25d", hoursFromNow: 24 * 25 },
];

const ABANDONED_PLAN: Array<{ taskType: AutomationTaskType; hoursFromNow: number }> = [
  { taskType: "recover_1h", hoursFromNow: 1 },
  { taskType: "recover_24h", hoursFromNow: 24 },
];

function addHours(base: Date, hours: number): string {
  return new Date(base.getTime() + hours * 60 * 60 * 1000).toISOString();
}

export function getTaskPlan(eventType: AutomationEventType): Array<{ taskType: AutomationTaskType; hoursFromNow: number }> {
  return eventType === "order.paid" ? ORDER_PAID_PLAN : ABANDONED_PLAN;
}

export interface AutomationTaskInsertRow {
  event_id: string;
  task_type: AutomationTaskType;
  status: "pending";
  due_at: string;
  next_attempt_at: string;
  retries: number;
  payload: Record<string, unknown>;
  last_error: null;
  created_at: string;
  updated_at: string;
}

export function buildAutomationTaskRows(params: {
  eventId: string;
  eventType: AutomationEventType;
  payload: Record<string, unknown>;
  now?: Date;
}): AutomationTaskInsertRow[] {
  const plan = getTaskPlan(params.eventType);
  const baseDate = params.now ?? new Date();
  const nowIso = baseDate.toISOString();

  return plan.map((item) => {
    const dueAt = addHours(baseDate, item.hoursFromNow);
    return {
      event_id: params.eventId,
      task_type: item.taskType,
      status: "pending",
      due_at: dueAt,
      next_attempt_at: dueAt,
      retries: 0,
      payload: params.payload,
      last_error: null,
      created_at: nowIso,
      updated_at: nowIso,
    };
  });
}

export async function createAutomationEvent(params: {
  eventType: AutomationEventType;
  payload: Record<string, unknown>;
  stripeEventId?: string | null;
}): Promise<EventInsertResult | null> {
  const now = new Date().toISOString();
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("automation_events")
    .upsert(
      {
        event_type: params.eventType,
        stripe_event_id: params.stripeEventId ?? null,
        payload: params.payload,
        created_at: now,
      },
      { onConflict: "stripe_event_id", ignoreDuplicates: false },
    )
    .select("id, event_type")
    .single();

  if (error) {
    // If we cannot write events due to missing infra, keep API alive but observable.
    console.error("automation_events upsert failed:", error.message);
    return null;
  }

  console.info("[automation.event.upserted]", {
    eventType: params.eventType,
    stripeEventId: params.stripeEventId ?? null,
    eventId: data?.id ?? null,
  });

  return data as EventInsertResult;
}

export async function scheduleTasksForEvent(event: EventInsertResult, payload: Record<string, unknown>) {
  const supabase = getSupabase();
  const rows = buildAutomationTaskRows({
    eventId: event.id,
    eventType: event.event_type,
    payload,
  });

  const { data: existingRows, error: existingError } = await supabase
    .from("automation_tasks")
    .select("task_type")
    .eq("event_id", event.id);

  if (existingError) {
    console.error("automation_tasks precheck failed:", existingError.message);
    return;
  }

  const existingTaskTypes = new Set((existingRows ?? []).map((row) => row.task_type as AutomationTaskType));
  const rowsToInsert = rows.filter((row) => !existingTaskTypes.has(row.task_type));

  if (rowsToInsert.length === 0) {
    return;
  }

  const { error } = await supabase.from("automation_tasks").insert(rowsToInsert);
  if (error) {
    console.error("automation_tasks insert failed:", error.message);
  }
}

export async function createAndScheduleEvent(params: {
  eventType: AutomationEventType;
  payload: Record<string, unknown>;
  stripeEventId?: string | null;
}) {
  const event = await createAutomationEvent(params);
  if (!event) {
    return;
  }
  await scheduleTasksForEvent(event, params.payload);
}

export async function detectAndCreateAbandonedCheckoutEvents() {
  const supabase = getSupabase();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("checkout_sessions")
    .select("stripe_session_id, customer_email, subtotal_cents, total_cents, created_at")
    .eq("status", "open")
    .lt("created_at", oneHourAgo)
    .limit(100);

  if (error || !data) {
    if (error) {
      console.error("checkout_sessions query failed:", error.message);
    }
    return 0;
  }

  let created = 0;
  for (const row of data as Array<Record<string, unknown>>) {
    const sessionId = String(row.stripe_session_id);
    await createAndScheduleEvent({
      eventType: "checkout.abandoned",
      stripeEventId: `abandoned:${sessionId}`,
      payload: {
        sessionId,
        customerEmail: row.customer_email ?? null,
        subtotalCents: row.subtotal_cents ?? 0,
        totalCents: row.total_cents ?? 0,
        createdAt: row.created_at ?? null,
      },
    });
    created += 1;
  }

  return created;
}

export async function listAutomationTasks(status = "pending") {
  const supabase = getSupabase();
  const query = supabase
    .from("automation_tasks")
    .select("id, event_id, task_type, status, due_at, next_attempt_at, retries, payload, last_error, created_at, updated_at")
    .order("due_at", { ascending: true })
    .limit(100);

  if (status) {
    query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Falha ao listar tarefas de automação: ${error.message}`);
  }

  return data ?? [];
}

export async function processAutomationTasks(limit = 20) {
  const supabase = getSupabase();
  await detectAndCreateAbandonedCheckoutEvents();

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("automation_tasks")
    .select("id, task_type, retries, payload")
    .eq("status", "pending")
    .lte("next_attempt_at", now)
    .order("due_at", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`Falha ao buscar tarefas pendentes: ${error.message}`);
  }

  const tasks = data ?? [];
  const { automationWebhookBaseUrl } = getOptionalEnv();

  const results: Array<{ taskId: string; status: "completed" | "failed"; error?: string }> = [];

  for (const task of tasks as Array<Record<string, unknown>>) {
    const taskId = String(task.id);
    const taskType = String(task.task_type);
    const retries = Number(task.retries ?? 0);
    const payload = (task.payload ?? {}) as Record<string, unknown>;

    await supabase
      .from("automation_tasks")
      .update({ status: "processing", updated_at: new Date().toISOString() })
      .eq("id", taskId);

    try {
      const endpoint = `${automationWebhookBaseUrl.replace(/\/$/, "")}/${taskType}`;
      const dispatchedAt = new Date().toISOString();

      const { error: outboxError } = await supabase.from("automation_outbox").insert({
        task_id: taskId,
        event_type: taskType,
        endpoint,
        payload,
        status: "queued",
        dispatched_at: dispatchedAt,
        response: { queued: true },
      });

      if (outboxError) {
        throw new Error(outboxError.message);
      }

      await supabase
        .from("automation_tasks")
        .update({
          status: "completed",
          updated_at: new Date().toISOString(),
          last_error: null,
        })
        .eq("id", taskId);

      results.push({ taskId, status: "completed" });
      console.info("[automation.task.completed]", {
        taskId,
        taskType,
      });
    } catch (taskError) {
      const nextRetries = retries + 1;
      const failed = nextRetries >= MAX_RETRIES;
      const nextAttemptAt = addHours(new Date(), Math.min(nextRetries, 6));
      const message = taskError instanceof Error ? taskError.message : "Unknown task error";

      await supabase
        .from("automation_tasks")
        .update({
          status: failed ? "failed" : "pending",
          retries: nextRetries,
          next_attempt_at: nextAttemptAt,
          last_error: message,
          updated_at: new Date().toISOString(),
        })
        .eq("id", taskId);

      results.push({ taskId, status: "failed", error: message });
      console.error("[automation.task.failed]", {
        taskId,
        taskType,
        retries: nextRetries,
        error: message,
      });
    }
  }

  return results;
}
