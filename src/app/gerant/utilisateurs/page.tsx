"use client";

import { useEffect, useState } from "react";

interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  actif: number;
  siteNom: string;
}

const roleLabels: Record<string, string> = {
  administrateur: "Administrateur",
  gerant: "Gérant",
  receptionniste: "Réceptionniste",
  agent: "Agent",
};

export default function GerantUtilisateursPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [sites, setSites] = useState<{ id: number; nom: string }[]>([]);
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    motDePasse: "",
    role: "receptionniste",
    siteId: "",
  });
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    const res = await fetch("/api/utilisateurs");
    const data = await res.json();
    setUsers(data.utilisateurs || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    fetch("/api/sites")
      .then((r) => r.json())
      .then((data) => setSites(data.sites || []));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/utilisateurs", {
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
    setForm({ nom: "", prenom: "", email: "", motDePasse: "", role: "receptionniste", siteId: "" });
    fetchUsers();
  };

  return (
    <>
      <div className="main-header">
        <div>
          <h1 className="page-title">Comptes & droits</h1>
          <p className="page-subtitle">Gérer les utilisateurs de votre site</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          ➕ Nouvel utilisateur
        </button>
      </div>

      <div className="main-body">
        {error && <div className="flash flash-error">{error}</div>}

        {showForm && (
          <div className="card" style={{ marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, marginBottom: "1rem" }}>
              Nouvel utilisateur
            </h2>
            <form onSubmit={handleCreate}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Nom *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Prénom *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.prenom}
                    onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mot de passe *</label>
                  <input
                    type="password"
                    className="form-input"
                    value={form.motDePasse}
                    onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Rôle *</label>
                  <select
                    className="form-select"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="receptionniste">Réceptionniste</option>
                    <option value="agent">Agent de traitement</option>
                    <option value="gerant">Gérant</option>
                  </select>
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
              </div>
              <button type="submit" className="btn btn-primary">
                Créer l&apos;utilisateur
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
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Site</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>
                      {u.prenom} {u.nom}
                    </td>
                    <td style={{ color: "var(--secondaire)" }}>{u.email}</td>
                    <td>
                      <span className="badge badge-prete">{roleLabels[u.role]}</span>
                    </td>
                    <td>{u.siteNom || "—"}</td>
                    <td>
                      {u.actif ? (
                        <span style={{ color: "var(--vert-accent)", fontWeight: 600 }}>Actif</span>
                      ) : (
                        <span style={{ color: "var(--rouge)" }}>Inactif</span>
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