import { LineChartDots } from "@/components/charts/LineChartDots";
import { LineChartLabels } from "@/components/charts/LineChartLabels";
import useWeightStore from "@/store/weight";

export default function OverviewPage() {

  const weights = useWeightStore((state) => state.weights)

  return <div className="grid lg:grid-cols-3 gap-4">
    <div>
      <LineChartLabels data={weights} />
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
