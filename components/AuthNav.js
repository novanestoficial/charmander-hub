"use client";

import AccountMenu from "./AccountMenu";

export default function AuthNav({ user, isAdmin, purchasedScripts = [], likedScripts = [] }) {
  if (!user) {
    return (
      <div className="auth-nav">
        <a href="/login" className="auth-login" aria-label="Entrar">
          <svg className="auth-icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="8" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M4.5 20c1.4-4 4.2-6 7.5-6s6.1 2 7.5 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span className="auth-nav-text">Entrar</span>
        </a>
      </div>
    );
  }

  return (
    <div className="auth-nav">
      <AccountMenu
        user={user}
        isAdmin={isAdmin}
        purchasedScripts={purchasedScripts}
        likedScripts={likedScripts}
      />
    </div>
  );
}
