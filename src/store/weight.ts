import { Weight } from "@/components/data-tables/weight/columns";
import { create } from "zustand";

// Define the Zustand store interface
interface WeightStore {
  weights: Weight[]; // For storing the weights data

  // State modifiers
  setWeights: (weights: Weight[]) => void;
  addWeight: (newWeight: Weight) => void; // Add a single weight and sort
  updateWeight: (updatedWeight: Weight) => void; // Update an existing weight and sort
  removeWeights: (ids: number[]) => void; // Remove weights with matching IDs
}

const useWeightStore = create<WeightStore>((set) => ({
  weights: [],

  // Set the entire weights array
  setWeights: (weights) => set({ weights }),

  // Add a single weight and sort by date
  addWeight: (newWeight) =>
    set((state) => {
      const updatedWeights = [...state.weights, newWeight];
      updatedWeights.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return { weights: updatedWeights };
    }),

  // Update an existing weight and sort by date
  updateWeight: (updatedWeight) =>
    set((state) => {
      const updatedWeights = state.weights.map((item) =>
        item.id === updatedWeight.id ? updatedWeight : item
      );
      updatedWeights.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return { weights: updatedWeights };
    }),

  // Remove weights with matching IDs
  removeWeights: (ids) =>
    set((state) => {
      const filteredWeights = state.weights.filter((item) => !ids.includes(item.id));
      return { weights: filteredWeights };
    }),
}));

export default useWeightStore;
