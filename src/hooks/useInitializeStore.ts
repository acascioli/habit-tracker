import { useEffect, useState, useCallback } from "react";
import { load, Store } from "@tauri-apps/plugin-store";
import { open } from "@tauri-apps/plugin-dialog";
import useSettingsStore from "@/store/settingsPath";

interface StoreSchema {
  "setting-path": string | null;
}

export function useInitializeStore({ changePath }: { changePath: boolean }) {
  const [store, setStore] = useState<Store | null>(null);
  const setSettingsPath = useSettingsStore((state) => state.setSettingsPath);

  const promptForSettingPath = useCallback(async (loadedStore: Store) => {
    const selectedPath = await open({ directory: true });
    if (selectedPath && typeof selectedPath === "string") {
      await loadedStore.set("setting-path", selectedPath);
      await loadedStore.save();
      setSettingsPath(selectedPath);
    } else {
      console.warn("No folder selected.");
    }
  }, [setSettingsPath]);

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

    if (!store) {
      initializeStore();
    }
    if (store && changePath) {
      promptForSettingPath(store);
      initializeStore();
    }
  }, [store, changePath, promptForSettingPath]);

  return { store, promptForSettingPath }; // Return both store and the function
}
