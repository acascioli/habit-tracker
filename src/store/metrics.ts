import { create } from "zustand";

export interface Metric {
  id: number;
  category: string;
  kpi: string;
  date: Date;
}

interface MetricsStore {
  metrics: Metric[]; // For storing the weights data
  setMetrics: (metrics: Metric[]) => void;
  removeMetrics: (ids: number[]) => void; // Remove weights with matching IDs
  addMetric: (newMetric: Metric) => void; // Add a single weight and sort
  updateMetric: (updatedMetric: Metric) => void; // Update an existing weight and sort
}

const useMetricsStore = create<MetricsStore>((set) => ({
  metrics: [],
  setMetrics: (metrics) => set({ metrics }),
  removeMetrics: (ids) =>
    set((state) => {
      const filteredMetrics = state.metrics.filter((item) => !ids.includes(item.id));
      return { metrics: filteredMetrics };
    }),
  // Add a single weight and sort by date
  addMetric: (newMetric) =>
    set((state) => {
      const updatedMetrics = [...state.metrics, newMetric];
      updatedMetrics.sort((a, b) =>
        a.category.localeCompare(b.category)
      );
      return { metrics: updatedMetrics };
    }),

  // Update an existing weight and sort by date
  updateMetric: (updatedMetric) =>
    set((state) => {
      const updatedMetrics = state.metrics.map((item) =>
        item.id === updatedMetric.id ? updatedMetric : item
      );
      updatedMetrics.sort((a, b) =>
        a.category.localeCompare(b.category)
      );
      return { metrics: updatedMetrics };
    }),
}))


export default useMetricsStore
