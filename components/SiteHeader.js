import { getSupabaseServerClient } from "../lib/supabase/server";
import { ADMIN_EMAIL } from "../lib/admin";
import AuthNav from "./AuthNav";

export default async function SiteHeader({ logoHref = "/", backHref }) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdmin = user?.email === ADMIN_EMAIL;

  let purchasedScripts = [];
  let likedScripts = [];
  if (user) {
    const { data: purchase } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (purchase) {
      const { data: paidScripts } = await supabase
        .from("scripts")
        .select("slug, name")
        .eq("is_paid", true);
      purchasedScripts = paidScripts || [];
    }

    const { data: likesData } = await supabase
      .from("script_likes")
      .select("scripts(slug, name)")
      .order("created_at", { ascending: false });
    likedScripts = (likesData || []).map((row) => row.scripts).filter(Boolean);
  }

  return (
    <header className="site-header">
      <a className="logo" href={logoHref}>
        <span className="logo-badge">
          <img className="logo-mark" src="/charmander-logo.png" alt="" width="64" height="64" />
        </span>
        <span className="logo-text">CHARMANDER<span className="logo-suffix"> SCRIPTS</span></span>
      </a>
      <nav className="main-nav">
        <div className="nav-links">
          {backHref && (
            <a href={backHref} className="nav-link-links nav-link-back">
              <svg className="nav-link-icon nav-link-back-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="nav-link-text">Voltar</span>
            </a>
          )}
          <a href="/links" className="nav-link-links">
            <svg className="nav-link-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9.5 14.5l5-5M10.5 8.5l.9-.9a3 3 0 1 1 4.2 4.2l-.9.9M13.5 15.5l-.9.9a3 3 0 1 1-4.2-4.2l.9-.9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span className="nav-link-text">Links</span>
          </a>
        </div>
        <AuthNav
          user={user}
          isAdmin={isAdmin}
          purchasedScripts={purchasedScripts}
          likedScripts={likedScripts}
        />
        <div className="social-links">
          <a
            href="https://www.instagram.com/charmandersafado?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="2.5" y="2.5" width="19" height="19" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" />
            </svg>
          </a>
          <a
            href="https://www.tiktok.com/@charmanderscript?is_from_webapp=1&sender_device=pc"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
              />
            </svg>
          </a>
          <a
            href="https://youtube.com/@charmandersafado?si=It3tJ905O0u-LRlj"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="2" y="5" width="20" height="14" rx="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path fill="currentColor" d="M10 8.5L16 12L10 15.5V8.5Z" />
            </svg>
          </a>
        </div>
      </nav>
    </header>
  );
}
