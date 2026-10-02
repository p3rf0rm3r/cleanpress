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

export default function GerantCommandesPage() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [filter, setFilter] = useState("tous");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/commandes?statut=${filter}`)
      .then((r) => r.json())
      .then((data) => setCommandes(data.commandes || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <>
      <div className="main-header">
        <div>
          <h1 className="page-title">Commandes</h1>
          <p className="page-subtitle">Toutes les commandes de votre site</p>
        </div>
      </div>

      <div className="main-body">
        {/* Filtres */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
          {["tous", "deposee", "en_traitement", "prete", "remise"].map((s) => (
            <button
              key={s}
              className={`btn btn-sm ${filter === s ? "btn-primary" : "btn-outline"}`}
              onClick={() => setFilter(s)}
            >
              {s === "tous" ? "Tous" : statutLabels[s]}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div className="spinner" />
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Client</th>
                  <th>Date dépôt</th>
                  <th>Statut</th>
                  <th style={{ textAlign: "right" }}>Montant</th>
                  <th style={{ textAlign: "right" }}>Payé</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {commandes.map((cmd) => {
                  const paye = Number(cmd.totalPaye) >= Number(cmd.montantTotal);
                  return (
                    <tr key={cmd.id}>
                      <td>
                        <span className="ticket-number" style={{ fontSize: "0.8125rem" }}>
                          {cmd.ticket}
                        </span>
                      </td>
                      <td>
                        {cmd.clientPrenom} {cmd.clientNom}
                      </td>
                      <td>{new Date(cmd.dateDepot).toLocaleDateString("fr-FR")}</td>
                      <td>
                        <span className={`badge badge-${cmd.statut}`}>
                          {statutLabels[cmd.statut]}
                        </span>
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 600 }}>
                        {Number(cmd.montantTotal).toLocaleString("fr-FR")} F
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {paye ? (
                          <span style={{ color: "var(--vert-accent)", fontWeight: 600 }}>✓</span>
                        ) : (
                          <span style={{ color: "var(--rouge)" }}>
                            {Number(cmd.totalPaye).toLocaleString("fr-FR")} F
                          </span>
                        )}
                      </td>
                      <td>
                        <Link
                          href={`/reception/commande/${cmd.id}`}
                          className="btn btn-outline btn-sm"
                        >
                          Détail
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
    </>
  );
}