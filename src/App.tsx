import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import "./index.css";
import WeightPage from "./sections/weight";
import SetitngsPage from "./sections/settings";
import { DatePickerWithRange } from "./components/DatePicker";
import OverviewPage from "./sections/overview";
import useMetricsStore from "./store/metrics";
import { useInitializeStore } from "@/hooks/useInitializeStore";
import { useInitializeDatabase } from "@/hooks/useInitializeDatabase";
import { useDatabaseSetup } from "@/hooks/useDatabaseSetup";

function App() {

  // Initialize store and database with custom hooks
  useInitializeStore({ changePath: false });
  useInitializeDatabase();
  // Handle database setup
  useDatabaseSetup();
  const metrics = useMetricsStore((state) => state.metrics)

  return (
    <main className="p-8">
      <h1 className="text-xl font-bold">Dashboard</h1>
      <hr className="my-4" />
      <Tabs defaultValue="overview" className="">
        <div className="flex flex-row justify-between">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {metrics.map((metric) => {

              return <TabsTrigger value={metric.category}>{metric.category}</TabsTrigger>

            })}
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <div>
            <DatePickerWithRange />
          </div>
        </div>
        <TabsContent value="overview">
          <OverviewPage />
        </TabsContent>
        <TabsContent value="Weight">
          <WeightPage />
        </TabsContent>
        <TabsContent value="settings">
          <SetitngsPage />
        </TabsContent>
      </Tabs>
    </main>
  );
}

export default App;
