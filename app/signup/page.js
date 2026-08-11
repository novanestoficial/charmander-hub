import AuthForm from "../../components/AuthForm";

export const metadata = {
  title: "Criar conta — CHARMANDER SCRIPTS",
};

export default async function SignupPage({ searchParams }) {
  const { next } = await searchParams;

  return (
    <>
      <header className="site-header">
        <a className="logo" href="/">
          <span className="logo-badge">
            <img className="logo-mark" src="/charmander-logo.png" alt="" width="64" height="64" />
          </span>
          <span className="logo-text">CHARMANDER<span className="logo-suffix"> SCRIPTS</span></span>
        </a>
        <a className="btn btn-ghost" href="/">
          <span className="back-full">&larr; Voltar ao catálogo</span>
          <span className="back-short">&larr; Voltar</span>
        </a>
      </header>

      <main>
        <div className="wrap auth-wrap">
          <p className="eyebrow">Acesso</p>
          <h1 className="detail-title">Criar conta</h1>
          {next && (
            <p className="auth-gate-notice">Cria sua conta pra liberar esse script.</p>
          )}

          <AuthForm mode="signup" next={next} />

          <p className="auth-switch">
            Já tem conta? <a href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}>Entrar</a>
          </p>
        </div>
      </main>

      <footer>
        <div className="wrap footer-inner">
          <span>&copy; 2026 CHARMANDER SCRIPTS.</span>
          <a className="detail-back" href="/">&larr; Voltar ao catálogo</a>
        </div>
      </footer>
    </>
  );
}
