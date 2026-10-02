// ============================================================
// CleanPress – Module SMS (simulé → table sms_log)
// ============================================================
import { db } from "@/db";
import { smsLog } from "@/db/schema";

export async function sendSms(numero: string, message: string): Promise<boolean> {
  try {
    // Simulation : on logue le message dans la table sms_log
    await db.insert(smsLog).values({
      numero,
      message,
      statut: "envoye",
    });
    console.log(`[SMS] → ${numero}: ${message}`);
    return true;
  } catch (err) {
    console.error("[SMS] Erreur:", err);
    return false;
  }
}