import { useState } from "react";
import Dashboard from "./views/Dashboard";
import { QueryClient, QueryClientProvider } from "react-query";
import { Routes } from "react-router-dom";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}

export default App;
