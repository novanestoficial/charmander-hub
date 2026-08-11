"use client";

export default function CopyButton({ command }) {
  function handleClick(e) {
    const btn = e.currentTarget;
    const announce = document.getElementById("copy-announce");
    const original = btn.textContent;

    function done(ok) {
      btn.textContent = ok ? "Copiado" : "Falhou, tenta de novo";
      btn.classList.toggle("copied", ok);
      if (announce) {
        announce.textContent = ok
          ? "Comando copiado pra área de transferência"
          : "Não deu pra copiar o comando";
      }
      if (ok) {
        fetch("/api/track-copy", { method: "POST" }).catch(() => {});
      }
      setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove("copied");
      }, 1600);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(command).then(
        () => done(true),
        () => done(false)
      );
    } else {
      const ta = document.createElement("textarea");
      ta.value = command;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        done(true);
      } catch (err) {
        done(false);
      }
      document.body.removeChild(ta);
    }
  }

  return (
    <button
      className="btn btn-primary detail-copy"
      type="button"
      onClick={handleClick}
    >
      Copiar comando
    </button>
  );
}
