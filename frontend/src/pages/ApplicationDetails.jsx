import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

function ApplicationDetails() {
  const { id } = useParams();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) return <p>Loading application...</p>;

  if (error) return <p className="text-red-400">{error}</p>;

  if (!application) return null;

  return (
    <div className="space-y-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{application.company}</h1>
          <p className="mt-1 text-slate-400">{application.role}</p>
        </div>

        <Link
          to={`/applications/${application._id}/edit`}
          className="rounded-lg bg-indigo-600 px-4 py-2 hover:bg-indigo-500"
        >
          Edit Application
        </Link>
      </div>

      <div className="grid gap-4 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <Detail label="Status" value={application.status} />
        <Detail label="Location" value={application.location} />
        <Detail label="Job URL" value={application.jobUrl} />
        <Detail
          label="Applied Date"
          value={
            application.appliedDate
              ? new Date(application.appliedDate).toLocaleDateString()
              : "Not specified"
          }
        />
        <Detail label="Notes" value={application.notes} />
      </div>
      {/* Status History */}
      <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-5 text-xl font-semibold">Status History</h2>

        {application.statusEvents?.length > 0 ? (
          <div className="space-y-4">
            {[...application.statusEvents].reverse().map((event, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="mt-1 h-3 w-3 rounded-full bg-indigo-500" />

                <div>
                  <p className="font-medium">{event.status}</p>
                  <p className="text-sm text-slate-400">
                    {new Date(event.changedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400">No status history available.</p>
        )}
      </section>
      {/* Interviews */}
      <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-5 text-xl font-semibold">Interviews</h2>

        {application.interviews?.length > 0 ? (
          <div className="space-y-4">
            {application.interviews.map((interview, index) => (
              <div
                key={index}
                className="rounded-lg border border-slate-700 p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{interview.round}</h3>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-sm">
                    {interview.outcome}
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-sm text-slate-400">
                  <p>Type: {interview.type}</p>

                  <p>
                    Scheduled:{" "}
                    {new Date(interview.scheduledAt).toLocaleString()}
                  </p>

                  <p>Duration: {interview.durationMinutes} minutes</p>

                  {interview.meetingLink && (
                    <p>
                      Meeting:{" "}
                      <a
                        href={interview.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-400 hover:underline"
                      >
                        Join meeting
                      </a>
                    </p>
                  )}

                  {interview.location && <p>Location: {interview.location}</p>}

                  {interview.notes && <p>Notes: {interview.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400">No interviews scheduled yet.</p>
        )}
      </section>
      <Link
        to="/applications"
        className="text-indigo-400 hover:text-indigo-300"
      >
        ← Back to Applications
      </Link>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1">{value || "Not specified"}</p>
    </div>
  );
}

export default ApplicationDetails;
