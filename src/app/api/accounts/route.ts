import { createClient } from "@/lib/supabase/server";
import { handleAccounts } from "@/lib/accounts/core";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
async function handle(request: Request) {
  return handleAccounts(
    request,
    {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
      secret: process.env.SUPABASE_SECRET_KEY ?? "",
      origin: process.env.NEXT_PUBLIC_SITE_URL ?? "",
      unified: process.env.ACCOUNT_UNIFICATION_ENABLED === "true",
      enabled:
        process.env.ACCOUNT_LINKING_ENABLED === "true" &&
        process.env.ACCOUNT_UNIFICATION_ENABLED === "true",
    },
    async () => {
      const client = await createClient();
      const { data } = await client.auth.getSession();
      // Core remotely validates this token with getUser before using any claims.
      return data.session?.access_token ?? null;
    },
  );
}
export const GET = handle;
export const POST = handle;
