import { create } from 'zustand';

interface HeaderState {
    onOpenExport: (() => void) | null;
    isRecording: boolean;
    hasSelectedSado: boolean;
    setHeaderActions: (actions: { 
        onOpenExport?: () => void; 
        isRecording?: boolean; 
        hasSelectedSado?: boolean;
    }) => void;
}

export const useHeaderStore = create<HeaderState>((set) => ({
    onOpenExport: null,
    isRecording: false,
    hasSelectedSado: false,
    setHeaderActions: (actions) => set((state) => ({ ...state, ...actions })),
}));
