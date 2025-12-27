import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnlineState {
    isOnline: boolean;
    lastOnlineAt: string | null;

    // Actions
    setOnline: (online: boolean) => void;
}

export const useOnlineStore = create<OnlineState>()(
    persist(
        (set, get) => ({
            isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
            lastOnlineAt: null,

            setOnline: (online: boolean) => {
                const currentState = get();

                // Only update if state actually changed
                if (currentState.isOnline !== online) {
                    set({
                        isOnline: online,
                        lastOnlineAt: online ? new Date().toISOString() : currentState.lastOnlineAt,
                    });
                }
            },
        }),
        {
            name: 'mango-online-status',
            // Only persist lastOnlineAt, not the isOnline state (that should be fresh on each load)
            partialize: (state) => ({ lastOnlineAt: state.lastOnlineAt }),
        }
    )
);

export default useOnlineStore;
