import { create } from "zustand";

export const useMindMapStore = create((set) => ({
  selectedNodeId: null,
  searchTerm: "",
  stepModeEnabled: false,
  visibleDepth: 0,
  setSelectedNodeId: (selectedNodeId) => set({ selectedNodeId }),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  toggleStepMode: () =>
    set((state) => ({
      stepModeEnabled: !state.stepModeEnabled,
      visibleDepth: !state.stepModeEnabled ? 0 : state.visibleDepth
    })),
  closeStepMode: () => set({ stepModeEnabled: false }),
  setVisibleDepth: (visibleDepth) => set({ visibleDepth }),
  resetStepMode: () => set({ visibleDepth: 0 })
}));
