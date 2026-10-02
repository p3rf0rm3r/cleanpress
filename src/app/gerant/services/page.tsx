"use client";

import { useEffect, useState } from "react";

interface Service {
  id: number;
  nom: string;
  description: string;
  tarifUnitaire: string;
  actif: number;
  siteNom: string;
}

export default function GerantServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nom: "", description: "", tarifUnitaire: "", siteId: "" });
  const [sites, setSites] = useState<{ id: number; nom: string }[]>([]);
  const [error, setError] = useState("");

  const fetchServices = async () => {
    const res = await fetch("/api/services");
    const data = await res.json();
    setServices(data.services || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
    fetch("/api/sites")
      .then((r) => r.json())
      .then((data) => setSites(data.sites || []));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/services", {
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
    setForm({ nom: "", description: "", tarifUnitaire: "", siteId: "" });
    fetchServices();
  };

  return (
    <>
      <div className="main-header">
        <div>
          <h1 className="page-title">Grille tarifaire</h1>
          <p className="page-subtitle">Gérer les services et leurs tarifs</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          ➕ Nouveau service
        </button>
      </div>

      <div className="main-body">
        {error && <div className="flash flash-error">{error}</div>}

        {showForm && (
          <div className="card" style={{ marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, marginBottom: "1rem" }}>
              Nouveau service
            </h2>
            <form onSubmit={handleCreate}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Nom du service *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tarif unitaire (FCFA) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={form.tarifUnitaire}
                    onChange={(e) => setForm({ ...form, tarifUnitaire: e.target.value })}
                    required
                    min={0}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Site *</label>
                <select
                  className="form-select"
                  value={form.siteId}
                  onChange={(e) => setForm({ ...form, siteId: e.target.value })}
                  required
                >
                  <option value="">Choisir un site</option>
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nom}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary">
                Créer le service
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div className="spinner" />
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Description</th>
                  <th>Site</th>
                  <th style={{ textAlign: "right" }}>Tarif</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.nom}</td>
                    <td style={{ color: "var(--secondaire)" }}>
                      {s.description || "—"}
                    </td>
                    <td>{s.siteNom}</td>
                    <td
                      style={{
                        textAlign: "right",
                        fontWeight: 700,
                        color: "var(--vert-accent)",
                      }}
                    >
                      {Number(s.tarifUnitaire).toLocaleString("fr-FR")} F
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