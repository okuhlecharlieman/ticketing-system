"use client"

import { useEffect, useState, useMemo } from "react";
import { db, auth } from "../../lib/firebase";
import {
  ref,
  onValue,
  update,
  remove,
  get,
  push,
} from "firebase/database";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import { useDarkMode } from "../../context/DarkModeContext";

export default function Technician() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTechnician, setIsTechnician] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const { darkMode, setDarkMode } = useDarkMode();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/signin");
        return;
      }

      const userRef = ref(db, "users/" + user.uid);
      const snap = await get(userRef);
      const userData = snap.val();

      if (!userData?.isTechnician) {
        router.push("/");
        return;
      }

      setIsTechnician(true);

      const ticketsRef = ref(db, "tickets");
      onValue(ticketsRef, (snapshot) => {
        const data = snapshot.val() || {};
        setTickets(Object.entries(data));
        setLoading(false);
      });
    });

    return () => unsubscribe();
  }, [router]);

  const filteredTickets = useMemo(() => {
    return tickets.filter(([_, ticket]) => {
      const term = searchTerm.trim().toLowerCase();
      const matchesTerm =
        ticket.title.toLowerCase().includes(term) ||
        ticket.description.toLowerCase().includes(term) ||
        (ticket.loggedBy || "").toLowerCase().includes(term);

      const matchesStatus =
        filterStatus === "all" || ticket.status === filterStatus;

      return matchesTerm && matchesStatus;
    });
  }, [tickets, searchTerm, filterStatus]);

  const markResolved = async (id, ticket) => {
    await update(ref(db, `tickets/${id}`), {
      ...ticket,
      status: "resolved",
    });
  };

  const deleteTicket = async (id) => {
    if (confirm("Are you sure you want to delete this ticket?")) {
      await remove(ref(db, `tickets/${id}`));
    }
  };

  const addComment = async (ticketId, commentText) => {
    const user = auth.currentUser;
    if (!user || !commentText.trim()) return;

    const commentRef = ref(db, `tickets/${ticketId}/comments`);
    await push(commentRef, {
      text: commentText,
      author: user.email,
      timestamp: new Date().toISOString(),
    });
  };

  const pullReports = () => {
    if (filteredTickets.length === 0) {
      alert("No tickets to report based on your filter.");
      return;
    }

    const headers = [
      "Ticket ID",
      "Title",
      "Description",
      "Status",
      "Logged By",
      "Logged At",
      "Logged For",
      "Is Technician Logged",
    ];

    const formatValue = (val) => {
      const clean = String(val || "")
        .replace(/\r?\n|\r/g, " ")
        .replace(/;/g, ",");
      return clean.includes(" ") ? `"${clean}"` : clean;
    };

    const rows = filteredTickets.map(([id, ticket]) => [
      formatValue(id),
      formatValue(ticket.title),
      formatValue(ticket.description),
      formatValue(ticket.status),
      formatValue(ticket.loggedBy || "N/A"),
      formatValue(
        ticket.createdAt ||
          (ticket.created
            ? new Date(ticket.created).toLocaleString()
            : "N/A")
      ),
      formatValue(ticket.loggedFor || "N/A"),
      formatValue(ticket.isLoggedByTech ? "Yes" : "No"),
    ]);

    const csvContent = [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `filtered_tickets_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || isTechnician === null) {
    return (
      <div className="flex items-center justify-center h-screen text-xl text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div
      className={`${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      } min-h-screen transition-colors duration-500`}
    >
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="flex justify-center items-start px-4 py-10">
        <div
          className={`w-full max-w-4xl rounded-3xl shadow-xl p-8 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h2
            className={`text-3xl font-extrabold mb-6 ${
              darkMode ? "text-indigo-300" : "text-indigo-600"
            }`}
          >
            🛠️ Technician Dashboard
          </h2>

          {/* Controls */}
          <div className="flex flex-wrap gap-4 mb-6 items-center">
            <input
              type="text"
              placeholder="🔍 Search tickets…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`flex-grow px-4 py-2 rounded-xl border focus:outline-none transition ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-gray-200"
                  : "bg-gray-100 border-gray-300 text-gray-900"
              }`}
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-2 rounded-xl border focus:outline-none transition ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-gray-200"
                  : "bg-gray-100 border-gray-300 text-gray-900"
              }`}
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
            </select>
            <button
              onClick={pullReports}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-indigo-700 transition"
            >
              📄 Download Report
            </button>
          </div>

          {/* Ticket List */}
          <ul className="space-y-6">
            {filteredTickets.length === 0 && (
              <li className="text-center text-gray-500">
                No tickets match your criteria.
              </li>
            )}
            {filteredTickets.map(([id, ticket]) => (
              <li
                key={id}
                className={`rounded-2xl p-6 shadow-md flex flex-col gap-3 ${
                  darkMode ? "bg-gray-700" : "bg-blue-50"
                }`}
              >
                <div>
                  <h3 className="text-lg font-semibold">{ticket.title}</h3>
                  <p className="text-sm mb-2">{ticket.description}</p>
                  <span
                    className={`text-xs font-semibold ${
                      ticket.status === "resolved"
                        ? "text-green-500"
                        : "text-yellow-500"
                    }`}
                  >
                    Status: {ticket.status}
                  </span>
                  <div className="text-xs text-gray-400 mt-1">
                    Logged at:{" "}
                    {ticket.createdAt ||
                      (ticket.created
                        ? new Date(ticket.created).toLocaleString()
                        : "N/A")}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Logged by: {ticket.loggedBy || "Unknown"}
                  </div>
                </div>

                {/* Comment List */}
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">💬 Comments</h4>
                  {ticket.comments ? (
                    <ul className="space-y-2 text-sm">
                      {Object.entries(ticket.comments).map(([cid, comment]) => (
                        <li
                          key={cid}
                          className="border-l-4 pl-2 border-blue-400"
                        >
                          <div className="text-xs text-gray-400">
                            {new Date(comment.timestamp).toLocaleString()} -{" "}
                            {comment.author}
                          </div>
                          <p>{comment.text}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-400">No comments yet.</p>
                  )}

                  {/* Add Comment */}
                  <form
                    className="mt-3 flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.target;
                      const input = form.elements[`comment-${id}`];
                      addComment(id, input.value);
                      input.value = "";
                    }}
                  >
                    <input
                      type="text"
                      name={`comment-${id}`}
                      placeholder="Add comment..."
                      className={`flex-grow px-3 py-2 rounded border text-sm focus:outline-none ${
                        darkMode
                          ? "bg-gray-600 border-gray-500 text-white"
                          : "bg-gray-100 border-gray-300"
                      }`}
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                    >
                      Post
                    </button>
                  </form>
                </div>

                {/* Ticket Actions */}
                <div className="flex flex-wrap gap-3 pt-4">
                  {ticket.status !== "resolved" && (
                    <button
                      onClick={() => markResolved(id, ticket)}
                      className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs hover:bg-green-700"
                    >
                      ✅ Mark Resolved
                    </button>
                  )}
                  <button
                    onClick={() => deleteTicket(id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs hover:bg-red-700"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}