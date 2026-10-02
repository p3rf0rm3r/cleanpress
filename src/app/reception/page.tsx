"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Commande {
  id: number;
  ticket: string;
  statut: string;
  dateDepot: string;
  clientNom: string;
  clientPrenom: string;
  montantTotal: string;
  totalPaye: string;
}

const statutLabels: Record<string, string> = {
  deposee: "Déposée",
  en_traitement: "En traitement",
  prete: "Prête",
  remise: "Remise",
};

export default function ReceptionAccueil() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/commandes?statut=tous")
      .then((r) => r.json())
      .then((data) => setCommandes(data.commandes || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <div className="main-header">
        <div>
          <h1 className="page-title">Accueil Réception</h1>
          <p className="page-subtitle">{today}</p>
        </div>
        <Link href="/reception/nouveau-depot" className="btn btn-primary">
          ➕ Nouveau dépôt
        </Link>
      </div>

      <div className="main-body">
        {/* Stats rapides */}
        <div className="grid-4" style={{ marginBottom: "1.5rem" }}>
          <div className="stat-card">
            <div className="stat-card-label">Commandes aujourd&apos;hui</div>
            <div className="stat-card-value">
              {commandes.filter(
                (c) =>
                  new Date(c.dateDepot).toDateString() === new Date().toDateString()
              ).length}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">En attente</div>
            <div className="stat-card-value">
              {commandes.filter((c) => c.statut === "deposee").length}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Prêtes à remettre</div>
            <div className="stat-card-value">
              {commandes.filter((c) => c.statut === "prete").length}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Recherche rapide</div>
            <Link
              href="/reception/recherche"
              className="btn btn-secondary btn-sm"
              style={{ marginTop: "0.5rem" }}
            >
              🔍 Rechercher
            </Link>
          </div>
        </div>

        {/* Dernières commandes */}
        <div className="card">
          <h2
            style={{
              fontSize: "1.125rem",
              marginBottom: "1rem",
              fontWeight: 700,
            }}
          >
            Dernières commandes
          </h2>

          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div className="spinner" />
            </div>
          ) : commandes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <h3>Aucune commande</h3>
              <p>Créez un nouveau dépôt pour commencer.</p>
            </div>
          ) : (
            <div className="table-container" style={{ border: "none" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Client</th>
                    <th>Statut</th>
                    <th>Montant</th>
                    <th>Payé</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {commandes.slice(0, 20).map((cmd) => {
                    const paye = Number(cmd.totalPaye) >= Number(cmd.montantTotal);
                    return (
                      <tr key={cmd.id}>
                        <td>
                          <span className="ticket-number" style={{ fontSize: "0.875rem" }}>
                            {cmd.ticket}
                          </span>
                        </td>
                        <td>
                          {cmd.clientPrenom} {cmd.clientNom}
                        </td>
                        <td>
                          <span className={`badge badge-${cmd.statut}`}>
                            {statutLabels[cmd.statut]}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {Number(cmd.montantTotal).toLocaleString("fr-FR")} F
                        </td>
                        <td>
                          {paye ? (
                            <span style={{ color: "var(--vert-accent)", fontWeight: 600 }}>
                              ✓ Payé
                            </span>
                          ) : (
                            <span style={{ color: "var(--rouge)", fontWeight: 600 }}>
                              Impayé
                            </span>
                          )}
                        </td>
                        <td>
                          <Link
                            href={`/reception/commande/${cmd.id}`}
                            className="btn btn-outline btn-sm"
                          >
                            Voir
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}