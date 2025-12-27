import { useState, useEffect, useCallback } from 'react';
import { useOnlineStore } from '../stores/onlineStore';

/**
 * Hook for detecting online/offline status
 * Updates global store and provides local state
 */
export function useOnlineStatus() {
    const { isOnline, setOnline, lastOnlineAt } = useOnlineStore();

    useEffect(() => {
        // Set initial state
        setOnline(navigator.onLine);

        const handleOnline = () => {
            console.log('[Network] Connection restored');
            setOnline(true);
        };

        const handleOffline = () => {
            console.log('[Network] Connection lost');
            setOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [setOnline]);

    return { isOnline, lastOnlineAt };
}

/**
 * Hook to check if we can make network requests
 * More robust than just navigator.onLine - also considers recent failures
 */
export function useNetworkStatus() {
    const { isOnline } = useOnlineStatus();
    const [canConnect, setCanConnect] = useState(isOnline);

    const checkConnection = useCallback(async () => {
        if (!navigator.onLine) {
            setCanConnect(false);
            return false;
        }

        try {
            // Try a lightweight request to check actual connectivity
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            // Use a simple HEAD request to check connectivity
            // This is a fallback - in most cases navigator.onLine is sufficient
            const response = await fetch('/favicon.ico', {
                method: 'HEAD',
                cache: 'no-store',
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            setCanConnect(response.ok);
            return response.ok;
        } catch {
            setCanConnect(false);
            return false;
        }
    }, []);

    return { isOnline, canConnect, checkConnection };
}

export default useOnlineStatus;
