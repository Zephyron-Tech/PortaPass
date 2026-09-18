import { respondWithPass } from "@/lib/apple-wallet/respond";

/**
 * Same pass, but reached at a URL whose path ends in `.pkpass`
 * (/api/pass/<roomId>/<token>/klic.pkpass) with no query string.
 *
 * Some clients route a download by the URL's file extension rather than by
 * Content-Type alone, so this gives iOS every signal it could key off. The
 * query-string form at /api/pass still works.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ parts: string[] }> },
) {
  const { parts } = await params;
  const [roomId, token] = parts;
  return respondWithPass(roomId, token);
}
