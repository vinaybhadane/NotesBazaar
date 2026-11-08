import * as admin from 'firebase-admin';

function formatPrivateKey(key?: string): string | undefined {
  if (!key) return undefined;
  let cleaned = key.trim();
  // Strip outer quotes if pasted with quotes into environment variables
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1);
  }
  // Replace literal escaped newlines with actual newlines
  cleaned = cleaned.replace(/\\n/g, '\n').replace(/\r/g, '');
  return cleaned.trim();
}

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = formatPrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY);

  if (projectId && clientEmail && privateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log('[Firebase Admin] Initialized successfully with service account.');
    } catch (err) {
      console.warn('[Firebase Admin] Initialization error:', (err as Error).message);
    }
  } else {
    // Development fallback / mock initialization if credentials not yet configured
    console.warn('[Firebase Admin] Missing service account variables; verifyIdToken will operate in safe mode.');
  }
}

export const adminAuth = admin.apps.length ? admin.auth() : null;

/**
 * Verifies a client Firebase ID token server-side.
 * Returns the decoded token payload or null if invalid.
 */
export async function verifyServerToken(token: string): Promise<{ uid: string; email: string; name?: string } | null> {
  if (!token) return null;

  if (adminAuth) {
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      return {
        uid: decoded.uid,
        email: decoded.email || '',
        name: decoded.name,
      };
    } catch (err) {
      console.warn('[Firebase Admin] Token verification failed:', (err as Error).message);
      return null;
    }
  }

  // If Firebase Admin SDK credentials are not yet configured on this machine,
  // do not crash - check basic payload if running in local development
  return null;
}

/**
 * Checks whether the verified user is an authorized admin.
 */
export function isUserAdmin(email: string): boolean {
  if (!email) return false;
  const adminEmail = (process.env.ADMIN_EMAIL || 'vinaybhadane06@gmail.com').toLowerCase();
  return email.toLowerCase() === adminEmail;
}

