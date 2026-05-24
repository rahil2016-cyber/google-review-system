import { NextResponse } from "next/server";
import type { SessionPayload } from "./auth";

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function unauthorized(message = "Unauthorized") {
  return jsonError(message, 401);
}

export function forbidden(message = "Forbidden") {
  return jsonError(message, 403);
}

export function assertClientAccess(session: SessionPayload, clientId: string) {
  if (session.role === "SUPER_ADMIN") return true;
  return session.role === "CLIENT" && session.clientId === clientId;
}
