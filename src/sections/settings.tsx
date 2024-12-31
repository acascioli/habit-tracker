"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/data-tables/settings/data-table";
import { columns } from "@/components/data-tables/settings/columns";

import { useInitializeStore } from "@/hooks/useInitializeStore";
import { useDatabaseSetup } from "@/hooks/useDatabaseSetup";
import useDBStore from "@/store/db";
import useMetricsStore from "@/store/metrics";
import { MetricsForm } from "@/components/forms/SettingsForm";

export default function SettingsPage() {
  const [settingPath, setSettingPath] = useState<string | null>(null);
  const db = useDBStore((state) => state.settingsDB);
  const setDB = useDBStore((state) => state.setSettingsDB);
  const metrics = useMetricsStore((state) => state.metrics);

  // Initialize the store
  useInitializeStore();

  // Handle database setup
  useDatabaseSetup();

  return (
    <div className="space-y-4 flex flex-col items-start justify-center">
      <div>
        <p className="font-semibold">Current Path:</p>
        {settingPath ? settingPath : "Loading..."}
      </div>
      <div className="space-x-4">
        <Button onClick={() => setDB(db)} variant="outline">
          Test Config
        </Button>
        <Button onClick={() => setSettingPath(null)}>
          Change Setting Path
        </Button>
      </div>
      <div>
        <p className="font-semibold">Objectives:</p>
        <p className="italic font-light">List of objectives to be monitored:</p>
        <div className="flex md:flex-row justify-between items-start space-x-8 mt-4">
          <Card className="p-4">
            <DataTable columns={columns} data={metrics} />
          </Card>
          <Card className="p-4">
            <p className="font-semibold text-lg">Metrics Monitor</p>
            <MetricsForm />
          </Card>
        </div>
      </div>
    </div>
  );
}
