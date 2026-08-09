"use client";

import { useLayoutEffect, useRef, useState } from "react";
import HourlyChart from "./HourlyChart";
import AdminScriptForm from "./AdminScriptForm";
import AdminScriptList from "./AdminScriptList";

const TABS = [
  {
    id: "stats",
    label: "Estatísticas",
    shortLabel: "Estatísticas",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 20V10M12 20V4M20 20v-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "users",
    label: "Usuários cadastrados",
    shortLabel: "Usuários",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="9" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3.5 19c.6-3.2 3-5 5.5-5s4.9 1.8 5.5 5M15.5 5.5a3.2 3.2 0 0 1 0 6.2M20.5 19c-.4-2.4-1.7-4-3.6-4.7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "add",
    label: "Adicionar script",
    shortLabel: "Adicionar",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "manage",
    label: "Gerenciar scripts",
    shortLabel: "Gerenciar",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 7h16M4 12h16M4 17h10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
];

// selo verde com o quanto essa estatística já subiu hoje (some se ainda for 0)
function StatDelta({ value, prefix = "+" }) {
  if (!value) return null;
  return <span className="admin-stat-delta">{prefix}{value} hoje</span>;
}

function NavButton({ tab, active, variant, onSelect }) {
  return (
    <button
      type="button"
      data-tab-id={tab.id}
      className={`admin-sidebar-item${active === tab.id ? " is-active" : ""}`}
      onClick={() => onSelect(tab.id)}
      aria-current={active === tab.id ? "page" : undefined}
    >
      <span className="admin-sidebar-icon">{tab.icon}</span>
      {variant === "header" ? tab.shortLabel : tab.label}
    </button>
  );
}

// indicador líquido: mede a posição do botão ativo e anima até lá esticando
// (a "ponta fina") no meio do caminho antes de reformar no destino
function AdminHeaderNav({ active, onSelect }) {
  const navRef = useRef(null);
  const indicatorRef = useRef(null);
  const prevRef = useRef(null);

  useLayoutEffect(() => {
    const nav = navRef.current;
    const indicator = indicatorRef.current;
    if (!nav || !indicator) return;

    function measure() {
      const btn = nav.querySelector(`[data-tab-id="${active}"]`);
      if (!btn) return null;
      const navRect = nav.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      return { left: btnRect.left - navRect.left, width: btnRect.width };
    }

    const target = measure();
    if (!target) return;
    const prev = prevRef.current;

    const reduceMotion =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!prev || reduceMotion) {
      indicator.style.left = `${target.left}px`;
      indicator.style.width = `${target.width}px`;
    } else if (prev.left !== target.left || prev.width !== target.width) {
      const midLeft = Math.min(prev.left, target.left);
      const midWidth = Math.max(prev.left + prev.width, target.left + target.width) - midLeft;

      indicator.animate(
        [
          { left: `${prev.left}px`, width: `${prev.width}px`, top: "3px", bottom: "3px" },
          { left: `${midLeft}px`, width: `${midWidth}px`, top: "10px", bottom: "10px", offset: 0.55 },
          { left: `${target.left}px`, width: `${target.width}px`, top: "3px", bottom: "3px" },
        ],
        { duration: 480, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "forwards" }
      );
      indicator.style.left = `${target.left}px`;
      indicator.style.width = `${target.width}px`;
    }

    prevRef.current = target;

    function handleResize() {
      const r = measure();
      if (!r) return;
      indicator.style.left = `${r.left}px`;
      indicator.style.width = `${r.width}px`;
      prevRef.current = r;
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [active]);

  return (
    <nav className="admin-header-nav" ref={navRef} aria-label="Seções do admin">
      <span className="admin-nav-indicator" ref={indicatorRef} aria-hidden="true" />
      {TABS.map((tab) => (
        <NavButton key={tab.id} tab={tab} active={active} variant="header" onSelect={onSelect} />
      ))}
    </nav>
  );
}

export default function AdminDashboard({
  totalVisits,
  totalUsers,
  totalPurchases,
  estimatedRevenue,
  totalScriptViews,
  totalLikes,
  conversionRate,
  mostLiked,
  usersToday,
  purchasesToday,
  revenueToday,
  likesToday,
  visitsToday,
  visitsWeek,
  scriptViewsToday,
  scriptViewsWeek,
  visitsTodayHourly,
  visitsWeekHourly,
  scriptViewsTodayHourly,
  scriptViewsWeekHourly,
  scriptList,
  recentUsers,
  existingCategories,
}) {
  const [active, setActive] = useState("stats");

  return (
    <>
      <header className="site-header">
        <a className="logo" href="/">
          <span className="logo-badge">
            <img className="logo-mark" src="/charmander-logo.png" alt="" width="64" height="64" />
          </span>
          <span className="logo-text">CHARMANDER<span className="logo-suffix"> SCRIPTS</span></span>
        </a>

        <AdminHeaderNav active={active} onSelect={setActive} />

        <a className="btn btn-ghost" href="/">
          <span className="back-full">&larr; Voltar ao site</span>
          <span className="back-short">&larr; Voltar</span>
        </a>
      </header>

      <main>
      <div className="wrap admin-wrap">
        <p className="eyebrow">Admin</p>
        <h1 className="detail-title">Painel</h1>

      <div className="admin-shell">
      <nav className="admin-mobile-nav" aria-label="Seções do admin (mobile)">
        {TABS.map((tab) => (
          <NavButton key={tab.id} tab={tab} active={active} variant="mobile" onSelect={setActive} />
        ))}
      </nav>

      <div className="admin-content">
        {active === "stats" && (
          <div className="admin-tab-panel">
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <span className="admin-stat-label">Visitas totais</span>
                <span className="admin-stat-value-row">
                  <span className="admin-stat-value">{totalVisits}</span>
                  <StatDelta value={visitsToday} />
                </span>
              </div>
              <div className="admin-stat-card">
                <span className="admin-stat-label">Usuários cadastrados</span>
                <span className="admin-stat-value-row">
                  <span className="admin-stat-value">{totalUsers}</span>
                  <StatDelta value={usersToday} />
                </span>
              </div>
              <div className="admin-stat-card">
                <span className="admin-stat-label">Compras</span>
                <span className="admin-stat-value-row">
                  <span className="admin-stat-value">{totalPurchases}</span>
                  <StatDelta value={purchasesToday} />
                </span>
              </div>
              <div className="admin-stat-card">
                <span className="admin-stat-label">Receita estimada</span>
                <span className="admin-stat-value-row">
                  <span className="admin-stat-value">R$ {estimatedRevenue}</span>
                  <StatDelta value={purchasesToday > 0 ? `R$ ${revenueToday}` : 0} prefix="+" />
                </span>
              </div>
              <div className="admin-stat-card">
                <span className="admin-stat-label">Views nos scripts (total)</span>
                <span className="admin-stat-value-row">
                  <span className="admin-stat-value">{totalScriptViews}</span>
                  <StatDelta value={scriptViewsToday} />
                </span>
              </div>
              <div className="admin-stat-card">
                <span className="admin-stat-label">Likes totais</span>
                <span className="admin-stat-value-row">
                  <span className="admin-stat-value">{totalLikes}</span>
                  <StatDelta value={likesToday} />
                </span>
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

            <div className="admin-today-panel">
              <p className="admin-today-heading">Hoje &amp; essa semana</p>
              <div className="admin-today-grid">
                <div className="admin-today-card">
                  <span className="admin-today-period">Hoje</span>
                  <span className="admin-today-value">{visitsToday ?? 0}</span>
                  <span className="admin-today-label">Visitas</span>
                  <HourlyChart buckets={visitsTodayHourly} unitLabel="visitas" />
                </div>
                <div className="admin-today-card">
                  <span className="admin-today-period">Semana</span>
                  <span className="admin-today-value">{visitsWeek ?? 0}</span>
                  <span className="admin-today-label">Visitas</span>
                  <HourlyChart buckets={visitsWeekHourly} unitLabel="visitas" />
                </div>
                <div className="admin-today-card">
                  <span className="admin-today-period">Hoje</span>
                  <span className="admin-today-value">{scriptViewsToday ?? 0}</span>
                  <span className="admin-today-label">Cliques em scripts</span>
                  <HourlyChart buckets={scriptViewsTodayHourly} unitLabel="cliques" />
                </div>
                <div className="admin-today-card">
                  <span className="admin-today-period">Semana</span>
                  <span className="admin-today-value">{scriptViewsWeek ?? 0}</span>
                  <span className="admin-today-label">Cliques em scripts</span>
                  <HourlyChart buckets={scriptViewsWeekHourly} unitLabel="cliques" />
                </div>
              </div>
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
          </div>
        )}

        {active === "users" && (
          <div className="admin-tab-panel">
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
        )}

        {active === "add" && (
          <div className="admin-tab-panel">
            <section className="admin-section">
              <h2>Adicionar script</h2>
              <AdminScriptForm existingCategories={existingCategories} />
            </section>
          </div>
        )}

        {active === "manage" && (
          <div className="admin-tab-panel">
            <section className="admin-section admin-section-compact">
              <h2>Gerenciar scripts</h2>
              <AdminScriptList
                scripts={[...scriptList]
                  .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                  .map((s) => ({ slug: s.slug, name: s.name }))}
              />
            </section>
          </div>
        )}
      </div>
      </div>
      </div>
      </main>
    </>
  );
}
