import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this application?",
    );

    if (!confirmed) return;

    try {
      await api.delete(`/applications/${id}`);

      setApplications((prev) =>
        prev.filter((application) => application._id !== id),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete application");
    }
  }
  useEffect(() => {
    async function fetchApplications() {
      try {
        const response = await api.get("/applications");

        setApplications(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch applications");
      } finally {
        setLoading(false);
      }
    }

    fetchApplications();
  }, []);

  if (loading) return <p>Loading applications...</p>;

  if (error) return <p className="text-red-400">{error}</p>;

  return (
    <div>
      {/* Page heading and Add button */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Applications</h1>

        <Link
          to="/applications/new"
          className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-500"
        >
          + Add Application
        </Link>
      </div>

      {applications.length === 0 ? (
        <p className="mt-6 text-slate-400">
          No applications found. Start by adding one!
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-800">
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
                <tr key={application._id} className="border-t border-slate-800">
                  <td className="p-4">{application.company}</td>
                  <td className="p-4">{application.role}</td>
                  <td className="p-4">{application.status}</td>
                  <td className="p-4">
                    {application.appliedDate
                      ? new Date(application.appliedDate).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="p-4">
                    <Link
                      to={`/applications/${application._id}/edit`}
                      className="text-indigo-400 hover:text-indigo-300"
                    >
                      Edit
                    </Link>
                  </td>
                  <button
                    onClick={() => handleDelete(application._id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Applications;
