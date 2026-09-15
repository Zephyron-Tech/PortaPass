import { SignJWT, jwtVerify } from "jose";

/**
 * The verification result is handed back to the app in a signed, httpOnly
 * cookie. Nothing is persisted server-side — the claims live only as long as
 * it takes to issue the pass.
 */
const COOKIE_NAME = "portapass_verification";
const MAX_AGE_SECONDS = 15 * 60;

export type VerificationSession = {
  roomId: string;
  token: string;
  subject: string;
  name?: string;
  birthdate?: string;
};

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set to at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

export async function createVerificationCookie(session: VerificationSession) {
  const value = await new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(getSecret());

  return {
    name: COOKIE_NAME,
    value,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: MAX_AGE_SECONDS,
    },
  };
}

export async function readVerificationCookie(
  value: string | undefined,
): Promise<VerificationSession | null> {
  if (!value) return null;
  try {
    // getSecret() is inside the try: with no SESSION_SECRET configured there
    // is simply no valid session, which is not an error worth throwing on.
    const { payload } = await jwtVerify(value, getSecret(), { algorithms: ["HS256"] });
    return {
      roomId: String(payload.roomId),
      token: String(payload.token),
      subject: String(payload.subject),
      name: payload.name as string | undefined,
      birthdate: payload.birthdate as string | undefined,
    };
  } catch {
    return null;
  }
}

export const VERIFICATION_COOKIE = COOKIE_NAME;
