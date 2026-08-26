import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

const secretKey = "super-secret-honeychain-key";
const key = new TextEncoder().encode(secretKey);

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
