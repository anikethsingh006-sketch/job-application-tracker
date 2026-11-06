import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user, logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-2 text-slate-400">Welcome, {user.name}</p>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-lg bg-red-600 px-5 py-2 hover:bg-red-500"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
