"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

interface Site {
  id: number;
  nom: string;
}

export default function DepotEnLignePage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [form, setForm] = useState({
    clientNom: "",
    clientPrenom: "",
    clientTelephone: "",
    clientEmail: "",
    description: "",
    dateSouhaitee: "",
    siteId: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/sites")
      .then((r) => r.json())
      .then((data) => setSites(data.sites || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/demandes-depot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de l'envoi.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <>
      <Navbar />

      <section className="section">
        <div className="section-inner" style={{ maxWidth: 600 }}>
          <div className="section-header">
            <div className="sur-titre" style={{ justifyContent: "center" }}>
              DÉPÔT EN LIGNE
            </div>
            <h2>
              Déposez vos{" "}
              <span className="accent-serif">vêtements</span>
            </h2>
            <p>
              Remplissez le formulaire ci-dessous. Votre demande sera confirmée
              au comptoir.
            </p>
          </div>

          {submitted ? (
            <div className="card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>✓</div>
              <h3 style={{ marginBottom: "0.5rem" }}>Demande envoyée !</h3>
              <p style={{ color: "var(--secondaire)", marginBottom: "1.5rem" }}>
                Votre demande de dépôt a bien été enregistrée. Présentez-vous au
                comptoir pour confirmer et recevoir votre ticket.
              </p>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
                <Link href="/" className="btn btn-secondary">
                  Accueil
                </Link>
                <Link href="/suivi" className="btn btn-outline">
                  Suivre un ticket
                </Link>
              </div>
            </div>
          ) : (
            <div className="card">
              {error && <div className="flash flash-error">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Nom *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={form.clientNom}
                      onChange={(e) => update("clientNom", e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Prénom</label>
                    <input
                      type="text"
                      className="form-input"
                      value={form.clientPrenom}
                      onChange={(e) => update("clientPrenom", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Téléphone *</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="+229 XX XX XX XX"
                      value={form.clientTelephone}
                      onChange={(e) => update("clientTelephone", e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={form.clientEmail}
                      onChange={(e) => update("clientEmail", e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Site de dépôt</label>
                  <select
                    className="form-select"
                    value={form.siteId}
                    onChange={(e) => update("siteId", e.target.value)}
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
                  <label className="form-label">Date souhaitée de retrait</label>
                  <input
                    type="date"
                    className="form-input"
                    value={form.dateSouhaitee}
                    onChange={(e) => update("dateSouhaitee", e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description des vêtements</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Décrivez les vêtements à déposer (type, quantité, taches éventuelles...)"
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    rows={4}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ width: "100%" }}
                  disabled={loading}
                >
                  {loading ? "Envoi en cours..." : "Envoyer ma demande"}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}