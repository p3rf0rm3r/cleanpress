"use client";

import { useEffect, useState } from "react";

interface Site {
  id: number;
  nom: string;
  adresse: string;
  telephone: string;
  actif: number;
}

export default function AdminSitesPage() {
  const [sitesList, setSitesList] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nom: "", adresse: "", telephone: "" });
  const [error, setError] = useState("");

  const fetchSites = async () => {
    const res = await fetch("/api/sites");
    const data = await res.json();
    setSitesList(data.sites || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erreur.");
      return;
    }

    setShowForm(false);
    setForm({ nom: "", adresse: "", telephone: "" });
    fetchSites();
  };

  return (
    <>
      <div className="main-header">
        <div>
          <h1 className="page-title">Sites de pressing</h1>
          <p className="page-subtitle">Gérer les sites de votre réseau</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          ➕ Nouveau site
        </button>
      </div>

      <div className="main-body">
        {error && <div className="flash flash-error">{error}</div>}

        {showForm && (
          <div className="card" style={{ marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, marginBottom: "1rem" }}>
              Nouveau site
            </h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Nom du site *</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  required
                />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Adresse</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.adresse}
                    onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.telephone}
                    onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">
                Créer le site
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div className="spinner" />
          </div>
        ) : sitesList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏢</div>
            <h3>Aucun site</h3>
            <p>Créez votre premier site de pressing.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {sitesList.map((s) => (
              <div key={s.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                    {s.nom}
                  </h3>
                  <p style={{ color: "var(--secondaire)", fontSize: "0.875rem" }}>
                    {s.adresse || "Adresse non renseignée"} — {s.telephone || "Tél. non renseigné"}
                  </p>
                </div>
                <span
                  className={`badge ${s.actif ? "badge-prete" : "badge-remise"}`}
                >
                  {s.actif ? "Actif" : "Inactif"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}