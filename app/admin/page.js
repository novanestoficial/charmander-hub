import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "../../lib/supabase/server";
import { getSupabaseAdminClient } from "../../lib/supabase/admin";
import { ADMIN_EMAIL } from "../../lib/admin";
import { startOfTodayBrazil, startOfWeekBrazil } from "../../lib/brazil-time";

export const metadata = {
  title: "Admin — CHARMANDER SCRIPTS",
  robots: "noindex, nofollow",
};

export default async function AdminPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    notFound();
  }

  const admin = getSupabaseAdminClient();

  const todayStart = startOfTodayBrazil().toISOString();
  const weekStart = startOfWeekBrazil().toISOString();

  const [
    { data: scripts },
    { data: siteStats },
    { data: usersResult },
    { count: purchaseCount },
    { count: visitsToday },
    { count: visitsWeek },
    { count: copiesTotal },
    { count: copiesToday },
    { count: copiesWeek },
  ] = await Promise.all([
    admin.from("scripts").select("*").order("views", { ascending: false }),
    admin.from("site_stats").select("total_visits").eq("id", 1).maybeSingle(),
    admin.auth.admin.listUsers({ perPage: 200 }),
    admin.from("purchases").select("*", { count: "exact", head: true }),
    admin.from("visit_log").select("*", { count: "exact", head: true }).gte("created_at", todayStart),
    admin.from("visit_log").select("*", { count: "exact", head: true }).gte("created_at", weekStart),
    admin.from("copy_log").select("*", { count: "exact", head: true }),
    admin.from("copy_log").select("*", { count: "exact", head: true }).gte("created_at", todayStart),
    admin.from("copy_log").select("*", { count: "exact", head: true }).gte("created_at", weekStart),
  ]);

  const totalVisits = siteStats?.total_visits ?? 0;
  const users = usersResult?.users ?? [];
  const totalUsers = users.length;
  const totalPurchases = purchaseCount ?? 0;
  const paidPrice = 4.99;
  const estimatedRevenue = (totalPurchases * paidPrice).toFixed(2).replace(".", ",");

  const scriptList = scripts ?? [];
  const totalScriptViews = scriptList.reduce((sum, s) => sum + (s.views || 0), 0);
  const totalLikes = scriptList.reduce((sum, s) => sum + (s.likes || 0), 0);
  const mostLiked = [...scriptList].sort((a, b) => (b.likes || 0) - (a.likes || 0))[0];
  const conversionRate =
    totalUsers > 0 ? ((totalPurchases / totalUsers) * 100).toFixed(1).replace(".", ",") : "0,0";

  const recentUsers = [...users]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10);

  return (
    <>
      <header className="site-header">
        <a className="logo" href="/">
          CHARMANDER<span className="logo-suffix"> SCRIPTS</span>
        </a>
        <a className="btn btn-ghost" href="/">
          <span className="back-full">&larr; Voltar ao site</span>
          <span className="back-short">&larr; Voltar</span>
        </a>
      </header>

      <main>
      <div className="wrap admin-wrap">
        <p className="eyebrow">Admin</p>
        <h1 className="detail-title">Painel</h1>

        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <span className="admin-stat-label">Visitas totais</span>
            <span className="admin-stat-value">{totalVisits}</span>
            <span className="admin-stat-delta">+{visitsToday ?? 0} hoje</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">Visitas na semana</span>
            <span className="admin-stat-value">{visitsWeek ?? 0}</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">Cópias totais</span>
            <span className="admin-stat-value">{copiesTotal ?? 0}</span>
            <span className="admin-stat-delta">+{copiesToday ?? 0} hoje</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">Cópias na semana</span>
            <span className="admin-stat-value">{copiesWeek ?? 0}</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">Usuários cadastrados</span>
            <span className="admin-stat-value">{totalUsers}</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">Compras</span>
            <span className="admin-stat-value">{totalPurchases}</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">Receita estimada</span>
            <span className="admin-stat-value">R$ {estimatedRevenue}</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">Views nos scripts (total)</span>
            <span className="admin-stat-value">{totalScriptViews}</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">Likes totais</span>
            <span className="admin-stat-value">{totalLikes}</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">Taxa de conversão</span>
            <span className="admin-stat-value">{conversionRate}%</span>
          </div>
          {mostLiked && (
            <div className="admin-stat-card">
              <span className="admin-stat-label">Mais curtido</span>
              <span className="admin-stat-value admin-stat-value-sm">{mostLiked.name}</span>
            </div>
          )}
        </div>

        <section className="admin-section">
          <h2>Scripts mais vistos</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Script</th>
                  <th>Views</th>
                  <th>Likes</th>
                  <th>Pago</th>
                </tr>
              </thead>
              <tbody>
                {scriptList.map((s) => (
                  <tr key={s.slug}>
                    <td>{s.name}</td>
                    <td>{s.views}</td>
                    <td>{s.likes}</td>
                    <td>{s.is_paid ? "Sim" : "Não"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-section">
          <h2>Usuários cadastrados ({totalUsers})</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>E-mail</th>
                  <th>Cadastro</th>
                  <th>Provedor</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u) => (
                  <tr key={u.id}>
                    <td>{u.email}</td>
                    <td>{new Date(u.created_at).toLocaleDateString("pt-BR")}</td>
                    <td>{u.app_metadata?.provider || "email"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalUsers > recentUsers.length && (
            <p className="admin-note">Mostrando os 10 cadastros mais recentes de {totalUsers}.</p>
          )}
        </section>
      </div>
      </main>
    </>
  );
}
