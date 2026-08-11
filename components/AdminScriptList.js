"use client";

import { useActionState, useEffect, useState } from "react";
import { deleteScript } from "../app/admin/actions";
import { useToasts, ToastStack } from "./Toast";

export default function AdminScriptList({ scripts }) {
  const [state, formAction, pending] = useActionState(deleteScript, {});
  const { toasts, pushToast, dismiss } = useToasts();
  const [confirmSlug, setConfirmSlug] = useState(null);

  useEffect(() => {
    if (state?.success) {
      pushToast("success", `"${state.name}" apagado.`);
      setConfirmSlug(null);
    } else if (state?.error) {
      pushToast("error", state.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (scripts.length === 0) {
    return <p className="admin-note">Nenhum script cadastrado ainda.</p>;
  }

  return (
    <>
      <ToastStack toasts={toasts} onDismiss={dismiss} />
      <div className="admin-script-list">
        {scripts.map((s) => (
          <div className="admin-script-row" key={s.slug}>
            <span className="admin-script-row-name">{s.name}</span>

            {confirmSlug === s.slug ? (
              <form action={formAction} className="admin-script-row-confirm">
                <input type="hidden" name="slug" value={s.slug} />
                <button type="submit" className="admin-script-row-confirm-btn" disabled={pending}>
                  {pending ? "Apagando..." : "Confirmar"}
                </button>
                <button
                  type="button"
                  className="admin-script-row-cancel-btn"
                  onClick={() => setConfirmSlug(null)}
                  disabled={pending}
                >
                  Cancelar
                </button>
              </form>
            ) : (
              <button
                type="button"
                className="admin-script-row-delete"
                onClick={() => setConfirmSlug(s.slug)}
                aria-label={`Apagar ${s.name}`}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
