import React from 'react';
import { useOnlineStore, useSyncStore } from '../stores';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { retryFailed } from '../utils/syncEngine';

/**
 * OfflineIndicator - Shows network status and pending sync operations
 * 
 * Displays:
 * - Offline warning when disconnected
 * - Pending operations count
 * - Syncing status
 * - Failed operations with retry button
 */
export function OfflineIndicator() {
    // Initialize online status detection
    useOnlineStatus();

    const isOnline = useOnlineStore((state) => state.isOnline);
    const pendingOperations = useSyncStore((state) => state.pendingOperations);
    const isSyncing = useSyncStore((state) => state.isSyncing);

    const pendingCount = pendingOperations.filter(
        (op) => op.status === 'pending' || op.status === 'syncing'
    ).length;

    const failedCount = pendingOperations.filter(
        (op) => op.status === 'failed'
    ).length;

    const [isRetrying, setIsRetrying] = React.useState(false);

    const handleRetry = async () => {
        setIsRetrying(true);
        try {
            await retryFailed();
        } finally {
            setIsRetrying(false);
        }
    };

    // Don't render if online and no pending/failed operations
    if (isOnline && pendingCount === 0 && failedCount === 0) {
        return null;
    }

    return (
        <div className="fixed top-0 left-0 right-0 z-50">
            {/* Offline Banner */}
            {!isOnline && (
                <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-center gap-2 shadow-lg">
                    <svg
                        className="w-5 h-5 animate-pulse"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3"
                        />
                    </svg>
                    <span className="font-medium">You're offline</span>
                    <span className="text-amber-100">
                        — Changes will sync when connection is restored
                    </span>
                </div>
            )}

            {/* Pending/Syncing/Failed Operations Banner */}
            {(pendingCount > 0 || failedCount > 0) && (
                <div
                    className={`px-4 py-2 flex items-center justify-center gap-3 ${failedCount > 0
                            ? 'bg-red-500 text-white'
                            : isSyncing
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-700 text-white'
                        }`}
                >
                    {/* Syncing indicator */}
                    {isSyncing && (
                        <>
                            <svg
                                className="w-5 h-5 animate-spin"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            <span className="font-medium">Syncing changes...</span>
                        </>
                    )}

                    {/* Pending count */}
                    {!isSyncing && pendingCount > 0 && (
                        <>
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <span className="font-medium">
                                {pendingCount} pending {pendingCount === 1 ? 'change' : 'changes'}
                            </span>
                            {isOnline && (
                                <span className="text-gray-300">— Will sync shortly</span>
                            )}
                        </>
                    )}

                    {/* Failed operations */}
                    {failedCount > 0 && (
                        <>
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                            <span className="font-medium">
                                {failedCount} failed {failedCount === 1 ? 'operation' : 'operations'}
                            </span>
                            <button
                                onClick={handleRetry}
                                disabled={isRetrying || !isOnline}
                                className="ml-2 px-3 py-1 bg-white text-red-500 rounded-md text-sm font-medium hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isRetrying ? 'Retrying...' : 'Retry'}
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default OfflineIndicator;
