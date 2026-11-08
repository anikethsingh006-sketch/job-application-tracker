import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import api from "../services/api";

const STATUS_COLORS = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#3b82f6",
  "#a855f7",
  "#ef4444",
  "#64748b",
];

function formatMonth(month) {
  const [year, monthNumber] = month.split("-");
  return new Date(Number(year), Number(monthNumber) - 1).toLocaleString(
    "en-US",
    { month: "short" },
  );
}

function formatDate(date) {
  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function StatCard({ title, value, description }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await api.get("/analytics");
        setAnalytics(response.data.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load dashboard analytics",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-10 text-center text-slate-400">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  if (!analytics) return null;

  const {
    overview,
    statusDistribution,
    applicationTrend,
    upcomingInterviews,
    recentActivity,
  } = analytics;

  const stats = [
    {
      title: "Total Applications",
      value: overview.totalApplications,
      description: "Applications in your tracker",
    },
    {
      title: "Total Interviews",
      value: overview.totalInterviews,
      description: "Interview rounds recorded",
    },
    {
      title: "Total Offers",
      value: overview.totalOffers,
      description: "Offers received",
    },
    {
      title: "Response Rate",
      value: `${overview.responseRate}%`,
      description: "Excluding saved and withdrawn applications",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          Track your job search performance and progress.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="mb-5 text-lg font-semibold text-white">
            Application Status
          </h2>

          {statusDistribution.length === 0 ? (
            <p className="py-16 text-center text-slate-500">
              No application data yet.
            </p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="45%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell
                        key={entry.status}
                        fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="mb-5 text-lg font-semibold text-white">
            Applications Over Time
          </h2>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={applicationTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="month"
                  tickFormatter={formatMonth}
                  stroke="#94a3b8"
                />
                <YAxis allowDecimals={false} stroke="#94a3b8" />
                <Tooltip
                  labelFormatter={formatMonth}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Bar
                  dataKey="count"
                  name="Applications"
                  fill="#6366f1"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Upcoming interviews and recent activity */}
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="mb-5 text-lg font-semibold text-white">
            Upcoming Interviews
          </h2>

          {upcomingInterviews.length === 0 ? (
            <p className="py-8 text-center text-slate-500">
              No upcoming interviews.
            </p>
          ) : (
            <div className="space-y-4">
              {upcomingInterviews.map((interview) => (
                <div
                  key={interview._id}
                  className="rounded-lg border border-slate-800 bg-slate-950 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">
                        {interview.company}
                      </p>
                      <p className="text-sm text-slate-400">{interview.role}</p>
                    </div>
                    <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300">
                      {interview.type}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-slate-300">
                    {interview.round}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDate(interview.scheduledAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="mb-5 text-lg font-semibold text-white">
            Recent Activity
          </h2>

          {recentActivity.length === 0 ? (
            <p className="py-8 text-center text-slate-500">
              No recent activity.
            </p>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex gap-3 border-b border-slate-800 pb-4 last:border-0"
                >
                  <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-400" />

                  <div className="min-w-0">
                    <p className="text-sm text-white">{activity.action}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {activity.company} · {activity.role}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {activity.status} · {formatDate(activity.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
