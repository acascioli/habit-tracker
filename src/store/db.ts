
import { create } from "zustand";

// TODO: set correct db type
interface DBStore {
  db: any; // For storing the weights data
  setDB: (db: any) => void;
}

const useDBStore = create<DBStore>((set) => ({
  db: null,

  // Set the entire weights array
  setDB: (db) => set({ db }),
}))


export default useDBStore
