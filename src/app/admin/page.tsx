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

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [noteMoyenne, setNoteMoyenne] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => {
        setStats(data.stats);
        setNoteMoyenne(data.noteMoyenne || 0);
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
          <h1 className="page-title">Administration</h1>
          <p className="page-subtitle">Vue globale multi-sites</p>
        </div>
      </div>

      <div className="main-body">
        <div className="grid-4" style={{ marginBottom: "1.5rem" }}>
          <div className="stat-card">
            <div className="stat-card-label">Chiffre d&apos;affaires total</div>
            <div className="stat-card-value">
              {stats ? stats.chiffreAffaires.toLocaleString("fr-FR") : 0}{" "}
              <span style={{ fontSize: "0.875rem", fontWeight: 400 }}>F</span>
            </div>
            <div className="stat-card-sub">
              Encaissé : {stats ? stats.totalEncaisse.toLocaleString("fr-FR") : 0} F
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-label">Impayés globaux</div>
            <div
              className="stat-card-value"
              style={{ color: stats && stats.impayes > 0 ? "var(--rouge)" : "var(--vert-accent)" }}
            >
              {stats ? stats.impayes.toLocaleString("fr-FR") : 0} F
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-label">Commandes totales</div>
            <div className="stat-card-value">{stats?.totalCommandes || 0}</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-label">Satisfaction</div>
            <div className="stat-card-value">{noteMoyenne.toFixed(1)}/5 ⭐</div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1.25rem",
          }}
        >
          <a href="/admin/sites" className="card card-hover" style={{ textDecoration: "none" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🏢</div>
            <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, marginBottom: "0.25rem" }}>
              Gérer les sites
            </h3>
            <p style={{ color: "var(--secondaire)", fontSize: "0.875rem" }}>
              Créer et gérer les sites de pressing
            </p>
          </a>

          <a href="/admin/utilisateurs" className="card card-hover" style={{ textDecoration: "none" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>👥</div>
            <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, marginBottom: "0.25rem" }}>
              Utilisateurs
            </h3>
            <p style={{ color: "var(--secondaire)", fontSize: "0.875rem" }}>
              Gérer les comptes et gérants
            </p>
          </a>

          <a href="/admin/journal" className="card card-hover" style={{ textDecoration: "none" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📋</div>
            <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, marginBottom: "0.25rem" }}>
              Journal
            </h3>
            <p style={{ color: "var(--secondaire)", fontSize: "0.875rem" }}>
              Traçabilité complète des actions
            </p>
          </a>
        </div>
      </div>
    </>
  );
}