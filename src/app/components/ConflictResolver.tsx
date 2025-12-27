import React from 'react';
import { useSyncStore, ConflictInfo } from '../stores';
import { processQueue } from '../utils/syncEngine';

/**
 * ConflictResolver - Modal for resolving sync conflicts
 * 
 * Shows when operations conflict with server data
 * Allows user to choose: Keep Local, Keep Server, or Cancel
 */
export function ConflictResolver() {
    const conflicts = useSyncStore((state) => state.conflicts);
    const resolveConflict = useSyncStore((state) => state.resolveConflict);

    if (conflicts.length === 0) {
        return null;
    }

    const handleResolve = async (operationId: string, resolution: 'keep_local' | 'keep_server' | 'cancel') => {
        resolveConflict(operationId, resolution);

        // If keeping local, trigger sync to retry
        if (resolution === 'keep_local') {
            setTimeout(() => processQueue(), 500);
        }
    };

    const formatEntityType = (type: string) => {
        switch (type) {
            case 'booking': return 'Booking';
            case 'trip': return 'Trip';
            case 'delivery': return 'Delivery';
            default: return type;
        }
    };

    const formatData = (data: any) => {
        if (!data) return 'No data available';

        // Try to extract meaningful display fields
        if (data.sender_name) {
            return `Sender: ${data.sender_name}`;
        }
        if (data.driver_name) {
            return `Driver: ${data.driver_name}`;
        }
        if (data.status) {
            return `Status: ${data.status}`;
        }

        return JSON.stringify(data, null, 2).slice(0, 200) + '...';
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 bg-red-50">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">⚠️</span>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Sync Conflict Detected</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {conflicts.length} {conflicts.length === 1 ? 'item has' : 'items have'} been modified elsewhere.
                                Please choose how to resolve.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Conflicts List */}
                <div className="divide-y divide-gray-200">
                    {conflicts.map((conflict) => (
                        <ConflictItem
                            key={conflict.operationId}
                            conflict={conflict}
                            onResolve={handleResolve}
                            formatEntityType={formatEntityType}
                            formatData={formatData}
                        />
                    ))}
                </div>

                {/* Bulk Actions */}
                {conflicts.length > 1 && (
                    <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                        <button
                            onClick={() => conflicts.forEach(c => handleResolve(c.operationId, 'keep_server'))}
                            className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >
                            Keep All Server Changes
                        </button>
                        <button
                            onClick={() => conflicts.forEach(c => handleResolve(c.operationId, 'keep_local'))}
                            className="px-4 py-2 text-sm text-white bg-orange-500 rounded-lg hover:bg-orange-600"
                        >
                            Keep All My Changes
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

interface ConflictItemProps {
    conflict: ConflictInfo;
    onResolve: (operationId: string, resolution: 'keep_local' | 'keep_server' | 'cancel') => void;
    formatEntityType: (type: string) => string;
    formatData: (data: any) => string;
}

function ConflictItem({ conflict, onResolve, formatEntityType, formatData }: ConflictItemProps) {
    const [showDetails, setShowDetails] = React.useState(false);

    return (
        <div className="p-6">
            {/* Conflict Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded mb-2">
                        {formatEntityType(conflict.entityType)}
                    </span>
                    <p className="font-medium text-gray-900">
                        {conflict.entityId !== 'unknown' ? `ID: ${conflict.entityId}` : 'New Item'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        Conflicted at: {new Date(conflict.conflictedAt).toLocaleString()}
                    </p>
                </div>
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-sm text-blue-600 hover:underline"
                >
                    {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
            </div>

            {/* Comparison */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs font-medium text-blue-700 mb-2">📱 Your Changes</p>
                    <p className="text-sm text-gray-700">{formatData(conflict.localData)}</p>
                    {showDetails && (
                        <pre className="mt-2 text-xs text-gray-600 bg-white p-2 rounded overflow-auto max-h-32">
                            {JSON.stringify(conflict.localData, null, 2)}
                        </pre>
                    )}
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs font-medium text-green-700 mb-2">☁️ Server Version</p>
                    <p className="text-sm text-gray-700">
                        {conflict.serverData ? formatData(conflict.serverData) : 'Modified by another user'}
                    </p>
                    {showDetails && conflict.serverData && (
                        <pre className="mt-2 text-xs text-gray-600 bg-white p-2 rounded overflow-auto max-h-32">
                            {JSON.stringify(conflict.serverData, null, 2)}
                        </pre>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    onClick={() => onResolve(conflict.operationId, 'keep_local')}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
                >
                    Keep My Changes
                </button>
                <button
                    onClick={() => onResolve(conflict.operationId, 'keep_server')}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium"
                >
                    Use Server Version
                </button>
                <button
                    onClick={() => onResolve(conflict.operationId, 'cancel')}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
                >
                    Discard
                </button>
            </div>
        </div>
    );
}

export default ConflictResolver;
