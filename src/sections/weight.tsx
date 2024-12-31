import { useEffect, useState } from "react";
import { LineChartLabels } from "@/components/charts/LineChartLabels";
import { columns, Weight } from "@/components/data-tables/weight/columns";
import { DataTable } from "@/components/data-tables/weight/data-table";
import { WeightForm } from "@/components/forms/WeightForm";
import { Card } from "@/components/ui/card";

import { open } from '@tauri-apps/plugin-dialog';
import { load, Store } from '@tauri-apps/plugin-store';
import Database from '@tauri-apps/plugin-sql';
import * as path from '@tauri-apps/api/path';
import useWeightStore from "@/store/weight";
import useDBStore from "@/store/db";

// Define the store keys and types
interface StoreSchema {
  'setting-path': string | null;
}

export default function WeightPage() {
  const weights = useWeightStore((state) => state.weights)
  const setWeights = useWeightStore((state) => state.setWeights)
  const db = useDBStore((state) => state.db)
  const setDB = useDBStore((state) => state.setDB)
  const [store, setStore] = useState<Store | null>(null);
  const [settingPath, setSettingPath] = useState<string | null>(null);


  // Prompt the user to select a folder and save it
  async function promptForSettingPath(loadedStore = store) {
    const selectedPath = await open({ directory: true });
    if (selectedPath && typeof selectedPath === 'string') {
      await loadedStore!.set('setting-path', selectedPath);
      await loadedStore!.save();
      setSettingPath(selectedPath);
    } else {
      console.warn('No folder selected.');
    }
  }

  // Initialize Store and Database
  useEffect(() => {
    async function initializeStore() {
      const loadedStore = await load('store.json', { autoSave: false });
      setStore(loadedStore);

      const path = await loadedStore.get<StoreSchema['setting-path']>('setting-path');
      if (path) {
        setSettingPath(path);
      } else {
        await promptForSettingPath(loadedStore);
      }
    }

    async function initializeDatabase() {
      if (!settingPath) return;

      const testPath = await path.join(settingPath, 'db')
      const dbPath = await path.join(testPath, 'my.db');

      try {
        const dbConnection = await Database.load(`sqlite:${dbPath}`);
        setDB(dbConnection);

        // Fetch data from the database once the connection is established
        const fetchedData = await dbConnection.select<Weight[]>(`
          SELECT * FROM weights
        `);
        // Sort the data by date (oldest to newest)
        const sortedData = [...fetchedData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        setWeights(sortedData);
      } catch (error) {
        console.error("Error initializing database:", error);
        // Optionally handle the error, maybe show a user-friendly message
      }
    }

    initializeStore();
    initializeDatabase(); // Ensure that the database is initialized only after the setting path is set

  }, [settingPath]); // Re-run when settingPath changes

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start justify-center">
      <Card className="p-4">
        <p className="font-semibold text-lg">Weight Monitor</p>
        {db && (
          <WeightForm
          />
        )}
      </Card>
      <Card className="p-4">
        <DataTable columns={columns} data={weights}
        />
      </Card>
      <div className="w-full min-w-48">
        {/* Pass the weight data as props to the LineChartLabels component */}
        <LineChartLabels data={weights} />
      </div>
    </div>
  );
}
