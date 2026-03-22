import { timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

const CORS_ALLOWED_METHODS = "GET,POST,PUT,DELETE,OPTIONS";
const CORS_ALLOWED_HEADERS = "Content-Type,Stripe-Signature,X-Internal-Token,Authorization";

export function isOriginAllowed(origin: string, allowedOrigins: string[]): boolean {
  return allowedOrigins.includes(origin);
}

export function createCorsMiddleware(allowedOrigins: string[]) {
  const normalizedAllowedOrigins = Array.from(
    new Set(allowedOrigins.map((value) => value.trim()).filter(Boolean)),
  );

  return (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    if (!origin) {
      if (req.method === "OPTIONS") {
        return res.sendStatus(204);
      }
      return next();
    }

    if (!isOriginAllowed(origin, normalizedAllowedOrigins)) {
      return res.status(403).json({ error: "Origin nao permitida." });
    }

    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", CORS_ALLOWED_METHODS);
    res.setHeader("Access-Control-Allow-Headers", CORS_ALLOWED_HEADERS);

    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }

    return next();
  };
}

export function extractInternalToken(req: Request): string | null {
  const tokenFromHeader = req.header("x-internal-token");
  if (tokenFromHeader?.trim()) {
    return tokenFromHeader.trim();
  }

  const authorization = req.header("authorization");
  if (!authorization) {
    return null;
  }

  const trimmed = authorization.trim();
  if (trimmed.toLowerCase().startsWith("bearer ")) {
    return trimmed.slice(7).trim();
  }

  return trimmed || null;
}

function safeEqualTokens(received: string, expected: string): boolean {
  const left = Buffer.from(received);
  const right = Buffer.from(expected);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}

export function createInternalTokenMiddleware(expectedToken: string | null) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!expectedToken) {
      return res.status(500).json({ error: "Token interno de automacao nao configurado." });
    }

    const receivedToken = extractInternalToken(req);
    if (!receivedToken || !safeEqualTokens(receivedToken, expectedToken)) {
      return res.status(401).json({ error: "Nao autorizado." });
    }

    return next();
  };
}
