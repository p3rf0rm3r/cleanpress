"use client";

import { useEffect, useState } from "react";

interface JournalEntry {
  id: number;
  action: string;
  details: string;
  dateAction: string;
  utilisateurNom: string;
  utilisateurPrenom: string;
  utilisateurRole: string;
}

export default function GerantJournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/journal?limit=100")
      .then((r) => r.json())
      .then((data) => setEntries(data.journal || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="main-header">
        <div>
          <h1 className="page-title">Journal d&apos;actions</h1>
          <p className="page-subtitle">Traçabilité complète des opérations</p>
        </div>
      </div>

      <div className="main-body">
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div className="spinner" />
          </div>
        ) : entries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>Aucune action</h3>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Utilisateur</th>
                  <th>Rôle</th>
                  <th>Action</th>
                  <th>Détails</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id}>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {new Date(e.dateAction).toLocaleDateString("fr-FR")}{" "}
                      {new Date(e.dateAction).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {e.utilisateurPrenom} {e.utilisateurNom}
                    </td>
                    <td style={{ color: "var(--secondaire)", fontSize: "0.8125rem" }}>
                      {e.utilisateurRole}
                    </td>
                    <td>{e.action}</td>
                    <td style={{ color: "var(--secondaire)" }}>
                      {e.details || "—"}
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