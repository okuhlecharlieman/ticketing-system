// app/my-tickets/page.jsx (refactored)
"use client";

import { useEffect, useState, useMemo } from "react";
import { db, auth } from "../../lib/firebase";
import { ref, onValue, update, remove, push } from "firebase/database";
import Navbar from "../../components/Navbar";
import TicketCard from "../../components/TicketCard";
import { useDarkMode } from "../../context/DarkModeContext";

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const { darkMode, setDarkMode } = useDarkMode();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) return;
      setUser(currentUser);

      onValue(ref(db, "tickets"), (snapshot) => {
        const all = Object.entries(snapshot.val() || {});
        const mine = all.filter(([_, t]) => t.loggedByUid === currentUser.uid || t.loggedFor === currentUser.uid);
        setTickets(mine);
      });
    });
    return () => unsubscribe();
  }, []);

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return tickets.filter(([_, t]) => {
      const match =
        t.title?.toLowerCase().includes(term) ||
        t.description?.toLowerCase().includes(term) ||
        t.status?.toLowerCase().includes(term);
      return match && (filterStatus === "all" || t.status === filterStatus);
    });
  }, [tickets, searchTerm, filterStatus]);

  const handleMarkResolved = async (id, ticket) => {
    await update(ref(db, `tickets/${id}`), { ...ticket, status: "resolved" });
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this ticket?")) await remove(ref(db, `tickets/${id}`));
  };

  const handleAddComment = async (ticketId, text) => {
    if (!user || !text.trim()) return;
    await push(ref(db, `tickets/${ticketId}/comments`), {
      text,
      author: user.email,
      timestamp: new Date().toISOString(),
    });
  };

  const getUserDisplay = () => (user ? `${user.email}` : "Unknown");

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-black"} min-h-screen`}>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-indigo-500">🎫 My Tickets</h1>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search my tickets..."
            className={`px-4 py-2 rounded-xl border w-full sm:flex-1 ${
              darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"
            }`}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-4 py-2 rounded-xl border ${
              darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"
            }`}
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <ul className="space-y-6">
          {filtered.map(([id, ticket]) => (
            <TicketCard
              key={id}
              id={id}
              ticket={ticket}
              userDisplay={() => getUserDisplay()}
              onMarkResolved={handleMarkResolved}
              onDelete={handleDelete}
              onAddComment={handleAddComment}
              darkMode={darkMode}
            />
          ))}
        </ul>
      </main>
    </div>
  );
}
