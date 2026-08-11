"use client";

import { useEffect, useRef, useState } from "react";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB — mesmo limite validado no server action

export default function ImageDropzone({ name, onFileChange }) {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [sizeError, setSizeError] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function applyFile(file) {
    if (!file || !file.type.startsWith("image/")) return;

    if (file.size > MAX_BYTES) {
      setSizeError(`Imagem muito grande (${(file.size / 1024 / 1024).toFixed(1)}MB) — máximo de 8MB.`);
      return;
    }
    setSizeError("");

    const dt = new DataTransfer();
    dt.items.add(file);
    if (inputRef.current) inputRef.current.files = dt.files;

    const url = URL.createObjectURL(file);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    setFileName(file.name);
    onFileChange?.(file, url);
  }

  function handlePaste(e) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          applyFile(file);
          e.preventDefault();
        }
        break;
      }
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) applyFile(file);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      inputRef.current?.click();
    }
  }

  return (
    <>
    <div
      className={`image-dropzone${dragOver ? " is-dragover" : ""}${previewUrl ? " has-image" : ""}`}
      role="button"
      tabIndex={0}
      aria-label={previewUrl ? `Imagem selecionada: ${fileName}. Clica pra trocar.` : "Escolher imagem de capa"}
      onClick={() => inputRef.current?.click()}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        className="image-dropzone-input"
        type="file"
        name={name}
        accept="image/*"
        tabIndex={-1}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) applyFile(file);
        }}
      />

      {previewUrl ? (
        <div className="image-dropzone-filled">
          <img className="image-dropzone-thumb" src={previewUrl} alt="" />
          <div className="image-dropzone-overlay">
            <svg className="image-dropzone-icon-sm" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 16.5V19a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2.5M7 9l5-5 5 5M12 4v12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Trocar imagem</span>
          </div>
        </div>
      ) : (
        <div className="image-dropzone-empty">
          <svg className="image-dropzone-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 16.5V19a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 9l5-5 5 5M12 4v12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="image-dropzone-text">Clica, arrasta ou cola (Ctrl+V) uma imagem</p>
        </div>
      )}
    </div>
    {sizeError && <p className="auth-error">{sizeError}</p>}
    </>
  );
}
