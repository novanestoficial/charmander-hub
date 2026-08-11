"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "../../lib/supabase/server";
import { getSupabaseAdminClient } from "../../lib/supabase/admin";
import { ADMIN_EMAIL } from "../../lib/admin";
import { slugify } from "../../lib/slugify";

const COVERS_BUCKET = "script-covers";
const MAX_COVER_BYTES = 8 * 1024 * 1024; // 8MB — abaixo do limite de 10mb da server action

export async function createScript(prevState, formData) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    return { error: "Não autorizado." };
  }

  const name = formData.get("name")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const copyCommand = formData.get("copy_command")?.toString().trim();
  const isPaid = formData.get("is_paid") === "on";
  const hasKey = formData.get("has_key") === "on";
  const cover = formData.get("cover");
  const existingCategories = formData.getAll("categories").map((c) => c.toString());
  const newCategoryRaw = formData.get("new_category")?.toString().trim();
  const newCategorySlug = newCategoryRaw ? slugify(newCategoryRaw) : "";
  const categories = [...new Set([...existingCategories, newCategorySlug].filter(Boolean))];

  if (!name || !description || !copyCommand) {
    return { error: "Preenche título, descrição e o loadstring." };
  }
  if (!cover || typeof cover === "string" || cover.size === 0) {
    return { error: "Escolhe uma imagem de capa." };
  }
  if (cover.size > MAX_COVER_BYTES) {
    return { error: `Imagem muito grande (${(cover.size / 1024 / 1024).toFixed(1)}MB) — máximo de 8MB.` };
  }

  try {
    const admin = getSupabaseAdminClient();

    const base = slugify(name) || "script";
    let slug = base;
    let suffix = 1;
    while (true) {
      const { data: existing } = await admin.from("scripts").select("id").eq("slug", slug).maybeSingle();
      if (!existing) break;
      suffix += 1;
      slug = `${base}-${suffix}`;
    }

    const ext = (cover.name.split(".").pop() || "jpg").toLowerCase();
    const coverFilename = `${slug}.${ext}`;
    const buffer = Buffer.from(await cover.arrayBuffer());

    const { error: uploadError } = await admin.storage
      .from(COVERS_BUCKET)
      .upload(coverFilename, buffer, {
        contentType: cover.type || "image/jpeg",
        upsert: true,
      });
    if (uploadError) {
      return { error: `Erro ao enviar a imagem: ${uploadError.message}` };
    }

    const { data: maxRow } = await admin
      .from("scripts")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const sortOrder = (maxRow?.sort_order ?? 0) + 1;

    const shortDesc = description.length > 120 ? `${description.slice(0, 117)}...` : description;

    const { error: insertError } = await admin.from("scripts").insert({
      slug,
      name,
      tag: "Lua",
      description,
      meta_description: `${name} — ${shortDesc}`,
      copy_command: copyCommand,
      cover_path: coverFilename,
      categories,
      is_paid: isPaid,
      has_key: hasKey,
      origin: "script pessoal",
      sort_order: sortOrder,
    });
    if (insertError) {
      return { error: `Erro ao salvar o script: ${insertError.message}` };
    }

    revalidatePath("/admin");
    revalidatePath("/");

    return { success: true, name };
  } catch (err) {
    console.error("createScript failed:", err);
    return { error: `Algo deu errado ao salvar: ${err?.message || "erro desconhecido"}.` };
  }
}

export async function deleteScript(prevState, formData) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    return { error: "Não autorizado." };
  }

  const slug = formData.get("slug")?.toString();
  if (!slug) {
    return { error: "Script inválido." };
  }

  try {
    const admin = getSupabaseAdminClient();

    const { data: script } = await admin
      .from("scripts")
      .select("name, cover_path")
      .eq("slug", slug)
      .maybeSingle();

    const { error: deleteError } = await admin.from("scripts").delete().eq("slug", slug);
    if (deleteError) {
      return { error: `Erro ao apagar: ${deleteError.message}` };
    }

    if (script?.cover_path) {
      await admin.storage.from(COVERS_BUCKET).remove([script.cover_path]);
    }

    revalidatePath("/admin");
    revalidatePath("/");

    return { success: true, name: script?.name || slug };
  } catch (err) {
    console.error("deleteScript failed:", err);
    return { error: `Algo deu errado ao apagar: ${err?.message || "erro desconhecido"}.` };
  }
}
