import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function serviceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
  if (raw) {
    const parsed = JSON.parse(raw) as { project_id?: string; client_email?: string; private_key?: string };
    if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is missing project_id, client_email, or private_key.");
    }
    return {
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key.replace(/\\n/g, "\n")
    };
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ?.trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin credentials are not configured.");
  }
  return { projectId, clientEmail, privateKey };
}

export function getAdminDb() {
  const app = getApps()[0] || initializeApp({ credential: cert(serviceAccount()) });
  return getFirestore(app);
}
