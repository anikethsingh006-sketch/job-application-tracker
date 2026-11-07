import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AddApplication() {
  const companyRef = useRef(null);
  const roleRef = useRef(null);
  const jobUrlRef = useRef(null);
  const locationRef = useRef(null);
  const statusRef = useRef(null);
  const notesRef = useRef(null);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      await api.post("/applications", {
        company: companyRef.current.value,
        role: roleRef.current.value,
        jobUrl: jobUrlRef.current.value,
        location: locationRef.current.value,
        status: statusRef.current.value,
        notes: notesRef.current.value,
      });

      navigate("/applications");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create application");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold">Add Application</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <input
          ref={companyRef}
          required
          placeholder="Company"
          className="w-full rounded-lg bg-slate-900 border border-slate-700 p-3 text-white"
        />

        <input
          ref={roleRef}
          required
          placeholder="Job Role"
          className="w-full rounded-lg bg-slate-900 border border-slate-700 p-3 text-white"
        />

        <input
          ref={jobUrlRef}
          type="url"
          placeholder="Job URL (optional)"
          className="w-full rounded-lg bg-slate-900 border border-slate-700 p-3 text-white"
        />

        <input
          ref={locationRef}
          placeholder="Location (optional)"
          className="w-full rounded-lg bg-slate-900 border border-slate-700 p-3 text-white"
        />

        <select
          ref={statusRef}
          defaultValue="Saved"
          className="w-full rounded-lg bg-slate-900 border border-slate-700 p-3 text-white"
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
          placeholder="Notes (optional)"
          rows={4}
          className="w-full rounded-lg bg-slate-900 border border-slate-700 p-3 text-white"
        />

        {error && <p className="text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save Application"}
        </button>
      </form>
    </div>
  );
}

export default AddApplication;
