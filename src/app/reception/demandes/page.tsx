"use client";

import { useEffect, useState } from "react";

interface Demande {
  id: number;
  clientNom: string;
  clientPrenom: string;
  clientTelephone: string;
  clientEmail: string;
  description: string;
  dateSouhaitee: string;
  siteNom: string;
  statut: string;
  creeLe: string;
}

const statutLabels: Record<string, string> = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  rejetee: "Rejetée",
};

export default function DemandesPage() {
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDemandes = async () => {
    const res = await fetch("/api/demandes-depot");
    const data = await res.json();
    setDemandes(data.demandes || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchDemandes();
  }, []);

  const handleAction = async (id: number, statut: string) => {
    const res = await fetch(`/api/demandes-depot/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut }),
    });

    if (res.ok) fetchDemandes();
  };

  return (
    <>
      <div className="main-header">
        <div>
          <h1 className="page-title">Demandes de dépôt en ligne</h1>
          <p className="page-subtitle">
            Confirmez ou rejetez les demandes des clients
          </p>
        </div>
      </div>

      <div className="main-body">
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div className="spinner" />
          </div>
        ) : demandes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📨</div>
            <h3>Aucune demande</h3>
            <p>Les demandes de dépôt en ligne apparaîtront ici.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Client</th>
                  <th>Téléphone</th>
                  <th>Site</th>
                  <th>Description</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {demandes.map((d) => (
                  <tr key={d.id}>
                    <td>
                      {new Date(d.creeLe).toLocaleDateString("fr-FR")}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {d.clientPrenom} {d.clientNom}
                    </td>
                    <td>{d.clientTelephone}</td>
                    <td>{d.siteNom || "—"}</td>
                    <td
                      style={{
                        color: "var(--secondaire)",
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {d.description || "—"}
                    </td>
                    <td>
                      <span className={`badge badge-${d.statut}`}>
                        {statutLabels[d.statut]}
                      </span>
                    </td>
                    <td>
                      {d.statut === "en_attente" && (
                        <div style={{ display: "flex", gap: "0.375rem" }}>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleAction(d.id, "confirmee")}
                          >
                            ✓
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleAction(d.id, "rejetee")}
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}