import { getSupabaseServerClient, getCoverUrl } from "../lib/supabase/server";
import CatalogGrid from "../components/CatalogGrid";
import SiteHeader from "../components/SiteHeader";
import BundleCtaButton from "../components/BundleCtaButton";

const HERO_IMAGES = [1, 2, 3, 4, 5, 6, 7].map((n) => ({
  src: `/hero/hero-${n}.jpg`,
  positionClass: `t${n}`,
}));

export default async function HomePage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data } = await supabase
    .from("scripts")
    .select("*")
    .order("sort_order", { ascending: true });

  const scripts = (data || []).map((script) => ({
    ...script,
    coverUrl: getCoverUrl(supabase, script.cover_path),
  }));

  const categories = [...new Set(scripts.flatMap((s) => s.categories || []))].sort();

  let hasBundleAccess = false;
  if (user) {
    const { data: purchase } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    hasBundleAccess = !!purchase;
  }

  const bundleScripts = ["explhub", "dropkick"]
    .map((slug) => scripts.find((s) => s.slug === slug))
    .filter(Boolean);

  const { data: purchaseCount } = await supabase.rpc("get_purchase_count");

  // prova social real: só o que já existe no banco (views/likes dos 2 pagos + nº de compras)
  const nf = new Intl.NumberFormat("pt-BR");
  const bundleViews = bundleScripts.reduce((sum, s) => sum + (s.views || 0), 0);
  const bundleLikes = bundleScripts.reduce((sum, s) => sum + (s.likes || 0), 0);
  const buyers = purchaseCount || 0;

  return (
    <>
      <SiteHeader logoHref="#topo" />

      <main id="topo">
        <section className="hero">
          <div className="hero-thumbs" aria-hidden="true">
            {HERO_IMAGES.map((img) => (
              <img
                key={img.src}
                className={`hero-thumb ${img.positionClass}`}
                src={img.src}
                alt=""
              />
            ))}
          </div>
          <div className="hero-content">
            <p className="eyebrow">Hub de scripts &mdash; acesso direto</p>
            <h1>CHARMANDER SCRIPTS</h1>
            <p className="lede">
              Os mesmos scripts que eu uso pra gravar os vídeos. Copia, cola no seu executor e já tá rodando.
            </p>
            <div className="hero-ctas">
              <a className="btn btn-primary" href="#catalogo">Ver scripts</a>
            </div>
          </div>
        </section>

        {!hasBundleAccess && bundleScripts.length === 2 && (
          <div className="featured-cards">
            <div className="wrap bundle-panel">
              <p className="bundle-eyebrow">Pacote premium &middot; sem key</p>
              <h2 className="bundle-title">Os 2 scripts pagos, destravados de uma vez</h2>
              <p className="bundle-sub">
                São os dois que eu mais uso pra gravar. Paga uma vez, ficam salvos na sua conta pra sempre.
              </p>
              <div className="bundle-cards">
                {bundleScripts.map((s) => (
                  <article className="card card-simple" key={s.slug}>
                    <a className="card-link" href={`/scripts/${s.slug}`}>
                      <div className="card-cover-wrap">
                        <img
                          className="card-cover"
                          src={s.coverUrl}
                          alt={s.name}
                          loading="lazy"
                          decoding="async"
                          width="480"
                          height="240"
                        />
                      </div>
                      <div className="card-name-row">
                        <span className="card-name">{s.name}</span>
                      </div>
                    </a>
                  </article>
                ))}
              </div>

              <ul className="offer-benefits">
                <li className="offer-benefit">
                  <span className="offer-check" aria-hidden="true">✓</span>
                  <div>
                    <b>Sem key. Nunca.</b>
                    <span>Zero linkvertise, zero contador de 30 segundos, zero captcha. Você entra e o comando já tá ali.</span>
                  </div>
                </li>
                <li className="offer-benefit">
                  <span className="offer-check" aria-hidden="true">✓</span>
                  <div>
                    <b>Copiar e colar, só isso</b>
                    <span>Um clique pra copiar, cola no seu executor e roda. Nada pra instalar, nada pra configurar.</span>
                  </div>
                </li>
                <li className="offer-benefit">
                  <span className="offer-check" aria-hidden="true">✓</span>
                  <div>
                    <b>Diversão garantida</b>
                    <span>Voadora, soco, chute, velocidade, pulo infinito, FPS boost e vários outros dentro do EXPLHUB. É o caos dos meus vídeos na sua mão.</span>
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
                  <b>{nf.format(bundleViews)}</b> visualizações nos 2
                </span>
                <span className="offer-proof-item">
                  <b>{nf.format(bundleLikes)}</b> curtidas
                </span>
                {buyers > 0 && (
                  <span className="offer-proof-item">
                    <b>{nf.format(buyers)}</b> {buyers === 1 ? "já destravou" : "já destravaram"}
                  </span>
                )}
              </div>

              <div className="offer-buy">
                <p className="bundle-price">R$ 4,99</p>
                <p className="bundle-price-note">pagamento único &middot; os 2 scripts &middot; pra sempre</p>
                <BundleCtaButton href="/api/checkout?next=/">Destravar os 2 por R$ 4,99</BundleCtaButton>
                <p className="offer-note">Acesso liberado na sua conta assim que o pagamento cair.</p>
              </div>
            </div>
          </div>
        )}

        <section id="catalogo">
          <div className="wrap">
            <div className="section-head">
              <div>
                <p className="eyebrow">scripts</p>
                <h2>Scripts prontos pra rodar</h2>
              </div>
            </div>

            <CatalogGrid scripts={scripts} locked={!user} categories={categories} />

            <p className="coming-soon">🔥 Mais scripts chegando em breve — fica de olho.</p>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap footer-inner">
          <span>&copy; 2026 CHARMANDER &mdash; hub de scripts.</span>
        </div>
      </footer>
    </>
  );
}
