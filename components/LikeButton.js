"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "../lib/supabase/client";

export default function LikeButton({ slug, initialLiked = false }) {
  const [liked, setLiked] = useState(initialLiked);
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (busy) return;
    setBusy(true);

    const nextLiked = !liked;
    setLiked(nextLiked);

    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.rpc("toggle_like", { p_slug: slug });
    const row = Array.isArray(data) ? data[0] : data;

    if (error || !row) {
      setLiked(!nextLiked);
    } else {
      setLiked(row.liked);
    }
    setBusy(false);
  }

  return (
    <button
      type="button"
      className={`like-button-lg${liked ? " liked" : ""}`}
      onClick={handleClick}
      disabled={busy}
      aria-pressed={liked}
      aria-label={liked ? "Remover dos favoritos" : "Curtir e favoritar esse script"}
    >
      <span className="like-button-icon" aria-hidden="true">{liked ? "❤️" : "🤍"}</span>
      <span className="like-button-label">{liked ? "Curtido" : "Curtir"}</span>
    </button>
  );
}
