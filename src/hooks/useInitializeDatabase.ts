import { useEffect } from "react";
import Database from "@tauri-apps/plugin-sql";
import * as path from "@tauri-apps/api/path";
import { Weight } from "@/components/data-tables/weight/columns";
import useSettingsStore from "@/store/settingsPath";
import useDBStore from "@/store/db";
import useWeightStore from "@/store/weight";
import useMetricsStore, { Metric } from "@/store/metrics";

export function useInitializeDatabase() {
  const settingsPath = useSettingsStore((state) => state.settingsPath)
  const setDB = useDBStore((state) => state.setDB);
  const setSettingsDB = useDBStore((state) => state.setSettingsDB);
  const setWeights = useWeightStore((state) => state.setWeights);
  const setMetrics = useMetricsStore((state) => state.setMetrics)

  useEffect(() => {
    if (!settingsPath) return;

    async function initializeDatabase() {
      const dbFolderPath = await path.join(settingsPath!, "db");
      const dbPath = await path.join(dbFolderPath, "my.db");
      const settingsDBPath = await path.join(dbFolderPath, "metrics.db");

      try {
        const dbConnection = await Database.load(`sqlite:${dbPath}`);
        setDB(dbConnection);

        // Fetch data from the database once the connection is established
        const fetchedData = await dbConnection.select<Weight[]>(`
          SELECT * FROM weights
        `);
        const sortedData = [...fetchedData].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setWeights(sortedData);
      } catch (error) {
        console.error("Error initializing database:", error);
      }
      try {
        const dbConnection = await Database.load(`sqlite:${settingsDBPath}`);
        setSettingsDB(dbConnection);

        // Fetch data from the database once the connection is established
        const fetchedData = await dbConnection.select<Metric[]>(`
          SELECT * FROM metrics
        `);
        const sortedData = [...fetchedData].sort((a, b) =>
          b.category.localeCompare(a.category)
        );
        setMetrics(sortedData);
      } catch (error) {
        console.error("Error initializing database:", error);
      }
    }

    initializeDatabase();
  }, [settingsPath]);
}

