"use client";

import { useEffect, useState, useMemo } from "react";
import { db, auth } from "../../lib/firebase";
import { ref, onValue, update, remove, get, push } from "firebase/database";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import { useDarkMode } from "../../context/DarkModeContext";
import { LoadingSkeleton } from "../../components/LoadingSkeleton";
import { useDebounce } from "../../hooks/useDebounce";

export default function Technician() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTechnician, setIsTechnician] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [allUsers, setAllUsers] = useState({});
  const [commentLoadingIds, setCommentLoadingIds] = useState(new Set());
  const [actionLoadingIds, setActionLoadingIds] = useState(new Set());
  const [page, setPage] = useState(1);

  const ITEMS_PER_PAGE = 10;
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { darkMode, setDarkMode } = useDarkMode();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.replace("/signin");
        return;
      }

      const userRef = ref(db, "users/" + user.uid);
      const snap = await get(userRef);
      const userData = snap.val();

      if (!userData?.isTechnician) {
        router.replace("/");
        return;
      }

      setIsTechnician(true);

      const usersRef = ref(db, "users");
      const usersSnap = await get(usersRef);
      setAllUsers(usersSnap.val() || {});

      const ticketsRef = ref(db, "tickets");
      onValue(ticketsRef, (snapshot) => {
        setTickets(Object.entries(snapshot.val() || {}));
        setLoading(false);
      });
    });

    return () => unsubscribe();
  }, [router]);

  const getUserDisplay = (uid) => {
    if (!uid) return "Unknown User";
    if (!allUsers[uid]) return "Loading user...";
    const user = allUsers[uid];
    return `${user.name} ${user.surname} (${user.email})`;
  };

  const filteredAndSortedTickets = useMemo(() => {
    const filtered = tickets.filter(([_, ticket]) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        ticket.title.toLowerCase().includes(term) ||
        ticket.description.toLowerCase().includes(term);
      const matchesStatus =
        filterStatus === "all" || ticket.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    // Sort tickets after filtering
    return filtered.sort((a, b) => {
      const aDate = new Date(a[1].createdAt || a[1].created);
      const bDate = new Date(b[1].createdAt || b[1].created);
      return bDate - aDate;
    });
  }, [tickets, searchTerm, filterStatus]); // Removed sortOrder from dependencies

  const paginatedTickets = useMemo(() => {
    return filteredAndSortedTickets.slice(
      (page - 1) * ITEMS_PER_PAGE,
      page * ITEMS_PER_PAGE
    );
  }, [filteredAndSortedTickets, page]);

  const setLoadingForId = (setter, id, isLoading) => {
    setter((prev) => {
      const newSet = new Set(prev);
      if (isLoading) newSet.add(id);
      else newSet.delete(id);
      return newSet;
    });
  };

  const markResolved = async (id, ticket) => {
    if (actionLoadingIds.has(id)) return;
    setLoadingForId(setActionLoadingIds, id, true);
    try {
      await update(ref(db, `tickets/${id}`), {
        ...ticket,
        status: "resolved",
      });
    } catch (e) {
      alert("Error marking ticket as resolved.");
      console.error(e);
    }
    setLoadingForId(setActionLoadingIds, id, false);
  };

  const deleteTicket = async (id) => {
    if (actionLoadingIds.has(id)) return;
    if (!confirm("Are you sure you want to delete this ticket?")) return;
    setLoadingForId(setActionLoadingIds, id, true);
    try {
      await remove(ref(db, `tickets/${id}`));
    } catch (e) {
      alert("Error deleting ticket.");
      console.error(e);
    }
    setLoadingForId(setActionLoadingIds, id, false);
  };

  const addComment = async (ticketId, commentText) => {
    if (!commentText.trim()) return;
    if (commentLoadingIds.has(ticketId)) return;

    const user = auth.currentUser;
    if (!user) {
      alert("You must be signed in to comment.");
      return;
    }

    setLoadingForId(setCommentLoadingIds, ticketId, true);

    try {
      const commentRef = ref(db, `tickets/${ticketId}/comments`);
      await push(commentRef, {
        text: commentText.trim(),
        author: user.email,
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      alert("Error posting comment.");
      console.error(e);
    }

    setLoadingForId(setCommentLoadingIds, ticketId, false);
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

    const formatValue = (val) =>
      String(val || "")
        .replace(/\r?\n|\r/g, " ")
        .replace(/;/g, ",")
        .replace(/"/g, '""');

    const rows = filteredTickets.map(([id, ticket]) => [
      formatValue(id),
      formatValue(ticket.title),
      formatValue(ticket.description),
      formatValue(ticket.status),
      formatValue(ticket.loggedBy || "N/A"),
      formatValue(
        ticket.createdAt ||
          (ticket.created ? new Date(ticket.created).toLocaleString() : "N/A")
      ),
      formatValue(allUsers[ticket.loggedFor]?.email || "N/A"),
      formatValue(ticket.isLoggedByTech ? "Yes" : "No"),
    ]);

    const csvContent = [headers.join(";"), ...rows.map((r) => r.join(";"))].join(
      "\n"
    );

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Technician_ticket_report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const Pagination = () => (
    <div className="flex justify-center gap-2 mt-6">
      <button
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        disabled={page === 1}
        className={`px-4 py-2 rounded ${
          darkMode ? "bg-gray-700" : "bg-gray-200"
        }`}
      >
        Previous
      </button>
      <span className="px-4 py-2">
        Page {page} of {Math.ceil(filteredTickets.length / ITEMS_PER_PAGE)}
      </span>
      <button
        onClick={() => setPage((p) => p + 1)}
        disabled={page >= Math.ceil(filteredTickets.length / ITEMS_PER_PAGE)}
        className={`px-4 py-2 rounded ${
          darkMode ? "bg-gray-700" : "bg-gray-200"
        }`}
      >
        Next
      </button>
    </div>
  );

  if (loading || isTechnician === null) {
    return (
      <div
        className={`flex items-center justify-center h-screen text-xl font-semibold ${
          darkMode ? "text-gray-400" : "text-gray-600"
        }`}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-500 font-sans ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <main className="flex justify-center items-start px-4 py-10">
        <div
          className={`w-full max-w-5xl rounded-3xl shadow-xl p-6 sm:p-8 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h2
            className={`text-2xl sm:text-3xl font-extrabold mb-6 ${
              darkMode ? "text-indigo-300" : "text-indigo-600"
            }`}
          >
            🛠️ Technician Dashboard
          </h2>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6 items-stretch sm:items-center">
            <input
              type="text"
              placeholder="🔍 Search tickets…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full sm:flex-grow px-4 py-2 rounded-xl border focus:outline-none transition ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-gray-200"
                  : "bg-gray-100 border-gray-300 text-gray-900"
              }`}
              aria-label="Search tickets"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`w-full sm:w-auto px-4 py-2 rounded-xl border focus:outline-none transition ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-gray-200"
                  : "bg-gray-100 border-gray-300 text-gray-900"
              }`}
              aria-label="Filter tickets by status"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
            </select>
            <button
              onClick={pullReports}
              className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-indigo-700 transition"
              type="button"
              aria-label="Generate Ticket Report"
            >
              📄 Generate Report
            </button>
          </div>

          {/* Ticket List */}
          <ul className="space-y-8">
            {paginatedTickets.length === 0 && (
              <li
                className={`text-center italic ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                No tickets match your criteria.
              </li>
            )}
            {paginatedTickets.map(([id, ticket]) => {
              const isActionLoading = actionLoadingIds.has(id);
              const isCommentLoading = commentLoadingIds.has(id);

              return (
                <li
                  key={id}
                  className={`rounded-3xl p-6 shadow-md flex flex-col gap-4 ${
                    darkMode ? "bg-gray-700" : "bg-blue-50"
                  }`}
                >
                  <div className="break-words">
                    <h3 className="text-lg md:text-xl font-semibold">
                      {ticket.title}
                    </h3>
                    <p className="text-sm md:text-base mb-2">
                      {ticket.description}
                    </p>
                    <span
                      className={`inline-block text-xs md:text-sm font-semibold px-3 py-1 rounded-full ${
                        ticket.status === "resolved"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      Status: {ticket.status}
                    </span>
                    <div className="text-xs text-gray-400 mt-2 break-words">
                      Logged at:{" "}
                      {ticket.createdAt ||
                        (ticket.created
                          ? new Date(ticket.created).toLocaleString()
                          : "N/A")}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 break-words">
                      Logged by: {getUserDisplay(ticket.loggedByUid)}
                    </div>
                    {ticket.isLoggedByTech && (
                      <div className="text-xs text-gray-500 mt-1 break-words">
                        Logged for: {getUserDisplay(ticket.loggedFor)}
                      </div>
                    )}
                  </div>

                  {/* Comments */}
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2 text-sm">
                      💬 Comments
                    </h4>
                    {ticket.comments ? (
                      <ul className="space-y-2 text-sm max-h-48 overflow-y-auto pr-2">
                        {Object.entries(ticket.comments).map(
                          ([cid, comment]) => (
                            <li
                              key={cid}
                              className={`border-l-4 pl-3 py-1 rounded-r-md ${
                                darkMode
                                  ? "border-blue-400 bg-gray-600 text-gray-200"
                                  : "border-blue-500 bg-blue-100 text-blue-900"
                              }`}
                            >
                              <div className="text-xs text-gray-400 mb-1">
                                {new Date(comment.timestamp).toLocaleString()}{" "}
                                – {comment.author}
                              </div>
                              <p>{comment.text}</p>
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p
                        className={`text-xs italic ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        No comments yet.
                      </p>
                    )}

                    <form
                      className="mt-3 flex flex-col sm:flex-row gap-2"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const input = e.target.elements[`comment-${id}`];
                        if (!input.value.trim()) return;
                        await addComment(id, input.value);
                        input.value = "";
                      }}
                    >
                      <input
                        type="text"
                        name={`comment-${id}`}
                        placeholder="Add comment..."
                        className={`w-full px-3 py-2 rounded border text-sm focus:outline-none ${
                          darkMode
                            ? "bg-gray-600 border-gray-500 text-white"
                            : "bg-gray-100 border-gray-300 text-gray-900"
                        }`}
                        aria-label={`Add comment to ticket ${ticket.title}`}
                        disabled={isCommentLoading}
                      />
                      <button
                        type="submit"
                        className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isCommentLoading}
                      >
                        {isCommentLoading ? "Posting..." : "Post"}
                      </button>
                    </form>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    {ticket.status !== "resolved" && (
                      <button
                        onClick={() => markResolved(id, ticket)}
                        className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isActionLoading}
                      >
                        {isActionLoading ? "Marking..." : "✅ Mark Resolved"}
                      </button>
                    )}
                    <button
                      onClick={() => deleteTicket(id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isActionLoading}
                    >
                      {isActionLoading ? "Deleting..." : "🗑️ Delete"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          <Pagination />
        </div>
      </main>
    </div>
  );
}
