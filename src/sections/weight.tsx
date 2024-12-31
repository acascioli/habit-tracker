"use client";

import { LineChartLabels } from "@/components/charts/LineChartLabels";
import { columns } from "@/components/data-tables/weight/columns";
import { DataTable } from "@/components/data-tables/weight/data-table";
import { WeightForm } from "@/components/forms/WeightForm";
import { Card } from "@/components/ui/card";

import useWeightStore from "@/store/weight";
import { useInitializeStore } from "@/hooks/useInitializeStore";
import { useInitializeDatabase } from "@/hooks/useInitializeDatabase";

export default function WeightPage() {
  const weights = useWeightStore((state) => state.weights);

  // Initialize store and database with custom hooks
  useInitializeStore();
  useInitializeDatabase();

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start justify-center">
      <Card className="p-4">
        <p className="font-semibold text-lg">Weight Monitor</p>
        <WeightForm />
      </Card>
      <Card className="p-4">
        <DataTable columns={columns} data={weights} />
      </Card>
      <div className="w-full min-w-48">
        <LineChartLabels data={weights} />
      </div>
    </div>
  );
}
