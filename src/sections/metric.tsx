import { useMemo } from "react";
import { LineChartLabels } from "@/components/charts/LineChartLabels";
import { DataTable } from "@/components/data-tables/metric/data-table";
import { Card } from "@/components/ui/card";

import useWeightStore from "@/store/weight";
import { createColumns } from "@/components/data-tables/metric/columns";
import { MetricsForm } from "@/components/forms/MetricsForm";

export default function MetricPage({ category, kpi }: { category: string, kpi: string }) {
  const weights = useWeightStore((state) => state.weights);

  // Memoize the columns to include the dynamic kpi header
  const columns = useMemo(() => createColumns(kpi), [kpi]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start justify-center">
      <Card className="p-4">
        <p className="font-semibold text-lg">{category}</p>
        <MetricsForm kpi={kpi} />
        {/* <WeightForm /> */}
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
