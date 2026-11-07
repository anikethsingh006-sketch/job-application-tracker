import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function EditApplication() {
  const { id } = useParams();
  const navigate = useNavigate();

  const companyRef = useRef(null);
  const roleRef = useRef(null);
  const jobUrlRef = useRef(null);
  const locationRef = useRef(null);
  const statusRef = useRef(null);
  const notesRef = useRef(null);

  const [application, setApplication] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch existing application
  useEffect(() => {
    async function fetchApplication() {
      try {
        const response = await api.get(`/applications/${id}`);

        setApplication(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch application");
      } finally {
        setLoading(false);
      }
    }

    fetchApplication();
  }, [id]);

  // Populate form after inputs have mounted
  useEffect(() => {
    if (!application) return;

    companyRef.current.value = application.company || "";
    roleRef.current.value = application.role || "";
    jobUrlRef.current.value = application.jobUrl || "";
    locationRef.current.value = application.location || "";
    statusRef.current.value = application.status || "Saved";
    notesRef.current.value = application.notes || "";
  }, [application]);

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      await api.put(`/applications/${id}`, {
        company: companyRef.current.value,
        role: roleRef.current.value,
        jobUrl: jobUrlRef.current.value,
        location: locationRef.current.value,
        status: statusRef.current.value,
        notes: notesRef.current.value,
      });

      navigate("/applications");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update application");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-slate-300">Loading application...</p>;
  }

  if (error && !application) {
    return <p className="text-red-400">{error}</p>;
  }

  if (!application) return null;

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold">Edit Application</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <input
          ref={companyRef}
          required
          placeholder="Company"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-white"
        />

        <input
          ref={roleRef}
          required
          placeholder="Job Role"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-white"
        />

        <input
          ref={jobUrlRef}
          type="url"
          placeholder="Job URL"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-white"
        />

        <input
          ref={locationRef}
          placeholder="Location"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-white"
        />

        <select
          ref={statusRef}
          defaultValue="Saved"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-white"
        >
          <option value="Saved">Saved</option>
          <option value="Applied">Applied</option>
          <option value="Online Assessment">Online Assessment</option>
          <option value="Interview">Interview</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
          <option value="Withdrawn">Withdrawn</option>
        </select>

        <textarea
          ref={notesRef}
          rows={4}
          placeholder="Notes"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-white"
        />

        {error && <p className="text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {submitting ? "Updating..." : "Update Application"}
        </button>
      </form>
    </div>
  );
}

export default EditApplication;
