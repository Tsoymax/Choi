import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { RoleGuard } from "@/components/admin/RoleGuard";
import { requireModerator } from "@/lib/auth/roles";
import { getAdminData } from "@/lib/data/admin";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    return (
      <RoleGuard
        title="Supabase не подключен"
        message="Админ-панель работает после подключения переменных окружения Supabase."
      />
    );
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const access = await requireModerator(supabase);

  if (!access.user) {
    redirect("/login?next=/admin");
  }

  if (!access.allowed) {
    return <RoleGuard />;
  }

  const data = await getAdminData(supabase);

  return <AdminDashboard data={data} currentRole={access.role} />;
}
