/**
 * Network Error Detection Utilities
 * 
 * Centralized detection for network-related errors that should trigger
 * offline queuing instead of showing error messages.
 */

/**
 * Check if an error is a network-related error that should be queued for retry
 * @param error - The error object to check
 * @returns true if this is a network error that should be queued
 */
export function isNetworkError(error: any): boolean {
    // Check if browser is offline
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
        return true;
    }

    // Fetch throws TypeError on network failure
    if (error instanceof TypeError) {
        return true;
    }

    // Check error message for network-related patterns
    const errorMessage = error?.message?.toLowerCase() || '';
    const networkPatterns = [
        'fetch',
        'network',
        'failed to fetch',
        'err_name_not_resolved',
        'err_internet_disconnected',
        'err_connection',
        'err_network',
        'net::',
        'timeout',
        'abort',
        'econnrefused',
        'enotfound',
        'socket hang up',
        'load failed',
    ];

    return networkPatterns.some(pattern => errorMessage.includes(pattern));
}

/**
 * Check if an error code indicates a network problem
 */
export function isNetworkErrorCode(code: string | undefined): boolean {
    if (!code) return false;

    const networkCodes = [
        'ECONNREFUSED',
        'ENOTFOUND',
        'ETIMEDOUT',
        'ECONNRESET',
        'EPIPE',
    ];

    return networkCodes.includes(code.toUpperCase());
}

export default { isNetworkError, isNetworkErrorCode };
