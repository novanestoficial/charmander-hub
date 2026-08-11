import { notFound, redirect } from "next/navigation";
import { getSupabaseServerClient, getCoverUrl } from "../../../lib/supabase/server";
import CopyButton from "../../../components/CopyButton";
import ScriptBadges from "../../../components/ScriptBadges";
import LikeButton from "../../../components/LikeButton";
import SiteHeader from "../../../components/SiteHeader";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const supabase = await getSupabaseServerClient();
  const { data: script } = await supabase
    .from("scripts")
    .select("name, meta_description")
    .eq("slug", slug)
    .single();

  if (!script) return {};

  return {
    title: `${script.name} — CHARMANDER SCRIPTS`,
    description: script.meta_description,
  };
}

export default async function ScriptDetailPage({ params }) {
  const { slug } = await params;
  const supabase = await getSupabaseServerClient();
  const { data: script } = await supabase
    .from("scripts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!script) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/scripts/${slug}`);
  }

  await supabase.rpc("increment_views", { p_slug: slug });
  const views = script.views + 1;

  const coverUrl = getCoverUrl(supabase, script.cover_path);
  const categoryLabel = script.categories.includes("desastre") ? "Desastre" : script.categories[0];

  let hasAccess = !script.is_paid;
  if (script.is_paid) {
    const { data: purchase } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    hasAccess = !!purchase;
  }

  const { data: likeRow } = await supabase
    .from("script_likes")
    .select("id")
    .eq("script_id", script.id)
    .maybeSingle();
  const liked = !!likeRow;

  let purchaseCount = 0;
  if (script.is_paid && !hasAccess) {
    const { data } = await supabase.rpc("get_purchase_count");
    purchaseCount = data || 0;
  }

  const nf = new Intl.NumberFormat("pt-BR");

  return (
    <>
      <SiteHeader logoHref="/" backHref="/#catalogo" />

      <main>
        <div className="wrap detail-wrap">
          <p className="eyebrow">{categoryLabel} — {script.origin}</p>
          <div className="detail-title-row">
            <h1 className="detail-title">{script.name}</h1>
            <ScriptBadges script={script} />
            <LikeButton slug={slug} initialLiked={liked} />
          </div>

          <div className="detail-meta">
            <span className="pill pill-nova">Nova</span>
            <span className="detail-tag">{script.tag}</span>
          </div>

          <div className="detail-desc">
            <p>{script.description}</p>
          </div>

          <div className="detail-cover-wrap">
            <img
              className="detail-cover"
              src={coverUrl}
              alt={script.name}
              loading="lazy"
              decoding="async"
              width="480"
              height="270"
            />
            <span className="stats-overlay stat-views">👁 {views}</span>
          </div>

          {hasAccess ? (
            <>
              <div className="code-block">
                <span className="code-block-lang">lua</span>
                <pre className="code-block-body"><code>{script.copy_command}</code></pre>
              </div>
              <CopyButton command={script.copy_command} />
            </>
          ) : (
            <div className="paywall">
              <p className="paywall-eyebrow">Acesso premium &middot; sem key</p>
              <h2 className="paywall-title">Destrava o {script.name} agora</h2>
              <p className="paywall-lede">
                Ele faz parte do pacote pago — e o pacote é um só: pagando uma vez você leva o EXPLHUB NDS{" "}
                <strong>e</strong> o SCRIPT DA VOADORA juntos, pra sempre.
              </p>

              <ul className="offer-benefits">
                <li className="offer-benefit">
                  <span className="offer-check" aria-hidden="true">✓</span>
                  <div>
                    <b>Sem key. Nunca.</b>
                    <span>Zero linkvertise, zero contador de 30 segundos, zero captcha. Nada entre você e o script.</span>
                  </div>
                </li>
                <li className="offer-benefit">
                  <span className="offer-check" aria-hidden="true">✓</span>
                  <div>
                    <b>Copiar e colar, só isso</b>
                    <span>O comando aparece aqui mesmo com um botão de copiar. Cola no seu executor e tá rodando.</span>
                  </div>
                </li>
                <li className="offer-benefit">
                  <span className="offer-check" aria-hidden="true">✓</span>
                  <div>
                    <b>Diversão garantida</b>
                    <span>Voadora, soco, chute, velocidade, pulo infinito, FPS boost — o caos que aparece nos meus vídeos.</span>
                  </div>
                </li>
                <li className="offer-benefit">
                  <span className="offer-check" aria-hidden="true">✓</span>
                  <div>
                    <b>Paga uma vez e acabou</b>
                    <span>R$ 4,99 pelos dois juntos. Não é assinatura, não vence e não renova.</span>
                  </div>
                </li>
              </ul>

              <div className="offer-proof">
                <span className="offer-proof-item">
                  <b>{nf.format(views)}</b> visualizações aqui
                </span>
                <span className="offer-proof-item">
                  <b>{nf.format(script.likes || 0)}</b> curtidas
                </span>
                {purchaseCount > 0 && (
                  <span className="offer-proof-item">
                    <b>{nf.format(purchaseCount)}</b>{" "}
                    {purchaseCount === 1 ? "já destravou o pacote" : "já destravaram o pacote"}
                  </span>
                )}
              </div>

              <div className="offer-buy">
                <p className="paywall-price">R$ 4,99</p>
                <p className="paywall-price-note">pagamento único &middot; os 2 scripts &middot; sem mensalidade</p>
                <a className="btn btn-primary auth-submit" href={`/api/checkout?next=/scripts/${slug}`}>
                  Destravar os 2 por R$ 4,99
                </a>
                <p className="offer-note">
                  Assim que o pagamento cair, o comando aparece nessa página — e o outro script também destrava.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer>
        <div className="wrap footer-inner">
          <span>&copy; 2026 CHARMANDER SCRIPTS.</span>
          <a className="detail-back" href="/#catalogo">&larr; Voltar ao catálogo</a>
        </div>
      </footer>
    </>
  );
}
