import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Predictions from "./pages/Predictions";
import RecoveryResults from "./pages/RecoveryResults";

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageTitle = {
    dashboard: "Dashboard",
    predictions: "AI Prediction",
    results: "Recovery Results",
  }[activePage];

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />

      <div className="lg:pl-72">
        <Navbar
          title={pageTitle}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          {activePage === "dashboard" && <Dashboard />}
          {activePage === "predictions" && <Predictions />}
          {activePage === "results" && <RecoveryResults />}
        </main>
      </div>
    </div>
  );
}

export default App;