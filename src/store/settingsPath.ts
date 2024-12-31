import { create } from "zustand";

interface SettingsStore {
  settingsPath: string | null; // For storing the weights data
  setSettingsPath: (settingsPath: string) => void;
}

const useSettingsStore = create<SettingsStore>((set) => ({
  settingsPath: null,
  setSettingsPath: (settingsPath) => set({ settingsPath }),
}))


export default useSettingsStore
