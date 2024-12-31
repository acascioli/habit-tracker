
import { create } from "zustand";

// TODO: set correct db type
interface DBStore {
  db: any; // For storing the weights data
  setDB: (db: any) => void;
  settingsDB: any; // For storing the weights data
  setSettingsDB: (db: any) => void;
}

const useDBStore = create<DBStore>((set) => ({
  db: null,
  setDB: (db) => set({ db }),
  settingsDB: null,
  setSettingsDB: (settingsDB) => set({ settingsDB }),
}))


export default useDBStore
