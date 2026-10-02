"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function NoterPage() {
  const params = useParams();
  const ticket = params.ticket as string;

  const [note, setNote] = useState(0);
  const [hoverNote, setHoverNote] = useState(0);
  const [commentaire, setCommentaire] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [alreadyRated, setAlreadyRated] = useState(false);

  useEffect(() => {
    fetch(`/api/suivi/${ticket}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.avis) {
          setAlreadyRated(true);
        }
      })
      .catch(() => {});
  }, [ticket]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (note === 0) {
      setError("Veuillez attribuer une note.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/avis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket, note, commentaire }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de l'envoi.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <section className="section">
        <div className="section-inner" style={{ maxWidth: 500 }}>
          <div className="section-header">
            <div className="sur-titre" style={{ justifyContent: "center" }}>
              VOTRE AVIS
            </div>
            <h2>
              Notez le{" "}
              <span className="accent-serif">service</span>
            </h2>
            <p>
              Ticket <strong className="ticket-number">{ticket}</strong>
            </p>
          </div>

          {alreadyRated ? (
            <div className="card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>✓</div>
              <h3 style={{ marginBottom: "0.5rem" }}>Merci !</h3>
              <p style={{ color: "var(--secondaire)" }}>
                Vous avez déjà noté cette commande.
              </p>
              <Link
                href="/suivi"
                className="btn btn-secondary"
                style={{ marginTop: "1.5rem" }}
              >
                ← Retour au suivi
              </Link>
            </div>
          ) : submitted ? (
            <div className="card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⭐</div>
              <h3 style={{ marginBottom: "0.5rem" }}>Merci pour votre avis !</h3>
              <p style={{ color: "var(--secondaire)", marginBottom: "1.5rem" }}>
                Votre note de {note}/5 a bien été enregistrée.
              </p>
              <Link href="/suivi" className="btn btn-secondary">
                ← Retour au suivi
              </Link>
            </div>
          ) : (
            <div className="card">
              {error && <div className="flash flash-error">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                  <div
                    className="stars"
                    style={{ justifyContent: "center", fontSize: "2rem" }}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span
                        key={n}
                        className={`star ${n <= (hoverNote || note) ? "filled" : ""}`}
                        onClick={() => setNote(n)}
                        onMouseEnter={() => setHoverNote(n)}
                        onMouseLeave={() => setHoverNote(0)}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  {note > 0 && (
                    <div
                      style={{
                        marginTop: "0.5rem",
                        fontSize: "0.875rem",
                        color: "var(--secondaire)",
                      }}
                    >
                      {note}/5
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Commentaire (optionnel)
                  </label>
                  <textarea
                    className="form-textarea"
                    placeholder="Dites-nous ce que vous avez pensé du service..."
                    value={commentaire}
                    onChange={(e) => setCommentaire(e.target.value)}
                    rows={3}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: "100%" }}
                  disabled={loading}
                >
                  {loading ? "Envoi..." : "Envoyer mon avis"}
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