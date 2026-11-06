import { Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "./Sidebar";

function DashboardLayout() {
  const { user, logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="flex items-center justify-between border-b border-slate-800 px-8 py-5">
        <h1 className="text-xl font-bold">JobTracker</h1>

        <div className="flex items-center gap-5">
          <span className="text-slate-300">{user.name}</span>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-600 px-4 py-2 hover:bg-red-500"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
