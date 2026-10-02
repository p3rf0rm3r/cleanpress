"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

interface Article {
  id: number;
  description: string;
  quantite: number;
  prixUnitaire: string;
  sousTotal: string;
  statut: string;
  serviceNom: string;
}

interface Paiement {
  id: number;
  mode: string;
  montant: string;
  reference: string;
  datePaiement: string;
}

interface Facture {
  id: number;
  numero: string;
  montant: string;
  dateFacture: string;
}

interface CommandeDetail {
  id: number;
  ticket: string;
  statut: string;
  dateDepot: string;
  dateRetrait: string;
  dateRemise: string;
  montantTotal: string;
  clientNom: string;
  clientPrenom: string;
  clientTelephone: string;
  clientEmail: string;
  clientId: number;
  siteId: number;
  siteNom: string;
}

const statutLabels: Record<string, string> = {
  deposee: "Déposée",
  en_traitement: "En traitement",
  prete: "Prête",
  remise: "Remise",
};

export default function CommandeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [commande, setCommande] = useState<CommandeDetail | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(true);

  // Payment form
  const [showPaiement, setShowPaiement] = useState(false);
  const [payMode, setPayMode] = useState("especes");
  const [payMontant, setPayMontant] = useState("");
  const [payRef, setPayRef] = useState("");
  const [payError, setPayError] = useState("");
  const [payLoading, setPayLoading] = useState(false);

  // Print refs
  const ticketRef = useRef<HTMLDivElement>(null);
  const factureRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/commandes/${id}`);
      const data = await res.json();
      setCommande(data.commande as CommandeDetail);
      setArticles((data.articles || []) as Article[]);
      setPaiements((data.paiements || []) as Paiement[]);
      setFactures((data.factures || []) as Facture[]);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const totalPaye = paiements.reduce((s, p) => s + Number(p.montant), 0);
  const resteAPayer = commande ? Number(commande.montantTotal) - totalPaye : 0;
  const isPaid = resteAPayer <= 0;

  const handlePaiement = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayError("");
    setPayLoading(true);

    try {
      const res = await fetch("/api/paiements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commandeId: Number(id),
          mode: payMode,
          montant: Number(payMontant),
          reference: payRef || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPayError(data.error || "Erreur de paiement.");
        return;
      }

      setShowPaiement(false);
      setPayMontant("");
      setPayRef("");
      fetchData();
    } catch {
      setPayError("Erreur réseau.");
    } finally {
      setPayLoading(false);
    }
  };

  const handleRemise = async () => {
    if (!confirm("Confirmer la remise des vêtements au client ?")) return;

    const res = await fetch(`/api/commandes/${id}/statut`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: "remise" }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error);
      return;
    }

    fetchData();
  };

  const handlePrintTicket = () => {
    const content = ticketRef.current;
    if (!content) return;
    const w = window.open("", "_blank", "width=400,height=600");
    if (!w) return;
    w.document.write(`
      <html><head><title>Ticket ${commande?.ticket}</title>
      <style>
        body { font-family: 'Courier New', monospace; padding: 20px; font-size: 13px; }
        .header { text-align: center; margin-bottom: 15px; border-bottom: 2px dashed #ccc; padding-bottom: 10px; }
        .header h1 { font-size: 18px; margin: 0; }
        .header p { margin: 2px 0; color: #666; }
        .ticket { font-size: 16px; font-weight: bold; text-align: center; margin: 10px 0; padding: 8px; border: 2px solid #1B3D33; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        td, th { padding: 4px 8px; text-align: left; border-bottom: 1px dashed #ddd; font-size: 12px; }
        .total { font-weight: bold; font-size: 14px; }
        .footer { text-align: center; margin-top: 15px; border-top: 2px dashed #ccc; padding-top: 10px; font-size: 11px; color: #999; }
      </style></head><body>
      ${content.innerHTML}
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  const handlePrintFacture = (facture: Facture) => {
    const content = factureRef.current;
    if (!content) return;
    const w = window.open("", "_blank", "width=600,height=800");
    if (!w) return;
    w.document.write(`
      <html><head><title>Facture ${facture.numero}</title>
      <style>
        body { font-family: 'Inter', sans-serif; padding: 40px; color: #14231D; }
        .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: 800; }
        .logo span { color: #22695A; }
        .facture-num { font-size: 18px; font-weight: 700; color: #22695A; }
        .client-info { margin-bottom: 20px; }
        .client-info h3 { font-size: 14px; color: #5F6E67; text-transform: uppercase; margin-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #F4F6F3; padding: 10px; text-align: left; font-size: 12px; text-transform: uppercase; color: #5F6E67; border-bottom: 2px solid #E4E8E4; }
        td { padding: 10px; border-bottom: 1px solid #E4E8E4; }
        .total-row { font-weight: 800; font-size: 16px; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #5F6E67; border-top: 1px solid #E4E8E4; padding-top: 15px; }
      </style></head><body>
      <div class="header">
        <div class="logo">Clean<span>Press</span></div>
        <div style="text-align:right">
          <div class="facture-num">${facture.numero}</div>
          <div style="color:#5F6E67">Date : ${new Date(facture.dateFacture).toLocaleDateString("fr-FR")}</div>
        </div>
      </div>
      ${content.innerHTML}
      <div class="footer">
        <p>Merci pour votre confiance.</p>
        <p>CleanPress – Le soin textile, avec clarté.</p>
      </div>
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  if (!commande) {
    return (
      <div className="main-body">
        <div className="empty-state">
          <h3>Commande non trouvée</h3>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="main-header">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => router.back()}
          >
            ← Retour
          </button>
          <div>
            <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span className="ticket-number">{commande.ticket}</span>
              <span className={`badge badge-${commande.statut}`}>
                {statutLabels[commande.statut]}
              </span>
            </h1>
            <p className="page-subtitle">
              {commande.clientPrenom} {commande.clientNom} — {commande.siteNom}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="btn btn-primary btn-sm" onClick={handlePrintTicket}>
            🖨️ Imprimer ticket
          </button>
        </div>
      </div>

      <div className="main-body">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "1.5rem" }}>
          {/* Colonne principale */}
          <div>
            {/* Articles */}
            <div className="card" style={{ marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, marginBottom: "1rem" }}>
                Articles
              </h2>
              <div className="table-container" style={{ border: "none" }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Description</th>
                      <th style={{ textAlign: "center" }}>Qté</th>
                      <th style={{ textAlign: "right" }}>Prix unit.</th>
                      <th style={{ textAlign: "right" }}>Sous-total</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map((art) => (
                      <tr key={art.id}>
                        <td style={{ fontWeight: 600 }}>{art.serviceNom}</td>
                        <td style={{ color: "var(--secondaire)" }}>
                          {art.description || "—"}
                        </td>
                        <td style={{ textAlign: "center" }}>{art.quantite}</td>
                        <td style={{ textAlign: "right" }}>
                          {Number(art.prixUnitaire).toLocaleString("fr-FR")} F
                        </td>
                        <td style={{ textAlign: "right", fontWeight: 600 }}>
                          {Number(art.sousTotal).toLocaleString("fr-FR")} F
                        </td>
                        <td>
                          <span className={`badge badge-${art.statut}`}>
                            {statutLabels[art.statut]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div
                style={{
                  textAlign: "right",
                  padding: "1rem",
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  borderTop: "1px solid var(--bordure)",
                }}
              >
                Total : {Number(commande.montantTotal).toLocaleString("fr-FR")} FCFA
              </div>
            </div>

            {/* Paiements & Factures */}
            <div className="card" style={{ marginBottom: "1.25rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <h2 style={{ fontSize: "1.0625rem", fontWeight: 700 }}>
                  Paiements
                </h2>
                {!isPaid && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowPaiement(!showPaiement)}
                  >
                    💳 Encaisser
                  </button>
                )}
              </div>

              {/* Résumé paiement */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "0.75rem",
                  marginBottom: "1rem",
                }}
              >
                <div className="stat-card">
                  <div className="stat-card-label">Total</div>
                  <div className="stat-card-value" style={{ fontSize: "1.25rem" }}>
                    {Number(commande.montantTotal).toLocaleString("fr-FR")} F
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-label">Payé</div>
                  <div
                    className="stat-card-value"
                    style={{ fontSize: "1.25rem", color: "var(--vert-accent)" }}
                  >
                    {totalPaye.toLocaleString("fr-FR")} F
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-label">Reste</div>
                  <div
                    className="stat-card-value"
                    style={{
                      fontSize: "1.25rem",
                      color: isPaid ? "var(--vert-accent)" : "var(--rouge)",
                    }}
                  >
                    {resteAPayer.toLocaleString("fr-FR")} F
                  </div>
                </div>
              </div>

              {/* Formulaire de paiement */}
              {showPaiement && (
                <div
                  style={{
                    background: "var(--vert-clair)",
                    padding: "1.25rem",
                    borderRadius: "12px",
                    marginBottom: "1rem",
                  }}
                >
                  {payError && <div className="flash flash-error">{payError}</div>}
                  <form onSubmit={handlePaiement}>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Mode de paiement</label>
                        <select
                          className="form-select"
                          value={payMode}
                          onChange={(e) => setPayMode(e.target.value)}
                        >
                          <option value="especes">💵 Espèces</option>
                          <option value="mobile_money">📱 Mobile Money</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Montant (FCFA)</label>
                        <input
                          type="number"
                          className="form-input"
                          value={payMontant}
                          onChange={(e) => setPayMontant(e.target.value)}
                          max={resteAPayer}
                          min={1}
                          required
                        />
                      </div>
                    </div>
                    {payMode === "mobile_money" && (
                      <div className="form-group">
                        <label className="form-label">Référence</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Numéro de transaction"
                          value={payRef}
                          onChange={(e) => setPayRef(e.target.value)}
                        />
                      </div>
                    )}
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                      <button type="submit" className="btn btn-primary" disabled={payLoading}>
                        {payLoading ? "Traitement..." : "Valider le paiement"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => {
                          setPayMontant(String(resteAPayer));
                        }}
                      >
                        Payer le reste ({resteAPayer.toLocaleString("fr-FR")} F)
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Liste paiements */}
              {paiements.length > 0 ? (
                <div className="table-container" style={{ border: "none" }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Mode</th>
                        <th>Référence</th>
                        <th style={{ textAlign: "right" }}>Montant</th>
                        <th>Facture</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paiements.map((p) => {
                        const f = factures.find((f) => f.id === p.id) || factures.find(() => true);
                        return (
                          <tr key={p.id}>
                            <td>
                              {new Date(p.datePaiement).toLocaleDateString("fr-FR")}
                            </td>
                            <td>
                              <span className={`badge badge-${p.mode}`}>
                                {p.mode === "especes" ? "💵 Espèces" : "📱 Mobile Money"}
                              </span>
                            </td>
                            <td style={{ color: "var(--secondaire)" }}>
                              {p.reference || "—"}
                            </td>
                            <td style={{ textAlign: "right", fontWeight: 600 }}>
                              {Number(p.montant).toLocaleString("fr-FR")} F
                            </td>
                            <td>
                              {f && (
                                <button
                                  className="btn btn-outline btn-sm"
                                  onClick={() => handlePrintFacture(f)}
                                >
                                  🖨️ {f.numero}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: "var(--secondaire)", fontSize: "0.875rem" }}>
                  Aucun paiement enregistré.
                </p>
              )}
            </div>
          </div>

          {/* Colonne latérale */}
          <div>
            {/* Infos client */}
            <div className="card" style={{ marginBottom: "1.25rem" }}>
              <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                Client
              </h3>
              <div style={{ fontSize: "0.875rem" }}>
                <div style={{ marginBottom: "0.5rem" }}>
                  <span style={{ color: "var(--secondaire)" }}>Nom : </span>
                  <strong>
                    {commande.clientPrenom} {commande.clientNom}
                  </strong>
                </div>
                <div style={{ marginBottom: "0.5rem" }}>
                  <span style={{ color: "var(--secondaire)" }}>Tél : </span>
                  {commande.clientTelephone}
                </div>
                {commande.clientEmail && (
                  <div>
                    <span style={{ color: "var(--secondaire)" }}>Email : </span>
                    {commande.clientEmail}
                  </div>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="card" style={{ marginBottom: "1.25rem" }}>
              <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                Dates
              </h3>
              <div style={{ fontSize: "0.875rem" }}>
                <div style={{ marginBottom: "0.5rem" }}>
                  <span style={{ color: "var(--secondaire)" }}>Dépôt : </span>
                  {new Date(commande.dateDepot).toLocaleDateString("fr-FR")}
                </div>
                <div style={{ marginBottom: "0.5rem" }}>
                  <span style={{ color: "var(--secondaire)" }}>Retrait prévu : </span>
                  <strong>
                    {new Date(commande.dateRetrait).toLocaleDateString("fr-FR")}
                  </strong>
                </div>
                {commande.dateRemise && (
                  <div>
                    <span style={{ color: "var(--secondaire)" }}>Remise : </span>
                    {new Date(commande.dateRemise).toLocaleDateString("fr-FR")}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="card">
              <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                Actions
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {commande.statut === "prete" && isPaid && (
                  <button className="btn btn-primary" onClick={handleRemise}>
                    ✓ Remettre les vêtements
                  </button>
                )}
                {commande.statut === "prete" && !isPaid && (
                  <div className="flash flash-warning" style={{ margin: 0 }}>
                    ⚠ Paiement requis avant la remise
                  </div>
                )}
                <button className="btn btn-secondary" onClick={handlePrintTicket}>
                  🖨️ Imprimer ticket
                </button>
                {factures.length > 0 && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => handlePrintFacture(factures[factures.length - 1])}
                  >
                    🧾 Imprimer dernière facture
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hidden print content - Ticket */}
        <div style={{ display: "none" }}>
          <div ref={ticketRef}>
            <div className="header">
              <h1>CleanPress</h1>
              <p>Le soin textile, avec clarté</p>
              <p>{commande.siteNom}</p>
            </div>
            <div className="ticket">TICKET N° {commande.ticket}</div>
            <p><strong>Client :</strong> {commande.clientPrenom} {commande.clientNom}</p>
            <p><strong>Tél :</strong> {commande.clientTelephone}</p>
            <p><strong>Dépôt :</strong> {new Date(commande.dateDepot).toLocaleDateString("fr-FR")}</p>
            <p><strong>Retrait prévu :</strong> {new Date(commande.dateRetrait).toLocaleDateString("fr-FR")}</p>
            <table>
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Qté</th>
                  <th style={{ textAlign: "right" }}>Prix</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((a) => (
                  <tr key={a.id}>
                    <td>{a.serviceNom}{a.description ? ` – ${a.description}` : ""}</td>
                    <td>{a.quantite}</td>
                    <td style={{ textAlign: "right" }}>{Number(a.sousTotal).toLocaleString("fr-FR")} F</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="total" style={{ textAlign: "right", marginTop: 10 }}>
              TOTAL : {Number(commande.montantTotal).toLocaleString("fr-FR")} FCFA
            </p>
            <div className="footer">
              <p>Conservez ce ticket pour le retrait.</p>
              <p>Suivez votre commande sur cleanpress.bj</p>
            </div>
          </div>
        </div>

        {/* Hidden print content - Facture template */}
        <div style={{ display: "none" }}>
          <div ref={factureRef}>
            <div className="client-info">
              <h3>Facturé à</h3>
              <p><strong>{commande.clientPrenom} {commande.clientNom}</strong></p>
              <p>{commande.clientTelephone}</p>
              {commande.clientEmail && <p>{commande.clientEmail}</p>}
            </div>
            <p style={{ marginBottom: 10 }}><strong>Commande :</strong> {commande.ticket}</p>
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Description</th>
                  <th>Qté</th>
                  <th style={{ textAlign: "right" }}>Prix unit.</th>
                  <th style={{ textAlign: "right" }}>Sous-total</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((a) => (
                  <tr key={a.id}>
                    <td>{a.serviceNom}</td>
                    <td>{a.description || "—"}</td>
                    <td>{a.quantite}</td>
                    <td style={{ textAlign: "right" }}>{Number(a.prixUnitaire).toLocaleString("fr-FR")} F</td>
                    <td style={{ textAlign: "right" }}>{Number(a.sousTotal).toLocaleString("fr-FR")} F</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="total-row" style={{ textAlign: "right", marginTop: 10 }}>
              TOTAL : {Number(commande.montantTotal).toLocaleString("fr-FR")} FCFA
            </div>
            <p style={{ marginTop: 10, fontSize: 13, color: "#5F6E67" }}>
              <strong>Payé :</strong> {totalPaye.toLocaleString("fr-FR")} FCFA
              {resteAPayer > 0 && ` — Reste : ${resteAPayer.toLocaleString("fr-FR")} FCFA`}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}