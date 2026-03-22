import assert from "node:assert/strict";
import test from "node:test";
import { buildAutomationTaskRows, getTaskPlan } from "../server/automation";

test("getTaskPlan retorna tarefas esperadas para order.paid", () => {
  const plan = getTaskPlan("order.paid");
  assert.deepEqual(
    plan.map((item) => item.taskType),
    ["send_confirmation", "education_24h", "review_7d", "reorder_25d"],
  );
});

test("getTaskPlan retorna tarefas esperadas para checkout.abandoned", () => {
  const plan = getTaskPlan("checkout.abandoned");
  assert.deepEqual(
    plan.map((item) => item.taskType),
    ["recover_1h", "recover_24h"],
  );
});

test("buildAutomationTaskRows agenda datas relativas corretas", () => {
  const baseDate = new Date("2026-03-22T12:00:00.000Z");

  const rows = buildAutomationTaskRows({
    eventId: "evt_1",
    eventType: "order.paid",
    payload: { sessionId: "cs_test" },
    now: baseDate,
  });

  assert.equal(rows.length, 4);
  assert.equal(rows[0].task_type, "send_confirmation");
  assert.equal(rows[0].due_at, "2026-03-22T12:00:00.000Z");
  assert.equal(rows[1].due_at, "2026-03-23T12:00:00.000Z");
  assert.equal(rows[2].due_at, "2026-03-29T12:00:00.000Z");
  assert.equal(rows[3].due_at, "2026-04-16T12:00:00.000Z");
});
