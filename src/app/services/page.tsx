import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { formatMontant } from "@/lib/db-helpers";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const result = await db.execute(
    sql`SELECT s.id, s.nom, s.description, s.tarif_unitaire as "tarifUnitaire",
        st.nom as "siteNom"
      FROM services s
      LEFT JOIN sites st ON s.site_id = st.id
      WHERE s.actif = 1
      ORDER BY s.nom`
  );

  const services = result.rows as Record<string, unknown>[];

  return (
    <>
      <Navbar />

      <section className="section">
        <div className="section-inner">
          <div className="section-header">
            <div className="sur-titre" style={{ justifyContent: "center" }}>
              NOS OFFRES
            </div>
            <h2>
              Services &{" "}
              <span className="accent-serif">Tarifs</span>
            </h2>
            <p>
              Découvrez nos prestations et tarifs transparents. Tous les prix
              sont en FCFA.
            </p>
          </div>

          {services.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">✦</div>
              <h3>Aucun service disponible</h3>
              <p>Les services seront bientôt disponibles.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Description</th>
                    <th>Site</th>
                    <th style={{ textAlign: "right" }}>Tarif unitaire</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((svc) => (
                    <tr key={String(svc.id)}>
                      <td style={{ fontWeight: 600 }}>{String(svc.nom)}</td>
                      <td style={{ color: "var(--secondaire)" }}>
                        {svc.description ? String(svc.description) : "—"}
                      </td>
                      <td>{svc.siteNom ? String(svc.siteNom) : "—"}</td>
                      <td
                        style={{
                          textAlign: "right",
                          fontWeight: 700,
                          color: "var(--vert-accent)",
                        }}
                      >
                        {formatMontant(String(svc.tarifUnitaire))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}