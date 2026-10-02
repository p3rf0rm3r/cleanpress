"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Client {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
}

interface Service {
  id: number;
  nom: string;
  tarifUnitaire: string;
}

interface Site {
  id: number;
  nom: string;
}

interface ArticleLigne {
  serviceId: string;
  description: string;
  quantite: number;
  prixUnitaire: number;
}

export default function NouveauDepotPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [searchClient, setSearchClient] = useState("");
  const [clientsFound, setClientsFound] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClient, setNewClient] = useState({ nom: "", prenom: "", telephone: "", email: "" });
  const [siteId, setSiteId] = useState("");
  const [dateRetrait, setDateRetrait] = useState("");
  const [articles, setArticles] = useState<ArticleLigne[]>([
    { serviceId: "", description: "", quantite: 1, prixUnitaire: 0 },
  ]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((data) => setServices(data.services || []));
    fetch("/api/sites")
      .then((r) => r.json())
      .then((data) => {
        setSites(data.sites || []);
        if (data.sites?.length === 1) setSiteId(String(data.sites[0].id));
      });
  }, []);

  // Default retrait date: 3 days from now
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    setDateRetrait(d.toISOString().split("T")[0]);
  }, []);

  const searchClients = useCallback(async (q: string) => {
    if (q.length < 2) {
      setClientsFound([]);
      return;
    }
    const res = await fetch(`/api/clients/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setClientsFound(data.clients || []);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => searchClients(searchClient), 300);
    return () => clearTimeout(timer);
  }, [searchClient, searchClients]);

  const addArticle = () => {
    setArticles([...articles, { serviceId: "", description: "", quantite: 1, prixUnitaire: 0 }]);
  };

  const removeArticle = (idx: number) => {
    setArticles(articles.filter((_, i) => i !== idx));
  };

  const updateArticle = (idx: number, field: string, value: string | number) => {
    const updated = [...articles];
    const art = { ...updated[idx] };

    if (field === "serviceId") {
      art.serviceId = String(value);
      const svc = services.find((s) => s.id === Number(value));
      if (svc) art.prixUnitaire = Number(svc.tarifUnitaire);
    } else if (field === "quantite") {
      art.quantite = Number(value);
    } else if (field === "description") {
      art.description = String(value);
    } else if (field === "prixUnitaire") {
      art.prixUnitaire = Number(value);
    }

    updated[idx] = art;
    setArticles(updated);
  };

  const total = articles.reduce((sum, a) => sum + a.prixUnitaire * a.quantite, 0);

  const handleCreateClient = async () => {
    if (!newClient.nom || !newClient.telephone) {
      setError("Nom et téléphone du client requis.");
      return;
    }

    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newClient),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erreur création client.");
      return;
    }

    setSelectedClient(data.client);
    setShowNewClient(false);
    setSearchClient(`${data.client.prenom} ${data.client.nom}`);
    setClientsFound([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedClient) {
      setError("Sélectionnez ou créez un client.");
      return;
    }

    if (!siteId) {
      setError("Sélectionnez un site.");
      return;
    }

    const validArticles = articles.filter((a) => a.serviceId && a.quantite > 0);
    if (validArticles.length === 0) {
      setError("Ajoutez au moins un article.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/commandes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient.id,
          siteId: Number(siteId),
          dateRetrait,
          articles: validArticles,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de la création.");
        return;
      }

      setSuccess(`Commande créée avec succès ! Ticket : ${data.ticket}`);
      setTimeout(() => {
        router.push(`/reception/commande/${data.commande.id}`);
      }, 1500);
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="main-header">
        <div>
          <h1 className="page-title">Nouveau dépôt</h1>
          <p className="page-subtitle">Enregistrer un nouveau dépôt de vêtements</p>
        </div>
      </div>

      <div className="main-body">
        {error && <div className="flash flash-error">{error}</div>}
        {success && <div className="flash flash-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* Client */}
          <div className="card" style={{ marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, marginBottom: "1rem" }}>
              1. Client
            </h2>

            {!selectedClient ? (
              <>
                <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Rechercher par nom, prénom ou téléphone..."
                    value={searchClient}
                    onChange={(e) => {
                      setSearchClient(e.target.value);
                      if (e.target.value.length === 0) setClientsFound([]);
                    }}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowNewClient(!showNewClient)}
                  >
                    ➕ Nouveau
                  </button>
                </div>

                {clientsFound.length > 0 && (
                  <div
                    style={{
                      background: "var(--fond)",
                      borderRadius: "12px",
                      padding: "0.5rem",
                      marginBottom: "1rem",
                    }}
                  >
                    {clientsFound.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setSelectedClient(c);
                          setSearchClient(`${c.prenom} ${c.nom}`);
                          setClientsFound([]);
                        }}
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "0.75rem 1rem",
                          background: "none",
                          border: "none",
                          textAlign: "left",
                          cursor: "pointer",
                          borderRadius: "8px",
                          fontSize: "0.875rem",
                        }}
                      >
                        <strong>
                          {c.prenom} {c.nom}
                        </strong>
                        <span style={{ color: "var(--secondaire)", marginLeft: "0.75rem" }}>
                          {c.telephone}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {showNewClient && (
                  <div
                    style={{
                      background: "var(--vert-clair)",
                      padding: "1rem",
                      borderRadius: "12px",
                      marginTop: "0.5rem",
                    }}
                  >
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Nom *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={newClient.nom}
                          onChange={(e) => setNewClient({ ...newClient, nom: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Prénom</label>
                        <input
                          type="text"
                          className="form-input"
                          value={newClient.prenom}
                          onChange={(e) => setNewClient({ ...newClient, prenom: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Téléphone *</label>
                        <input
                          type="tel"
                          className="form-input"
                          value={newClient.telephone}
                          onChange={(e) => setNewClient({ ...newClient, telephone: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-input"
                          value={newClient.email}
                          onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                        />
                      </div>
                    </div>
                    <button type="button" className="btn btn-primary btn-sm" onClick={handleCreateClient}>
                      Créer le client
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "var(--vert-clair)",
                  padding: "0.875rem 1rem",
                  borderRadius: "12px",
                }}
              >
                <div>
                  <strong>
                    {selectedClient.prenom} {selectedClient.nom}
                  </strong>
                  <span style={{ color: "var(--secondaire)", marginLeft: "0.75rem" }}>
                    {selectedClient.telephone}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setSelectedClient(null);
                    setSearchClient("");
                  }}
                >
                  Changer
                </button>
              </div>
            )}
          </div>

          {/* Site & Date */}
          <div className="card" style={{ marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, marginBottom: "1rem" }}>
              2. Informations
            </h2>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Site de dépôt *</label>
                <select
                  className="form-select"
                  value={siteId}
                  onChange={(e) => setSiteId(e.target.value)}
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
              <div className="form-group">
                <label className="form-label">Date de retrait prévue *</label>
                <input
                  type="date"
                  className="form-input"
                  value={dateRetrait}
                  onChange={(e) => setDateRetrait(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Articles */}
          <div className="card" style={{ marginBottom: "1.25rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <h2 style={{ fontSize: "1.0625rem", fontWeight: 700 }}>
                3. Articles & services
              </h2>
              <button type="button" className="btn btn-secondary btn-sm" onClick={addArticle}>
                ➕ Ajouter
              </button>
            </div>

            {articles.map((art, idx) => (
              <div
                key={idx}
                style={{
                  background: "var(--fond)",
                  padding: "1rem",
                  borderRadius: "12px",
                  marginBottom: "0.75rem",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 2fr 1fr 1fr auto",
                    gap: "0.75rem",
                    alignItems: "end",
                  }}
                >
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Service</label>
                    <select
                      className="form-select"
                      value={art.serviceId}
                      onChange={(e) => updateArticle(idx, "serviceId", e.target.value)}
                    >
                      <option value="">Choisir</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nom} ({Number(s.tarifUnitaire).toLocaleString("fr-FR")} F)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Description</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: Costume noir"
                      value={art.description}
                      onChange={(e) => updateArticle(idx, "description", e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Qté</label>
                    <input
                      type="number"
                      className="form-input"
                      min={1}
                      value={art.quantite}
                      onChange={(e) => updateArticle(idx, "quantite", e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Prix (F)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={art.prixUnitaire}
                      onChange={(e) => updateArticle(idx, "prixUnitaire", e.target.value)}
                    />
                  </div>
                  <div style={{ paddingBottom: "0.125rem" }}>
                    {articles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArticle(idx)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--rouge)",
                          cursor: "pointer",
                          fontSize: "1.25rem",
                          padding: "0.25rem",
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    textAlign: "right",
                    marginTop: "0.5rem",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--vert-accent)",
                  }}
                >
                  Sous-total : {(art.prixUnitaire * art.quantite).toLocaleString("fr-FR")} FCFA
                </div>
              </div>
            ))}

            <div
              style={{
                textAlign: "right",
                padding: "1rem",
                background: "var(--vert-clair)",
                borderRadius: "12px",
                marginTop: "0.5rem",
              }}
            >
              <span style={{ fontSize: "0.875rem", color: "var(--secondaire)" }}>Total : </span>
              <span style={{ fontSize: "1.375rem", fontWeight: 800, color: "var(--vert-fonce)" }}>
                {total.toLocaleString("fr-FR")} FCFA
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: "100%" }}
            disabled={loading}
          >
            {loading ? "Création en cours..." : "✓ Enregistrer le dépôt"}
          </button>
        </form>
      </div>
    </>
  );
}