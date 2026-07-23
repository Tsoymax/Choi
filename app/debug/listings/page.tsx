import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { RoleGuard } from "@/components/admin/RoleGuard";
import { requireModerator } from "@/lib/auth/roles";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type ListingDebugRow = {
  id: string;
  user_id: string;
  status: string | null;
  title: string;
};

export default async function DebugListingsPage() {
  const hasSupabaseEnv = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );

  if (!hasSupabaseEnv) {
    return (
      <main className="min-h-screen bg-[#f7f5ef] p-6 text-ink">
        <section className="mx-auto max-w-4xl rounded-[24px] bg-white p-6 shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
          <h1 className="text-3xl font-semibold">Choi listings debug</h1>
          <p className="mt-3 text-ink/62">Supabase is not configured.</p>
        </section>
      </main>
    );
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const access = await requireModerator(supabase);

  if (!access.user) {
    redirect("/login?next=/debug/listings");
  }

  if (!access.allowed) {
    return (
      <RoleGuard
        title="Debug закрыт"
        message="Диагностика объявлений доступна только модераторам и администраторам."
      />
    );
  }

  const { data: userData } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("listings")
    .select("id,user_id,status,title")
    .order("created_at", { ascending: false });

  const listings = (data ?? []) as ListingDebugRow[];

  return (
    <main className="min-h-screen bg-[#f7f5ef] p-6 text-ink">
      <section className="mx-auto max-w-5xl rounded-[24px] bg-white p-6 shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
        <h1 className="text-3xl font-semibold">Choi listings debug</h1>
        <div className="mt-6 grid gap-3 rounded-2xl bg-mist p-4 text-sm">
          <p>
            <strong>Current user id:</strong> {userData.user?.id ?? "guest"}
          </p>
          <p>
            <strong>Total visible listings:</strong> {listings.length}
          </p>
          <p>
            <strong>Supabase error:</strong>{" "}
            {error ? `${error.code ?? "unknown"} ${error.message}` : "none"}
          </p>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-y-2 text-left text-sm">
            <thead className="text-ink/58">
              <tr>
                <th className="px-3 py-2">Listing id</th>
                <th className="px-3 py-2">Owner id</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Title</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr key={listing.id} className="rounded-2xl bg-[#f7f5ef]">
                  <td className="rounded-l-2xl px-3 py-3 font-mono text-xs">{listing.id}</td>
                  <td className="px-3 py-3 font-mono text-xs">{listing.user_id}</td>
                  <td className="px-3 py-3">{listing.status ?? "null"}</td>
                  <td className="rounded-r-2xl px-3 py-3 font-semibold">{listing.title}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
