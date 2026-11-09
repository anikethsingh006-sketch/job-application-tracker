import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

const STATUSES = [
  "Saved",
  "Applied",
  "Online Assessment",
  "Interview",
  "Offer",
  "Rejected",
  "Withdrawn",
];

function Applications() {
  const [applications, setApplications] = useState([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("newest");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch applications whenever search, filters, sorting or page changes
  useEffect(() => {
    let cancelled = false;

    async function fetchApplications() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/applications", {
          params: {
            ...(search.trim() && { search: search.trim() }),
            ...(status && { status }),
            sort,
            page,
            limit,
          },
        });

        if (cancelled) return;

        setApplications(response.data.data);
        setPagination(response.data.pagination);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message || "Failed to fetch applications",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    // Debounce search to avoid an API request on every keystroke
    const timeout = setTimeout(fetchApplications, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [search, status, sort, page, limit, refreshKey]);

  // Delete application
  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this application?",
    );

    if (!confirmed) return;

    try {
      await api.delete(`/applications/${id}`);

      // If this was the only item on the current page,
      // move to the previous page.
      if (applications.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        setRefreshKey((prev) => prev + 1);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete application");
    }
  }

  function handleStatusChange(value) {
    setStatus(value);
    setPage(1);
  }

  function handleSortChange(value) {
    setSort(value);
    setPage(1);
  }

  function handleSearchChange(value) {
    setSearch(value);
    setPage(1);
  }

  function handleLimitChange(value) {
    setLimit(Number(value));
    setPage(1);
  }

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">My Applications</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage and track your job applications.
          </p>
        </div>

        <Link
          to="/applications/new"
          className="rounded-lg bg-indigo-600 px-5 py-3 text-center font-semibold text-white hover:bg-indigo-500"
        >
          + Add Application
        </Link>
      </div>

      {/* Search, filters and sorting */}
      <div className="grid gap-4 rounded-xl border border-slate-800 bg-slate-900 p-5 md:grid-cols-3">
        {/* Search */}
        <div>
          <label className="mb-2 block text-sm text-slate-400">Search</label>

          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search company or role..."
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
          />
        </div>

        {/* Status filter */}
        <div>
          <label className="mb-2 block text-sm text-slate-400">
            Filter by Status
          </label>

          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>

            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* Sorting */}
        <div>
          <label className="mb-2 block text-sm text-slate-400">Sort By</label>

          <select
            value={sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Results information */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-400">
          {pagination.total} application(s) found
        </p>

        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-400">Per page:</label>

          <select
            value={limit}
            onChange={(e) => handleLimitChange(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <p className="py-8 text-center text-slate-400">
          Loading applications...
        </p>
      )}

      {/* Error */}
      {!loading && error && (
        <p className="rounded-lg bg-red-500/10 p-4 text-red-400">{error}</p>
      )}

      {/* Applications table */}
      {!loading && !error && (
        <>
          {applications.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
              <p className="text-slate-400">
                {search || status
                  ? "No applications match your search or filters."
                  : "No applications found. Start by adding one!"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-slate-400">
                  <tr>
                    <th className="p-4">Company</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Applied Date</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {applications.map((application) => (
                    <tr
                      key={application._id}
                      className="border-t border-slate-800 hover:bg-slate-900/50"
                    >
                      <td className="p-4 text-white">{application.company}</td>

                      <td className="p-4 text-slate-300">{application.role}</td>

                      <td className="p-4">
                        <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300">
                          {application.status}
                        </span>
                      </td>

                      <td className="p-4 text-slate-400">
                        {application.appliedDate
                          ? new Date(
                              application.appliedDate,
                            ).toLocaleDateString()
                          : "—"}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <Link
                            to={`/applications/${application._id}/edit`}
                            className="text-indigo-400 hover:text-indigo-300"
                          >
                            Edit
                          </Link>

                          <button
                            onClick={() => handleDelete(application._id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Delete
                          </button>

                          <Link
                            to={`/applications/${application._id}`}
                            className="text-emerald-400 hover:text-emerald-300"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-5">
              <p className="text-sm text-slate-400">
                Page {pagination.page} of {pagination.totalPages}
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPage((prev) => prev - 1)}
                  disabled={page <= 1}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={page >= pagination.totalPages}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Applications;
