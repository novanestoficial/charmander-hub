"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../lib/supabase/client";

function ScriptList({ items, emptyText }) {
  if (!items.length) {
    return <p className="account-panel-empty">{emptyText}</p>;
  }
  return (
    <ul className="account-panel-list">
      {items.map((script) => (
        <li key={script.slug}>
          <a href={`/scripts/${script.slug}`}>{script.name}</a>
        </li>
      ))}
    </ul>
  );
}

export default function AccountMenu({ user, isAdmin, purchasedScripts, likedScripts }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    function handlePointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  const metadata = user.user_metadata || {};
  const displayName = metadata.full_name || metadata.name || user.email.split("@")[0];
  const avatarUrl = metadata.avatar_url || metadata.picture || null;
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className={`account-menu${open ? " open" : ""}`} ref={rootRef}>
      <button
        type="button"
        className="account-trigger"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {avatarUrl ? (
          <img className="account-avatar" src={avatarUrl} alt="" width="32" height="32" referrerPolicy="no-referrer" />
        ) : (
          <span className="account-avatar account-avatar-fallback" aria-hidden="true">{initials}</span>
        )}
        <span className="auth-nav-text account-trigger-name">{displayName}</span>
      </button>

      <div className="account-panel" role="menu">
        <div className="account-panel-inner">
          <div className="account-panel-head">
            {avatarUrl ? (
              <img className="account-avatar account-avatar-lg" src={avatarUrl} alt="" width="48" height="48" referrerPolicy="no-referrer" />
            ) : (
              <span className="account-avatar account-avatar-lg account-avatar-fallback" aria-hidden="true">{initials}</span>
            )}
            <div className="account-panel-identity">
              <p className="account-name">{displayName}</p>
              <p className="account-email">{user.email}</p>
            </div>
          </div>

          <div className="account-panel-section">
            <p className="account-panel-label">Scripts adquiridos</p>
            <ScriptList items={purchasedScripts} emptyText="Nenhum script comprado ainda." />
          </div>

          <div className="account-panel-section">
            <p className="account-panel-label">❤️ Scripts curtidos</p>
            <ScriptList items={likedScripts} emptyText="Curte um script pra ele aparecer aqui." />
          </div>

          <div className="account-panel-foot">
            {isAdmin && (
              <a href="/admin" className="account-panel-action" role="menuitem">
                <svg className="auth-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                </svg>
                Painel admin
              </a>
            )}
            <button type="button" className="account-panel-action account-panel-logout" onClick={handleLogout} role="menuitem">
              <svg className="auth-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M13 8l4 4-4 4M8 12h9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
