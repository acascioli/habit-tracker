import { LineChartDots } from "@/components/charts/LineChartDots";

export default function OverviewPage() {

  return <div className="grid lg:grid-cols-3 gap-4">
    <div>
      <LineChartDots />
    </div>
    <div>
      <LineChartDots />
    </div>
    <div>
      <LineChartDots />
    </div>
    <div className="lg:col-span-3">
      <LineChartDots />
    </div>
  </div>
}
