import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "../../lib/supabase/server";
import { getSupabaseAdminClient } from "../../lib/supabase/admin";
import { ADMIN_EMAIL } from "../../lib/admin";
import { startOfTodayBrazil, startOfWeekBrazil } from "../../lib/brazil-time";
import AdminDashboard from "../../components/AdminDashboard";

export const metadata = {
  title: "Admin — CHARMANDER SCRIPTS",
  robots: "noindex, nofollow",
};

// agrupa por hora no fuso de Brasília (UTC-3, sem horário de verão) pra o
// "horário de pico" bater com a hora real de quem tá vendo o painel
function bucketByHourBR(rows) {
  const buckets = new Array(24).fill(0);
  for (const row of rows || []) {
    const hourUTC = new Date(row.created_at).getUTCHours();
    const hourBR = (hourUTC + 24 - 3) % 24;
    buckets[hourBR]++;
  }
  return buckets;
}

export default async function AdminPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    notFound();
  }

  const admin = getSupabaseAdminClient();

  // fronteira do dia/semana sempre no horário de Brasília (meia-noite real),
  // não no fuso do servidor — os contadores "hoje"/"semana" têm que zerar
  // exatamente à meia-noite local, não num horário arbitrário do servidor
  const todayStart = startOfTodayBrazil().toISOString();
  const weekStart = startOfWeekBrazil().toISOString();

  const [
    { data: scripts },
    { data: siteStats },
    { data: usersResult },
    { count: purchaseCount },
    { data: visitsTodayRows, count: visitsToday },
    { data: visitsWeekRows, count: visitsWeek },
    { data: scriptViewsTodayRows, count: scriptViewsToday },
    { data: scriptViewsWeekRows, count: scriptViewsWeek },
    { count: purchasesToday },
    { count: likesToday },
    { data: copiesTodayRows, count: copiesToday },
    { data: copiesWeekRows, count: copiesWeek },
    { count: copiesTotal },
  ] = await Promise.all([
    admin.from("scripts").select("*").order("views", { ascending: false }),
    admin.from("site_stats").select("total_visits").eq("id", 1).maybeSingle(),
    admin.auth.admin.listUsers({ perPage: 200 }),
    admin.from("purchases").select("*", { count: "exact", head: true }),
    admin.from("visit_log").select("created_at", { count: "exact" }).gte("created_at", todayStart),
    admin.from("visit_log").select("created_at", { count: "exact" }).gte("created_at", weekStart),
    admin.from("script_view_log").select("created_at", { count: "exact" }).gte("created_at", todayStart),
    admin.from("script_view_log").select("created_at", { count: "exact" }).gte("created_at", weekStart),
    admin.from("purchases").select("*", { count: "exact", head: true }).gte("created_at", todayStart),
    admin.from("script_likes").select("*", { count: "exact", head: true }).gte("created_at", todayStart),
    admin.from("copy_log").select("created_at", { count: "exact" }).gte("created_at", todayStart),
    admin.from("copy_log").select("created_at", { count: "exact" }).gte("created_at", weekStart),
    admin.from("copy_log").select("*", { count: "exact", head: true }),
  ]);

  const visitsTodayHourly = bucketByHourBR(visitsTodayRows);
  const visitsWeekHourly = bucketByHourBR(visitsWeekRows);
  const scriptViewsTodayHourly = bucketByHourBR(scriptViewsTodayRows);
  const scriptViewsWeekHourly = bucketByHourBR(scriptViewsWeekRows);
  const copiesTodayHourly = bucketByHourBR(copiesTodayRows);
  const copiesWeekHourly = bucketByHourBR(copiesWeekRows);

  const totalVisits = siteStats?.total_visits ?? 0;
  const users = usersResult?.users ?? [];
  const totalUsers = users.length;
  const totalPurchases = purchaseCount ?? 0;
  const paidPrice = 4.99;
  const estimatedRevenue = (totalPurchases * paidPrice).toFixed(2).replace(".", ",");

  const scriptList = scripts ?? [];
  const existingCategories = [...new Set(scriptList.flatMap((s) => s.categories || []))].sort();
  const totalScriptViews = scriptList.reduce((sum, s) => sum + (s.views || 0), 0);
  const totalLikes = scriptList.reduce((sum, s) => sum + (s.likes || 0), 0);
  const mostLiked = [...scriptList].sort((a, b) => (b.likes || 0) - (a.likes || 0))[0];
  const conversionRate =
    totalUsers > 0 ? ((totalPurchases / totalUsers) * 100).toFixed(1).replace(".", ",") : "0,0";

  const recentUsers = [...users]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10);

  const startOfTodayDate = new Date(todayStart);
  const usersToday = users.filter((u) => new Date(u.created_at) >= startOfTodayDate).length;
  const revenueToday = ((purchasesToday ?? 0) * paidPrice).toFixed(2).replace(".", ",");

  return (
    <AdminDashboard
      totalVisits={totalVisits}
      totalUsers={totalUsers}
      totalPurchases={totalPurchases}
      estimatedRevenue={estimatedRevenue}
      totalScriptViews={totalScriptViews}
      totalLikes={totalLikes}
      conversionRate={conversionRate}
      mostLiked={mostLiked}
      usersToday={usersToday}
      purchasesToday={purchasesToday ?? 0}
      revenueToday={revenueToday}
      likesToday={likesToday ?? 0}
      visitsToday={visitsToday}
      visitsWeek={visitsWeek}
      scriptViewsToday={scriptViewsToday}
      scriptViewsWeek={scriptViewsWeek}
      visitsTodayHourly={visitsTodayHourly}
      visitsWeekHourly={visitsWeekHourly}
      scriptViewsTodayHourly={scriptViewsTodayHourly}
      scriptViewsWeekHourly={scriptViewsWeekHourly}
      copiesTotal={copiesTotal ?? 0}
      copiesToday={copiesToday}
      copiesWeek={copiesWeek}
      copiesTodayHourly={copiesTodayHourly}
      copiesWeekHourly={copiesWeekHourly}
      scriptList={scriptList}
      recentUsers={recentUsers}
      existingCategories={existingCategories}
    />
  );
}
