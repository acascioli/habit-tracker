import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { invoke } from "@tauri-apps/api/core";
import "./index.css";
import { Button } from "@/components/ui/button"
import WeightPage from "./sections/weight";

function App() {

  return (
    <main className="p-8">
      <h1 className="text-xl font-bold">Dashboard</h1>
      <hr className="my-4" />
      <Tabs defaultValue="account" className="">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <WeightPage />
        </TabsContent>
        <TabsContent value="password">Change your password here.</TabsContent>
      </Tabs>
    </main>
  );
}

export default App;
