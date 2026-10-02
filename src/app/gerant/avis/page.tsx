"use client";

import { useEffect, useState } from "react";

interface AvisItem {
  id: number;
  note: number;
  commentaire: string;
  creeLe: string;
  ticket: string;
  clientNom: string;
  clientPrenom: string;
}

export default function GerantAvisPage() {
  const [avisList, setAvisList] = useState<AvisItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/avis/liste")
      .then((r) => r.json())
      .then((data) => setAvisList(data.avis || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const moyenne =
    avisList.length > 0
      ? avisList.reduce((s, a) => s + a.note, 0) / avisList.length
      : 0;

  return (
    <>
      <div className="main-header">
        <div>
          <h1 className="page-title">Avis clients</h1>
          <p className="page-subtitle">
            Note moyenne : {moyenne.toFixed(1)}/5 ⭐ ({avisList.length} avis)
          </p>
        </div>
      </div>

      <div className="main-body">
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div className="spinner" />
          </div>
        ) : avisList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">⭐</div>
            <h3>Aucun avis</h3>
            <p>Les avis des clients apparaîtront ici.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {avisList.map((a) => (
              <div key={a.id} className="card">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "0.5rem",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>
                      {a.clientPrenom} {a.clientNom}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--secondaire)",
                      }}
                    >
                      Ticket {a.ticket} —{" "}
                      {new Date(a.creeLe).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                  <div className="stars" style={{ gap: "0.125rem" }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span
                        key={n}
                        className={`star ${n <= a.note ? "filled" : ""}`}
                        style={{ fontSize: "1.125rem", cursor: "default" }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                {a.commentaire && (
                  <p
                    style={{
                      color: "var(--secondaire)",
                      fontSize: "0.875rem",
                      lineHeight: 1.6,
                    }}
                  >
                    « {a.commentaire} »
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}