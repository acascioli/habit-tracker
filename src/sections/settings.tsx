"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/data-tables/settings/data-table";
import { columns } from "@/components/data-tables/settings/columns";

import useMetricsStore from "@/store/metrics";
import { MetricsForm } from "@/components/forms/SettingsForm";
import useSettingsStore from "@/store/settingsPath";
import { useInitializeStore } from "@/hooks/useInitializeStore";
import { useDatabaseSetup } from "@/hooks/useDatabaseSetup";

export default function SettingsPage() {
  const metrics = useMetricsStore((state) => state.metrics);
  const settingsPath = useSettingsStore((state) => state.settingsPath)
  const { store, promptForSettingPath } = useInitializeStore({ changePath: false });

  const handleChangePath = async () => {
    if (store) {
      await promptForSettingPath(store);
    }
  };
  const { checkDatabasesExist } = useDatabaseSetup();

  const handleCheckDatabases = async () => {
    await checkDatabasesExist();
  };

  return (
    <div className="space-y-4 flex flex-col items-start justify-center">
      <div>
        <p className="font-semibold">Current Path:</p>
        {settingsPath ? settingsPath : "Loading..."}
      </div>
      <div className="space-x-4">
        <Button onClick={handleCheckDatabases} variant="outline">
          Test Config
        </Button>
        <Button onClick={handleChangePath}>
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
