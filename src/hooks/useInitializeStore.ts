import { useEffect, useState } from "react";
import { load, Store } from "@tauri-apps/plugin-store";
import { open } from "@tauri-apps/plugin-dialog";
import useSettingsStore from "@/store/settingsPath";

interface StoreSchema {
  "setting-path": string | null;
}

export function useInitializeStore() {
  const [store, setStore] = useState<Store | null>(null);
  const setSettingsPath = useSettingsStore((state) => state.setSettingsPath)

  useEffect(() => {
    async function initializeStore() {
      const loadedStore = await load("store.json", { autoSave: false });
      setStore(loadedStore);

      const path = await loadedStore.get<StoreSchema["setting-path"]>("setting-path");
      if (path) {
        setSettingsPath(path);
      } else {
        await promptForSettingPath(loadedStore);
      }
    }

    async function promptForSettingPath(loadedStore: Store) {
      const selectedPath = await open({ directory: true });
      if (selectedPath && typeof selectedPath === "string") {
        await loadedStore.set("setting-path", selectedPath);
        await loadedStore.save();
        setSettingsPath(selectedPath);
      } else {
        console.warn("No folder selected.");
      }
    }
    if (!store) {
      initializeStore();
    }
  }, []);

  return store;
}

