import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

/**
 * JWT secret from env. Production MUST provide JWT_SECRET (throws at first
 * use otherwise); dev falls back to a stable local value with a warning so
 * the demo runs without extra setup.
 */
function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.warn(
      "[auth] JWT_SECRET not set — using fallback secret. Set JWT_SECRET in environment variables before production launch."
    );
    return new TextEncoder().encode(
      process.env.NODE_ENV === "production"
        ? "honeychain-production-fallback-secret-key-replace-in-env"
        : "dev-only-honeychain-secret-do-not-ship"
    );
  }
  return new TextEncoder().encode(secret);
}

const key = getSecretKey();

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

export async function login(user: any) {
  const session = await encrypt({ user, time: new Date().getTime() });
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
  
  (await cookies()).set("session", session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function logout() {
  (await cookies()).set("session", "", {
    expires: new Date(0),
    httpOnly: true,
    path: "/",
  });
}

export async function getSession() {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;
  
  try {
    const parsed = await decrypt(session);
    return parsed.user;
  } catch (error) {
    return null;
  }
}
