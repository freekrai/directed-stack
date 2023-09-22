// learn more: https://fly.io/docs/reference/configuration/#services-http_checks
import type { DataFunctionArgs } from "@vercel/remix";
import { envSchema } from "~/env.server";

let env = envSchema.parse(process.env);

export const loader = async ({ request }: DataFunctionArgs) => {
  const host = request.headers.get("X-Forwarded-Host") ?? request.headers.get("host");

  try {
    const url = new URL("/", `http://${host}`);
    // if we can connect to the database and make a simple query
    // and make a HEAD request to ourselves, then we're good.
    await Promise.all([
//    prisma.user.count(),
      fetch(url.toString(), { method: "HEAD" }).then((r) => {
        if (!r.ok) return Promise.reject(r);
      }),
      fetch(`${env.DIRECTUS_URL}/server/health`, { method: "HEAD" }).then((r) => {
        if (!r.ok) return Promise.reject(r);
      }),
    ]);

    return new Response("OK");
  } catch (error: unknown) {
    console.log("healthcheck ❌", { error });
    return new Response("ERROR", { status: 500 });
  }
};