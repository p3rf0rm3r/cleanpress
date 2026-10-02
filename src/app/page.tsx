import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* ─── Hero Section ──────────────────────────────── */}
      <section className="hero-section">
        <div className="hero-container">
          <div>
            <div className="hero-badge">✦ Gestion textile intelligente</div>
            <h1 className="hero-title">
              Votre linge mérite une attention{" "}
              <span className="accent-serif">impeccable.</span>
            </h1>
            <p className="hero-desc">
              CleanPress prend soin de vos vêtements, de la réception au dernier
              pli. Suivez votre commande en temps réel avec votre ticket.
            </p>
            <div className="hero-actions">
              <Link href="/suivi" className="btn btn-primary btn-lg">
                🔍 Suivre mon ticket
              </Link>
              <Link href="/services" className="btn btn-secondary btn-lg">
                Nos services
              </Link>
            </div>
          </div>

          {/* Illustration */}
          <div className="hero-illustration">
            <div className="hero-mint-oval" />
            <div className="hero-mint-oval" />
            <div className="hero-mint-oval" />
            <div className="hero-card-main">
              <div className="logo-text">CLEANPRESS</div>
              <div className="signature">Votre signature</div>
              <div className="year">Depuis 2026</div>
              <div
                style={{
                  marginTop: "2rem",
                  display: "flex",
                  gap: "0.5rem",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.4)",
                  }}
                />
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.2)",
                  }}
                />
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.2)",
                  }}
                />
              </div>
            </div>
            <div className="hero-card-back" />
            <div className="hero-badge-float">
              <span className="check">✓</span> Qualité contrôlée – À chaque
              étape
            </div>
            <div className="hero-badge-float">
              <span style={{ color: "#22695A" }}>◷</span> Suivi en temps réel –
              Avec votre ticket
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section Notre savoir-faire ────────────────── */}
      <section className="section" style={{ background: "white" }}>
        <div className="section-inner">
          <div className="section-header">
            <div className="sur-titre" style={{ justifyContent: "center" }}>
              NOTRE SAVOIR-FAIRE
            </div>
            <h2>
              Une attention juste,{" "}
              <span className="accent-serif">à chaque fibre.</span>
            </h2>
            <p>
              Trois piliers d&apos;excellence pour vos textiles, du dépôt à la
              remise.
            </p>
          </div>

          <div className="grid-3">
            {/* Service 1 */}
            <div className="service-card">
              <div className="service-card-num">01</div>
              <div className="service-card-icon">✦</div>
              <h3>Nettoyage à sec</h3>
              <p>
                Procédé doux sans eau pour les tissus délicats : laine, soie,
                costumes et robes. Vos pièces retrouvent éclat et fraîcheur.
              </p>
            </div>

            {/* Service 2 */}
            <div className="service-card">
              <div className="service-card-num">02</div>
              <div className="service-card-icon">✦</div>
              <h3>Lavage & soin</h3>
              <p>
                Lavage professionnel adapté à chaque textile. Détergents
                hypoallergéniques, rinçage impeccable et pliage soigné.
              </p>
            </div>

            {/* Service 3 */}
            <div className="service-card">
              <div className="service-card-num">03</div>
              <div className="service-card-icon">✦</div>
              <h3>Repassage expert</h3>
              <p>
                Repassage vapeur haute précision pour des vêtemnets sans pli.
                Chemises, pantalons, robes — chaque détail compte.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section CTA ──────────────────────────────── */}
      <section className="section">
        <div className="section-inner">
          <div
            className="card"
            style={{
              background: "linear-gradient(135deg, #1B3D33 0%, #22695A 100%)",
              color: "white",
              textAlign: "center",
              padding: "3rem 2rem",
              border: "none",
            }}
          >
            <h2
              style={{
                color: "white",
                fontSize: "clamp(1.5rem, 3vw, 2rem)",
                marginBottom: "1rem",
              }}
            >
              Prêt à confier vos vêtements ?
            </h2>
            <p
              style={{
                opacity: 0.8,
                maxWidth: 500,
                margin: "0 auto 1.5rem",
                fontSize: "1.0625rem",
              }}
            >
              Déposez en ligne ou directement au comptoir. Votre ticket vous
              permet de suivre chaque étape.
            </p>
            <div
              style={{
                display: "flex",
                gap: "0.875rem",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Link
                href="/depot-en-ligne"
                className="btn btn-lg"
                style={{ background: "white", color: "#1B3D33" }}
              >
                Déposer en ligne
              </Link>
              <Link
                href="/suivi"
                className="btn btn-lg"
                style={{
                  background: "transparent",
                  color: "white",
                  border: "2px solid rgba(255,255,255,0.3)",
                }}
              >
                Suivre mon ticket
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}