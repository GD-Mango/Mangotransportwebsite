import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types matching NewBooking.tsx
export interface ReceiverPackage {
    packageId: string;
    size: string;
    quantity: number;
    price: number;
    description?: string;
}

export interface Receiver {
    name: string;
    phone: string;
    address: string;
    packages: ReceiverPackage[];
}

export interface BookingFormData {
    originDepotId: string;
    destinationDepotId: string;
    paymentMethod: 'cash' | 'online' | 'to_pay' | 'credit';
    deliveryType: 'pickup' | 'home_sender' | 'home_topay' | 'home_drt';
    deliveryCharge: number;
    customInstructions: string;
    senderName: string;
    senderPhone: string;
    receivers: Receiver[];
}

const initialFormData: BookingFormData = {
    originDepotId: '',
    destinationDepotId: '',
    paymentMethod: 'cash',
    deliveryType: 'pickup',
    deliveryCharge: 0,
    customInstructions: '',
    senderName: '',
    senderPhone: '',
    receivers: [{ name: '', phone: '', address: '', packages: [] }],
};

interface BookingState {
    // Form draft (auto-saved)
    draft: BookingFormData;
    currentStep: number;
    hasDraft: boolean;
    lastSavedAt: string | null;

    // Pending booking info (when submitted offline)
    pendingBookingId: string | null;

    // Actions
    saveDraft: (data: Partial<BookingFormData>) => void;
    setDraft: (data: BookingFormData) => void;
    clearDraft: () => void;
    setStep: (step: number) => void;

    // For restoring draft
    restoreDraft: () => BookingFormData | null;
    dismissDraft: () => void;

    // For tracking pending submissions
    setPendingBookingId: (id: string | null) => void;
}

export const useBookingStore = create<BookingState>()(
    persist(
        (set, get) => ({
            draft: initialFormData,
            currentStep: 1,
            hasDraft: false,
            lastSavedAt: null,
            pendingBookingId: null,

            saveDraft: (data) => {
                const currentDraft = get().draft;
                const newDraft = { ...currentDraft, ...data };

                // Check if the draft has meaningful data
                const hasMeaningfulData =
                    newDraft.senderName.trim() !== '' ||
                    newDraft.senderPhone.trim() !== '' ||
                    newDraft.originDepotId !== '' ||
                    newDraft.destinationDepotId !== '' ||
                    newDraft.receivers.some(r => r.name.trim() !== '' || r.phone.trim() !== '');

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
                    currentStep: 1,
                    hasDraft: false,
                    lastSavedAt: null,
                    pendingBookingId: null,
                });
            },

            setStep: (step) => {
                set({ currentStep: step });
            },

            restoreDraft: () => {
                const state = get();
                if (state.hasDraft) {
                    return state.draft;
                }
                return null;
            },

            dismissDraft: () => {
                set({
                    draft: initialFormData,
                    currentStep: 1,
                    hasDraft: false,
                    lastSavedAt: null,
                });
            },

            setPendingBookingId: (id) => {
                set({ pendingBookingId: id });
            },
        }),
        {
            name: 'mango-booking-draft',
            partialize: (state) => ({
                draft: state.draft,
                currentStep: state.currentStep,
                hasDraft: state.hasDraft,
                lastSavedAt: state.lastSavedAt,
                pendingBookingId: state.pendingBookingId,
            }),
        }
    )
);

export default useBookingStore;
