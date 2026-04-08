/**
 * Offline Data Cache
 * 
 * Caches reference data (depots, packages, pricing, season) to localStorage
 * so that offline users can still fill out the booking form.
 * 
 * Data is cached after every successful online fetch and retrieved when offline.
 */

const KEYS = {
    depots: 'mango-cache-depots',
    packages: 'mango-cache-packages',
    pricing: 'mango-cache-pricing',
    season: 'mango-cache-season',
} as const;

interface CachedItem<T> {
    data: T;
    cachedAt: string;
}

// ──────────────────────────────────────────────
// Write (cache after successful online fetch)
// ──────────────────────────────────────────────

/**
 * Cache all reference data at once. Call this after a successful online fetch.
 */
export function cacheReferenceData(
    depots: any[],
    packages: any[],
    pricing: any[],
    season: any
): void {
    try {
        cacheItem(KEYS.depots, depots);
        cacheItem(KEYS.packages, packages);
        cacheItem(KEYS.pricing, pricing);
        if (season) {
            cacheItem(KEYS.season, season);
        }
        console.log('[OfflineData] Reference data cached successfully');
    } catch (error) {
        console.error('[OfflineData] Failed to cache reference data:', error);
    }
}

// ──────────────────────────────────────────────
// Read (retrieve cached data when offline)
// ──────────────────────────────────────────────

export function getCachedDepots(): any[] {
    return getItem<any[]>(KEYS.depots) || [];
}

export function getCachedPackages(): any[] {
    return getItem<any[]>(KEYS.packages) || [];
}

export function getCachedPricing(): any[] {
    return getItem<any[]>(KEYS.pricing) || [];
}

export function getCachedSeason(): any | null {
    return getItem<any>(KEYS.season) || null;
}

/**
 * Check if we have cached reference data (at minimum depots and packages).
 */
export function hasCachedData(): boolean {
    return getCachedDepots().length > 0 && getCachedPackages().length > 0;
}

/**
 * Get the timestamp when data was last cached. Returns null if never cached.
 */
export function getLastCachedAt(): string | null {
    try {
        const raw = localStorage.getItem(KEYS.depots);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as CachedItem<any>;
        return parsed.cachedAt || null;
    } catch {
        return null;
    }
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function cacheItem<T>(key: string, data: T): void {
    const item: CachedItem<T> = {
        data,
        cachedAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(item));
}

function getItem<T>(key: string): T | null {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as CachedItem<T>;
        return parsed.data;
    } catch {
        return null;
    }
}

export default {
    cacheReferenceData,
    getCachedDepots,
    getCachedPackages,
    getCachedPricing,
    getCachedSeason,
    hasCachedData,
    getLastCachedAt,
};
