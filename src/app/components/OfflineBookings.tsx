import React from 'react';
import { useSyncStore, useOnlineStore } from '../stores';

interface OfflineBookingsProps {
  depots?: any[];
}

/**
 * OfflineBookings — Shows a list of offline-queued bookings.
 * Visible when there are pending CREATE_BOOKING operations in the sync queue.
 */
export default function OfflineBookings({ depots = [] }: OfflineBookingsProps) {
  const pendingOperations = useSyncStore((state) => state.pendingOperations);
  const isOnline = useOnlineStore((state) => state.isOnline);

  // Filter to only CREATE_BOOKING operations
  const offlineBookings = pendingOperations.filter(
    (op) => op.type === 'CREATE_BOOKING'
  );

  // Don't render if no offline bookings
  if (offlineBookings.length === 0) {
    return null;
  }

  // Helper to find depot name by ID
  const getDepotName = (id: string) => {
    const depot = depots.find((d: any) => d.id === id);
    return depot?.name || id?.slice(0, 8) || 'Unknown';
  };

  // Status badge styles
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending' };
      case 'syncing':
        return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Syncing...' };
      case 'failed':
        return { bg: 'bg-red-100', text: 'text-red-700', label: 'Failed' };
      case 'completed':
        return { bg: 'bg-green-100', text: 'text-green-700', label: 'Synced' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
    }
  };

  return (
    <div className="mt-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-amber-50">
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <div>
              <h3 className="font-semibold text-gray-900">
                Offline Bookings ({offlineBookings.length})
              </h3>
              <p className="text-sm text-amber-700">
                {isOnline
                  ? 'These bookings are being synced to the server...'
                  : 'These bookings will be synced when you go online.'}
              </p>
            </div>
          </div>
        </div>

        {/* Bookings list */}
        <div className="divide-y divide-gray-100">
          {offlineBookings.map((op) => {
            const payload = op.payload || {};
            const optimistic = op.optimisticData?.formData || {};
            const badge = getStatusBadge(op.status);

            const senderName = payload.sender_name || optimistic.senderName || 'Unknown';
            const destination = payload.destination_depot_id
              ? getDepotName(payload.destination_depot_id)
              : optimistic.destinationDepotId
                ? getDepotName(optimistic.destinationDepotId)
                : 'N/A';
            const totalAmount = payload.total_amount || 0;
            const createdAt = op.createdAt
              ? new Date(op.createdAt).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '';

            return (
              <div key={op.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{senderName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                      {badge.label}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    → {destination}
                  </p>
                  <p className="text-xs text-gray-400">{createdAt}</p>
                </div>
                {op.error && (
                  <p className="mt-1 text-xs text-red-500">Error: {op.error}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
