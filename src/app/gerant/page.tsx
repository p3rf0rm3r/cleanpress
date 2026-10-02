"use client";

import { useEffect, useState } from "react";

interface DashboardStats {
  totalCommandes: number;
  deposees: number;
  enTraitement: number;
  pretes: number;
  remises: number;
  chiffreAffaires: number;
  totalEncaisse: number;
  impayes: number;
}

interface CommandeRecente {
  id: number;
  ticket: string;
  statut: string;
  dateDepot: string;
  montantTotal: string;
  clientNom: string;
  clientPrenom: string;
  totalPaye: string;
}

interface CAJour {
  jour: string;
  ca: number;
}

const statutLabels: Record<string, string> = {
  deposee: "Déposée",
  en_traitement: "En traitement",
  prete: "Prête",
  remise: "Remise",
};

export default function GerantDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [commandes, setCommandes] = useState<CommandeRecente[]>([]);
  const [noteMoyenne, setNoteMoyenne] = useState(0);
  const [totalAvis, setTotalAvis] = useState(0);
  const [caParJour, setCaParJour] = useState<CAJour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => {
        setStats(data.stats);
        setCommandes(data.commandesRecentes || []);
        setNoteMoyenne(data.noteMoyenne || 0);
        setTotalAvis(data.totalAvis || 0);
        setCaParJour(data.caParJour || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  return (
    <>
      <div className="main-header">
        <div>
          <h1 className="page-title">Tableau de bord</h1>
          <p className="page-subtitle">
            Vue d&apos;ensemble de votre pressing en temps réel
          </p>
        </div>
      </div>

      <div className="main-body">
        {/* KPI Cards */}
        <div className="grid-4" style={{ marginBottom: "1.5rem" }}>
          <div className="stat-card">
            <div className="stat-card-label">Chiffre d&apos;affaires</div>
            <div className="stat-card-value">
              {stats ? stats.chiffreAffaires.toLocaleString("fr-FR") : 0}{" "}
              <span style={{ fontSize: "0.875rem", fontWeight: 400 }}>F</span>
            </div>
            <div className="stat-card-sub">
              Encaissé : {stats ? stats.totalEncaisse.toLocaleString("fr-FR") : 0} F
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-label">Impayés</div>
            <div
              className="stat-card-value"
              style={{ color: stats && stats.impayes > 0 ? "var(--rouge)" : "var(--vert-accent)" }}
            >
              {stats ? stats.impayes.toLocaleString("fr-FR") : 0}{" "}
              <span style={{ fontSize: "0.875rem", fontWeight: 400 }}>F</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-label">Commandes</div>
            <div className="stat-card-value">{stats?.totalCommandes || 0}</div>
            <div className="stat-card-sub">
              {stats?.deposees || 0} déposées · {stats?.pretes || 0} prêtes
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-label">Satisfaction</div>
            <div className="stat-card-value">
              {noteMoyenne.toFixed(1)}{" "}
              <span style={{ fontSize: "0.875rem", fontWeight: 400 }}>/5 ⭐</span>
            </div>
            <div className="stat-card-sub">{totalAvis} avis</div>
          </div>
        </div>

        {/* Statut breakdown */}
        <div
          className="card"
          style={{
            marginBottom: "1.5rem",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1rem",
            padding: "1.25rem",
          }}
        >
          {[
            { label: "Déposées", value: stats?.deposees || 0, cls: "badge-deposee" },
            { label: "En traitement", value: stats?.enTraitement || 0, cls: "badge-en_traitement" },
            { label: "Prêtes", value: stats?.pretes || 0, cls: "badge-prete" },
            { label: "Remises", value: stats?.remises || 0, cls: "badge-remise" },
          ].map((item) => (
            <div key={item.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
                {item.value}
              </div>
              <span className={`badge ${item.cls}`}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* CA par jour */}
        {caParJour.length > 0 && (
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, marginBottom: "1rem" }}>
              Encaissements (7 derniers jours)
            </h2>
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                alignItems: "flex-end",
                height: 120,
              }}
            >
              {caParJour.map((d) => {
                const maxCa = Math.max(...caParJour.map((x) => Number(x.ca)));
                const height = maxCa > 0 ? (Number(d.ca) / maxCa) * 100 : 0;
                return (
                  <div
                    key={String(d.jour)}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.6875rem",
                        color: "var(--secondaire)",
                        fontWeight: 600,
                      }}
                    >
                      {Number(d.ca) > 0
                        ? `${(Number(d.ca) / 1000).toFixed(0)}k`
                        : ""}
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: `${Math.max(height, 4)}%`,
                        background:
                          Number(d.ca) > 0
                            ? "var(--vert-accent)"
                            : "var(--bordure)",
                        borderRadius: "6px 6px 0 0",
                        minHeight: 4,
                      }}
                    />
                    <div
                      style={{
                        fontSize: "0.625rem",
                        color: "var(--secondaire)",
                      }}
                    >
                      {new Date(d.jour).toLocaleDateString("fr-FR", {
                        weekday: "short",
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Commandes récentes */}
        <div className="card">
          <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, marginBottom: "1rem" }}>
            Commandes récentes
          </h2>
          {commandes.length === 0 ? (
            <p style={{ color: "var(--secondaire)" }}>Aucune commande.</p>
          ) : (
            <div className="table-container" style={{ border: "none" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Client</th>
                    <th>Statut</th>
                    <th style={{ textAlign: "right" }}>Montant</th>
                    <th style={{ textAlign: "right" }}>Payé</th>
                  </tr>
                </thead>
                <tbody>
                  {commandes.map((cmd) => (
                    <tr key={cmd.id}>
                      <td>
                        <span className="ticket-number" style={{ fontSize: "0.8125rem" }}>
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
                      <td style={{ textAlign: "right", fontWeight: 600 }}>
                        {Number(cmd.montantTotal).toLocaleString("fr-FR")} F
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {Number(cmd.totalPaye) >= Number(cmd.montantTotal) ? (
                          <span style={{ color: "var(--vert-accent)", fontWeight: 600 }}>✓</span>
                        ) : (
                          <span style={{ color: "var(--rouge)" }}>
                            {Number(cmd.totalPaye).toLocaleString("fr-FR")} F
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}