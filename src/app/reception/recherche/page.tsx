"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface CommandeResult {
  id: number;
  ticket: string;
  statut: string;
  dateDepot: string;
  montantTotal: string;
  clientNom: string;
  clientPrenom: string;
  clientTelephone: string;
  totalPaye: string;
}

const statutLabels: Record<string, string> = {
  deposee: "Déposée",
  en_traitement: "En traitement",
  prete: "Prête",
  remise: "Remise",
};

export default function RecherchePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CommandeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/commandes/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.commandes || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 400);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  return (
    <>
      <div className="main-header">
        <div>
          <h1 className="page-title">Recherche</h1>
          <p className="page-subtitle">Rechercher par nom, prénom ou numéro de ticket</p>
        </div>
      </div>

      <div className="main-body">
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <input
              type="text"
              className="form-input"
              placeholder="🔍  Rechercher un client ou un ticket (ex: CP-2026-000001)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              style={{ fontSize: "1rem" }}
            />
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div className="spinner" />
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>Aucun résultat</h3>
            <p>Essayez avec un autre terme de recherche.</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Client</th>
                  <th>Téléphone</th>
                  <th>Statut</th>
                  <th>Montant</th>
                  <th>Payé</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {results.map((cmd) => {
                  const paye = Number(cmd.totalPaye) >= Number(cmd.montantTotal);
                  return (
                    <tr key={cmd.id}>
                      <td>
                        <span className="ticket-number" style={{ fontSize: "0.875rem" }}>
                          {cmd.ticket}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {cmd.clientPrenom} {cmd.clientNom}
                      </td>
                      <td>{cmd.clientTelephone}</td>
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
                          <span style={{ color: "var(--vert-accent)", fontWeight: 600 }}>✓</span>
                        ) : (
                          <span style={{ color: "var(--rouge)", fontWeight: 600 }}>
                            {Number(cmd.totalPaye).toLocaleString("fr-FR")} F
                          </span>
                        )}
                      </td>
                      <td>
                        <Link
                          href={`/reception/commande/${cmd.id}`}
                          className="btn btn-outline btn-sm"
                        >
                          Ouvrir
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