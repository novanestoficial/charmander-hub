"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../lib/supabase/client";

export default function AuthForm({ mode, next }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [signedUp, setSignedUp] = useState(false);
  const destination = next || "/";

  async function handleGoogleLogin() {
    const supabase = getSupabaseBrowserClient();
    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("next", destination);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl.toString() },
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const supabase = getSupabaseBrowserClient();

    if (mode === "login") {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setSubmitting(false);
      if (signInError) {
        setError("E-mail ou senha inválidos.");
        return;
      }
      router.push(destination);
      router.refresh();
    } else {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      setSubmitting(false);
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      if (!signUpData.session) {
        setSignedUp(true);
        return;
      }
      router.push(destination);
      router.refresh();
    }
  }

  if (signedUp) {
    return (
      <p className="auth-success">
        Conta criada — confira seu e-mail (<strong>{email}</strong>) e clica no link de confirmação pra poder entrar.
      </p>
    );
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label className="auth-label">
        E-mail
        <input
          className="auth-input"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </label>

      <label className="auth-label">
        Senha
        <input
          className="auth-input"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
      </label>

      {error && <p className="auth-error">{error}</p>}

      <button className="btn btn-primary auth-submit" type="submit" disabled={submitting}>
        {submitting ? "Aguenta aí..." : mode === "login" ? "Entrar" : "Criar conta"}
      </button>

      <div className="auth-divider">ou</div>

      <button type="button" className="btn btn-google" onClick={handleGoogleLogin}>
        <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
          <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.3-1.7 3.8-5.5 3.8-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3 14.7 2 12 2 6.9 2 2.7 6.1 2.7 11.2S6.9 20.4 12 20.4c6.9 0 8.9-4.8 8.9-7.3 0-.5 0-.9-.1-1.3H12z"/>
        </svg>
        Continuar com Google
      </button>
    </form>
  );
}
