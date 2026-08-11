"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DURATION = 4500;
const EXIT_MS = 320;

export function useToasts() {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => {
      setToasts((list) => list.filter((t) => t.id !== id));
    }, EXIT_MS);
  }, []);

  const pushToast = useCallback((type, message) => {
    if (!message) return;
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((list) => [...list, { id, type, message, leaving: false }]);
  }, []);

  return { toasts, pushToast, dismiss };
}

export function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
}

function ToastCard({ toast, onDismiss }) {
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(onDismiss, DURATION);
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`toast-card toast-${toast.type}${toast.leaving ? " is-leaving" : ""}`}
      role="alert"
    >
      <span className="toast-icon" aria-hidden="true">
        {toast.type === "success" ? (
          <svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        ) : (
          <svg viewBox="0 0 24 24"><path d="M12 8v5M12 16.5h.01" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        )}
      </span>
      <p className="toast-message">{toast.message}</p>
      <button type="button" className="toast-close" onClick={onDismiss} aria-label="Fechar aviso">
        <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
      </button>
      <div className="toast-bar-track">
        <div className="toast-bar" style={{ animationDuration: `${DURATION}ms` }} />
      </div>
    </div>
  );
}
