import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import "./index.css";
import WeightPage from "./sections/weight";
import SetitngsPage from "./sections/settings";

function App() {

  return (
    <main className="p-8">
      <h1 className="text-xl font-bold">Dashboard</h1>
      <hr className="my-4" />
      <Tabs defaultValue="settings" className="">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="weight">Weight</TabsTrigger>
        </TabsList>
        <TabsContent value="settings">
          <SetitngsPage />
        </TabsContent>
        <TabsContent value="weight">
          <WeightPage />
        </TabsContent>
      </Tabs>
    </main>
  );
}

export default App;
