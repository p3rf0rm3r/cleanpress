"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

interface CommandeData {
  ticket: string;
  statut: string;
  dateDepot: string;
  dateRetrait: string;
  dateRemise: string;
  montantTotal: string;
  clientNom: string;
  clientPrenom: string;
  totalPaye: string;
}

export default function SuiviPage() {
  const [ticket, setTicket] = useState("");
  const [commande, setCommande] = useState<CommandeData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCommande(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/suivi/${encodeURIComponent(ticket.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ticket non trouvé.");
        return;
      }

      setCommande(data.commande as CommandeData);
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const statuts = ["deposee", "en_traitement", "prete", "remise"];
  const statutLabels: Record<string, string> = {
    deposee: "Déposée",
    en_traitement: "En traitement",
    prete: "Prête",
    remise: "Remise",
  };
  const statutDates: Record<string, string> = {};

  if (commande) {
    statutDates["deposee"] = commande.dateDepot;
    statutDates["en_traitement"] =
      statuts.indexOf(commande.statut) >= 1 ? commande.dateDepot : "";
    statutDates["prete"] =
      statuts.indexOf(commande.statut) >= 2 ? commande.dateRetrait : "";
    statutDates["remise"] = commande.dateRemise || "";
  }

  const currentIdx = commande ? statuts.indexOf(commande.statut) : -1;

  return (
    <>
      <Navbar />

      <section className="section">
        <div className="section-inner" style={{ maxWidth: 700 }}>
          <div className="section-header">
            <div className="sur-titre" style={{ justifyContent: "center" }}>
              SUIVI DE COMMANDE
            </div>
            <h2>
              Suivre votre{" "}
              <span className="accent-serif">commande</span>
            </h2>
            <p>Entrez votre numéro de ticket pour connaître l&apos;état de votre commande.</p>
          </div>

          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.75rem" }}>
              <input
                type="text"
                className="form-input"
                placeholder="Ex : CP-2026-000001"
                value={ticket}
                onChange={(e) => setTicket(e.target.value)}
                required
                style={{ flex: 1, fontFamily: "'Courier New', monospace", fontWeight: 600 }}
              />
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Recherche..." : "Rechercher"}
              </button>
            </form>
          </div>

          {error && <div className="flash flash-error">{error}</div>}

          {commande && (
            <div className="card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "1.5rem",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--secondaire)" }}>
                    Numéro de ticket
                  </div>
                  <div className="ticket-number" style={{ fontSize: "1.5rem" }}>
                    {commande.ticket}
                  </div>
                </div>
                <span className={`badge badge-${commande.statut}`}>
                  {statutLabels[commande.statut]}
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: "1rem",
                  marginBottom: "2rem",
                  padding: "1rem",
                  background: "var(--fond)",
                  borderRadius: "12px",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--secondaire)" }}>Client</div>
                  <div style={{ fontWeight: 600 }}>
                    {commande.clientPrenom} {commande.clientNom}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--secondaire)" }}>Montant</div>
                  <div style={{ fontWeight: 600 }}>{Number(commande.montantTotal).toLocaleString("fr-FR")} FCFA</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--secondaire)" }}>Retrait prévu</div>
                  <div style={{ fontWeight: 600 }}>
                    {new Date(commande.dateRetrait).toLocaleDateString("fr-FR")}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <h3 style={{ fontSize: "1rem", marginBottom: "1.25rem" }}>Progression</h3>
              <div className="timeline">
                {statuts.map((s, i) => {
                  let cls = "pending";
                  if (i < currentIdx) cls = "done";
                  if (i === currentIdx) cls = "active";

                  return (
                    <div key={s} className={`timeline-item ${cls}`}>
                      <div className="timeline-dot" />
                      <div className="timeline-title">{statutLabels[s]}</div>
                      <div className="timeline-date">
                        {cls === "done" || cls === "active"
                          ? statutDates[s]
                            ? new Date(statutDates[s]).toLocaleDateString("fr-FR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "En cours"
                          : "En attente"}
                      </div>
                    </div>
                  );
                })}
              </div>

              {commande.statut === "remise" && (
                <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--bordure)" }}>
                  <Link href={`/suivi/${commande.ticket}`} className="btn btn-secondary">
                    ⭐ Noter ce service
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}