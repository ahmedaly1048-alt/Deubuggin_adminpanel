// EventDetail.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";
import { getToken } from "./utils"; // function to get token from localStorage
import { formatDate } from "./formatdate";
import { BASE_URL } from "./config";


export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const fetchEvent = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = getToken(); // get JWT token from localStorage
        if (!token) {
          throw new Error("No token found. Please login.");
        }

        const res = await fetch(`${BASE_URL}/events/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // MUST include token
          },
        });

        if (res.status === 401) {
          throw new Error("Unauthorized. Please login again.");
        }
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Failed to fetch event.");
        }

        const data = await res.json();
        if (mounted) setEvent(data);
      } catch (err) {
        console.error("Failed to fetch event:", err);
        if (mounted) setError(err.message);
        setEvent(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchEvent();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div>Loading event…</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!event) return <div>Event not found</div>;

  const e = {
    id: event.id,
    name: event.title,
    description: event.description,
    kind: event.kind,
    status: event.status_message,
    event_date: event.event_date,
    join_start: event.join_start,
    join_end: event.join_end,
    exposure_pre_start: event.exposure_pre_start,
    exposure_pre_end: event.exposure_pre_end,
    exposure_main_start: event.exposure_main_start,
    exposure_main_end: event.exposure_main_end,
    created: event.createdat,
    updated: event.updatedat,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-black mb-2">Event Detail</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/events")}
            className="flex items-center gap-2 text-black font-medium border border-gray-800 px-4 py-2 rounded"
          >
            <ArrowLeft size={18} /> Back to Events
          </button>

          <Link
            to={`/events/${id}/edit`}
            className="flex items-center gap-2 bg-cyan-400 hover:bg-cyan-500 px-4 py-2 rounded text-black font-semibold"
          >
            <Pencil size={16} /> Edit
          </Link>
        </div>
      </div>

      {/* Event Details */}
      <div className="rounded mb-4 overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <tbody>
            <tr className="border-b border-gray-300">
              <td className="px-4 py-2 font-semibold">Event Title</td>
              <td className="px-4 py-2">{e.name}</td>
            </tr>
            <tr className="border-b border-gray-300">
              <td className="px-4 py-2 font-semibold">Kind</td>
              <td className="px-4 py-2">{e.kind}</td>
            </tr>
            <tr className="border-b border-gray-300">
              <td className="px-4 py-2 font-semibold">Status</td>
              <td className="px-4 py-2">{e.status}</td>
            </tr>
            <tr className="border-b border-gray-300">
              <td className="px-4 py-2 font-semibold">Event Date</td>
              <td className="px-4 py-2">{formatDate(e.event_date)}</td>
            </tr>
            <tr className="border-b border-gray-300">
              <td className="px-4 py-2 font-semibold">Join Start</td>
              <td className="px-4 py-2">{formatDate(e.join_start)}</td>
            </tr>
            <tr className="border-b border-gray-300">
              <td className="px-4 py-2 font-semibold">Join End</td>
              <td className="px-4 py-2">{formatDate(e.join_end)}</td>
            </tr>
            <tr className="border-b border-gray-300">
              <td className="px-4 py-2 font-semibold">Pre Exposure Start</td>
              <td className="px-4 py-2">{formatDate(e.exposure_pre_start)}</td>
            </tr>
            <tr className="border-b border-gray-300">
              <td className="px-4 py-2 font-semibold">Pre Exposure End</td>
              <td className="px-4 py-2">{formatDate(e.exposure_pre_end)}</td>
            </tr>
            <tr className="border-b border-gray-300">
              <td className="px-4 py-2 font-semibold">Main Exposure Start</td>
              <td className="px-4 py-2">{formatDate(e.exposure_main_start)}</td>
            </tr>
            <tr className="border-b border-gray-300">
              <td className="px-4 py-2 font-semibold">Main Exposure End</td>
              <td className="px-4 py-2">{formatDate(e.exposure_main_end)}</td>
            </tr>
            <tr className="border-b border-gray-300">
              <td className="px-4 py-2 font-semibold">Created At</td>
              <td className="px-4 py-2">{formatDate(e.created)}</td>
            </tr>
            <tr className="border-b border-gray-300">
              <td className="px-4 py-2 font-semibold">Updated At</td>
              <td className="px-4 py-2">{formatDate(e.updated)}</td>
            </tr>
            <tr>
              <td className="px-4 py-2 font-semibold">Description</td>
              <td className="px-4 py-2">{e.description}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
