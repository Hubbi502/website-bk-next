import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "sahabat-bk-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";

// ─── Payload Types ────────────────────────────────────────────────────────────

export interface AdminJwtPayload {
  id: string;
  username: string;
  name: string;
  role: string;
  type: "admin";
  iat?: number;
  exp?: number;
}

export interface StudentJwtPayload {
  id: string;
  nisn: string;
  name: string;
  class: string;
  type: "student";
  iat?: number;
  exp?: number;
}

// ─── Sign Helpers ─────────────────────────────────────────────────────────────

export function signAdminToken(
  payload: Omit<AdminJwtPayload, "type" | "iat" | "exp">
): string {
  return jwt.sign(
    { ...payload, type: "admin" },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as SignOptions
  );
}

export function signStudentToken(
  payload: Omit<StudentJwtPayload, "type" | "iat" | "exp">
): string {
  return jwt.sign(
    { ...payload, type: "student" },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as SignOptions
  );
}

// ─── Verify Helpers ───────────────────────────────────────────────────────────

export function verifyToken(
  token: string
): AdminJwtPayload | StudentJwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminJwtPayload | StudentJwtPayload;
  } catch {
    return null;
  }
}

export function verifyAdminToken(token: string): AdminJwtPayload | null {
  const payload = verifyToken(token);
  if (payload && payload.type === "admin") return payload as AdminJwtPayload;
  return null;
}

export function verifyStudentToken(token: string): StudentJwtPayload | null {
  const payload = verifyToken(token);
  if (payload && payload.type === "student")
    return payload as StudentJwtPayload;
  return null;
}

// ─── Cookie Name Constants ────────────────────────────────────────────────────

export const ADMIN_TOKEN_COOKIE = "admin_token";
export const STUDENT_TOKEN_COOKIE = "student_token";
