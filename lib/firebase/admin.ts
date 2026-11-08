import * as admin from 'firebase-admin';

function formatPrivateKey(key?: string): string | undefined {
  if (!key) return undefined;
  let k = key.trim();

  // If the variable name itself was accidentally pasted in the value field:
  if (k.startsWith('FIREBASE_ADMIN_PRIVATE_KEY=')) {
    k = k.substring('FIREBASE_ADMIN_PRIVATE_KEY='.length).trim();
  }

  // Check if key was base64 encoded
  if (!k.includes('BEGIN PRIVATE KEY')) {
    try {
      const decoded = Buffer.from(k, 'base64').toString('utf8');
      if (decoded.includes('BEGIN PRIVATE KEY')) {
        k = decoded.trim();
      }
    } catch {
      // ignore
    }
  }

  // Remove surrounding double or single quotes repeatedly
  while (
    (k.startsWith('"') && k.endsWith('"')) ||
    (k.startsWith("'") && k.endsWith("'"))
  ) {
    k = k.slice(1, -1).trim();
  }

  // Unescape escaped quotes if any (\")
  k = k.replace(/\\"/g, '"');

  // Handle quadruple or double escaped backslashes
  k = k.replace(/\\\\n/g, '\n');
  k = k.replace(/\\n/g, '\n');

  // Remove carriage returns (\r)
  k = k.replace(/\r/g, '');

  // If newlines were flattened into spaces or single line:
  if (!k.includes('\n') && k.includes('BEGIN PRIVATE KEY')) {
    const beginTag = '-----BEGIN PRIVATE KEY-----';
    const endTag = '-----END PRIVATE KEY-----';
    const sIdx = k.indexOf(beginTag);
    const eIdx = k.indexOf(endTag);
    if (sIdx > -1 && eIdx > -1) {
      const b64 = k
        .substring(sIdx + beginTag.length, eIdx)
        .replace(/\s+/g, '')
        .replace(/[^A-Za-z0-9+/=]/g, '');
      const chunks = b64.match(/.{1,64}/g) || [b64];
      k = `${beginTag}\n${chunks.join('\n')}\n${endTag}\n`;
    }
  }

  return k.trim();
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

