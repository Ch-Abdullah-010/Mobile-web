import { SignJWT, jwtVerify } from "jose";

const secret = process.env.SESSION_SECRET ?? "smartpos-insecure-dev-secret";
const encodedKey = new TextEncoder().encode(secret);

export type SessionPayload = {
  userId: string;
  role: string;
  name: string;
  email: string;
  expiresAt: string;
};

export const SESSION_COOKIE = "smartpos_session";
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export async function encryptSession(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decryptSession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedKey, { algorithms: ["HS256"] });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
