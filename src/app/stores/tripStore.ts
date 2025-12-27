import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TripFormData {
    driverName: string;
    driverPhone: string;
    vehicleNumber: string;
    tripCost: string;
}

const initialFormData: TripFormData = {
    driverName: '',
    driverPhone: '',
    vehicleNumber: '',
    tripCost: '',
};

interface TripState {
    // Form draft
    draft: TripFormData;
    selectedBookings: string[];
    hasDraft: boolean;
    lastSavedAt: string | null;

    // Pending trip info (when submitted offline)
    pendingTripId: string | null;

    // Actions
    saveDraft: (data: Partial<TripFormData>) => void;
    setDraft: (data: TripFormData) => void;
    clearDraft: () => void;

    // Selected bookings management
    setSelectedBookings: (ids: string[]) => void;
    toggleBooking: (id: string) => void;
    clearSelectedBookings: () => void;

    // For restoring draft
    restoreDraft: () => { formData: TripFormData; selectedBookings: string[] } | null;
    dismissDraft: () => void;

    // For tracking pending submissions
    setPendingTripId: (id: string | null) => void;
}

export const useTripStore = create<TripState>()(
    persist(
        (set, get) => ({
            draft: initialFormData,
            selectedBookings: [],
            hasDraft: false,
            lastSavedAt: null,
            pendingTripId: null,

            saveDraft: (data) => {
                const currentDraft = get().draft;
                const newDraft = { ...currentDraft, ...data };

                // Check if the draft has meaningful data
                const hasMeaningfulData =
                    newDraft.driverName.trim() !== '' ||
                    newDraft.driverPhone.trim() !== '' ||
                    newDraft.vehicleNumber.trim() !== '' ||
                    get().selectedBookings.length > 0;

                set({
                    draft: newDraft,
                    hasDraft: hasMeaningfulData,
                    lastSavedAt: new Date().toISOString(),
                });
            },

            setDraft: (data) => {
                set({
                    draft: data,
                    hasDraft: true,
                    lastSavedAt: new Date().toISOString(),
                });
            },

            clearDraft: () => {
                set({
                    draft: initialFormData,
                    selectedBookings: [],
                    hasDraft: false,
                    lastSavedAt: null,
                    pendingTripId: null,
                });
            },

            setSelectedBookings: (ids) => {
                set({
                    selectedBookings: ids,
                    hasDraft: ids.length > 0 || get().draft.driverName.trim() !== '',
                    lastSavedAt: new Date().toISOString(),
                });
            },

            toggleBooking: (id) => {
                const current = get().selectedBookings;
                const newSelected = current.includes(id)
                    ? current.filter((b) => b !== id)
                    : [...current, id];

                set({
                    selectedBookings: newSelected,
                    hasDraft: newSelected.length > 0 || get().draft.driverName.trim() !== '',
                    lastSavedAt: new Date().toISOString(),
                });
            },

            clearSelectedBookings: () => {
                set({ selectedBookings: [] });
            },

            restoreDraft: () => {
                const state = get();
                if (state.hasDraft) {
                    return {
                        formData: state.draft,
                        selectedBookings: state.selectedBookings,
                    };
                }
                return null;
            },

            dismissDraft: () => {
                set({
                    draft: initialFormData,
                    selectedBookings: [],
                    hasDraft: false,
                    lastSavedAt: null,
                });
            },

            setPendingTripId: (id) => {
                set({ pendingTripId: id });
            },
        }),
        {
            name: 'mango-trip-draft',
            partialize: (state) => ({
                draft: state.draft,
                selectedBookings: state.selectedBookings,
                hasDraft: state.hasDraft,
                lastSavedAt: state.lastSavedAt,
                pendingTripId: state.pendingTripId,
            }),
        }
    )
);

export default useTripStore;
