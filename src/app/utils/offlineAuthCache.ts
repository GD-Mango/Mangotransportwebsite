/**
 * Offline Auth Cache
 * 
 * Caches user credentials locally (hashed) for offline login.
 * Uses the Web Crypto API (SHA-256) so no external dependencies are needed.
 * 
 * Supports multiple users — stores an array of credential entries keyed by email.
 */

const STORAGE_KEY = 'mango-offline-auth';

interface CachedCredentials {
    email: string;
    passwordHash: string;
    role: string;
    userId: string;
    depotId: string | null;
    cachedAt: string;
}

/**
 * Hash a password string using SHA-256 via the Web Crypto API.
 */
async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Cache a user's credentials after a successful online login.
 * If the user already exists in the cache, update their entry.
 */
export async function cacheCredentials(
    email: string,
    password: string,
    role: string,
    userId: string,
    depotId: string | null
): Promise<void> {
    try {
        const passwordHash = await hashPassword(password);
        const existing = getAllCached();

        // Update existing entry or add new one
        const index = existing.findIndex(c => c.email === email);
        const entry: CachedCredentials = {
            email,
            passwordHash,
            role,
            userId,
            depotId,
            cachedAt: new Date().toISOString(),
        };

        if (index >= 0) {
            existing[index] = entry;
        } else {
            existing.push(entry);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
        console.log('[OfflineAuth] Credentials cached for:', email);
    } catch (error) {
        console.error('[OfflineAuth] Failed to cache credentials:', error);
    }
}

/**
 * Verify credentials against the local cache (for offline login).
 * Returns user info if credentials match, null otherwise.
 */
export async function verifyOfflineCredentials(
    email: string,
    password: string
): Promise<{ role: string; userId: string; depotId: string | null } | null> {
    try {
        const cached = getAllCached();
        const entry = cached.find(c => c.email === email);

        if (!entry) {
            console.log('[OfflineAuth] No cached credentials found for:', email);
            return null;
        }

        const passwordHash = await hashPassword(password);

        if (entry.passwordHash === passwordHash) {
            console.log('[OfflineAuth] Offline login successful for:', email);
            return {
                role: entry.role,
                userId: entry.userId,
                depotId: entry.depotId,
            };
        }

        console.log('[OfflineAuth] Password mismatch for:', email);
        return null;
    } catch (error) {
        console.error('[OfflineAuth] Failed to verify credentials:', error);
        return null;
    }
}

/**
 * Check if any credentials have been cached (i.e., at least one previous login).
 */
export function hasCachedCredentials(): boolean {
    return getAllCached().length > 0;
}

/**
 * Get all cached credential entries from localStorage.
 */
function getAllCached(): CachedCredentials[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw) as CachedCredentials[];
    } catch {
        return [];
    }
}

export default { cacheCredentials, verifyOfflineCredentials, hasCachedCredentials };
