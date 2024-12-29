import { useEffect, useState } from "react";
import { LineChartLabels } from "@/components/charts/LineChartLabels";
import { columns, Payment } from "@/components/data-tables/weight/columns";
import { DataTable } from "@/components/data-tables/weight/data-table";
import { WeightForm } from "@/components/forms/WeightForm";
import { Card } from "@/components/ui/card";

function getData(): Promise<Payment[]> {
  // Fetch data from your API here.
  return Promise.resolve([
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    // ...
  ]);
}

export default function WeightPage() {
  const [data, setData] = useState<Payment[]>([]);

  useEffect(() => {
    (async () => {
      const fetchedData = await getData();
      setData(fetchedData);
    })();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start justify-center">
      {/* <div className="p-4 shadow-lg rounded-lg"> */}
      <Card className="p-4">
        <p className="font-semibold text-lg">Weight Monitor</p>
        <WeightForm />
      </Card>
      <Card className="p-4">
        <DataTable columns={columns} data={data} />
      </Card>
      <div className="w-full min-w-48">
        <LineChartLabels />
      </div>
    </div>
  );
}
