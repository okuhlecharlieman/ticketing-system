"use client";

import { useState, useEffect } from "react";
import { ref, onValue, get } from "firebase/database";
import { auth, db } from "../../lib/firebase";
import Navbar from "../../components/Navbar";
import { useDarkMode } from "../../context/DarkModeContext";
import { useRouter } from "next/navigation";

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState({});
  const [isTechnician, setIsTechnician] = useState(false);
  const [filterUser, setFilterUser] = useState(""); // selected user filter for tech
  const { darkMode, setDarkMode } = useDarkMode();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.replace("/signin");
        return;
      }
      setCurrentUser(user);

      // Check if user is tech
      const userRef = ref(db, "users/" + user.uid);
      const snap = await get(userRef);
      const userData = snap.val();
      const techStatus = userData?.isTechnician || false;
      setIsTechnician(techStatus);

      // fetch all users for dropdown
      const usersRef = ref(db, "users");
      const usersSnap = await get(usersRef);
      setAllUsers(usersSnap.val() || {});

      // Subscribe tickets
      const ticketsRef = ref(db, "tickets");
      onValue(ticketsRef, (snapshot) => {
        const data = snapshot.val() || {};
        setTickets(Object.entries(data));
        setLoading(false);
      });
    });

    return () => unsubscribe();
  }, [router]);

  // Filter tickets by user for non-tech, and for tech by filterUser or all
  const filteredTickets = tickets.filter(([_, ticket]) => {
    if (!currentUser) return false;

    // For user: ticket where loggedByUid or loggedFor === currentUser.uid
    if (!isTechnician) {
      return (
        ticket.loggedByUid === currentUser.uid ||
        ticket.loggedFor === currentUser.uid
      );
    }

    if (filterUser) {
      // Only show tickets where selected user is the recipient (loggedFor)
      return ticket.loggedFor === filterUser;
    }

    // For tech no filter: show all tickets
    return true;
  });

  // Helper: display user name + email for filter dropdown
  const getUserDisplay = (uid) => {
    if (!uid || !allUsers[uid]) return "Unknown User";
    const u = allUsers[uid];
    return `${u.name} ${u.surname} (${u.email})`;
  };

  // Pagination component that uses the filteredTickets variable
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
        Page {page} of {Math.ceil(filteredTickets.length / ITEMS_PER_PAGE || 1)}
      </span>
      <button
        onClick={() => setPage((p) => p + 1)}
        disabled={page >= Math.ceil(filteredTickets.length / ITEMS_PER_PAGE || 1)}
        className={`px-4 py-2 rounded ${
          darkMode ? "bg-gray-700" : "bg-gray-200"
        }`}
      >
        Next
      </button>
    </div>
  );

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center h-screen text-xl font-semibold ${
          darkMode ? "text-gray-400" : "text-gray-600"
        }`}
      >
        Loading your tickets...
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

      <main className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h1
            className={`text-3xl font-extrabold ${
              darkMode ? "text-red-300" : "text-red-600"
            }`}
          >
            🎟️ My Tickets ({filteredTickets.length})
          </h1>

          {isTechnician && (
            <div className="flex items-center gap-2">
              <label
                htmlFor="userFilter"
                className={`font-semibold ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Filter by user:
              </label>
              <select
                id="userFilter"
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className={`px-3 py-2 rounded border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-gray-200"
                    : "bg-gray-100 border-gray-300 text-gray-900"
                }`}
              >
                <option value="">All Users</option>
                {Object.entries(allUsers).map(([uid, user]) => (
                  <option key={uid} value={uid}>
                    {user.name} {user.surname} ({user.email})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {filteredTickets.length === 0 ? (
          <p
            className={`text-center italic ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            You haven't logged any tickets yet.
          </p>
        ) : (
          <ul className="space-y-8">
            {filteredTickets.map(([id, ticket]) => (
              <li
                key={id}
                className={`rounded-3xl p-6 shadow-xl flex flex-col gap-4 ${
                  darkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <div>
                  <h2 className="text-xl font-semibold">{ticket.title}</h2>
                  <p className="text-md mb-2">{ticket.description}</p>
                  <span
                    className={`inline-block text-sm font-bold px-3 py-1 rounded-full ${
                      ticket.status === "resolved"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    Status: {ticket.status}
                  </span>
                  <p className="text-xs text-gray-400 mt-2">
                    Logged at:{" "}
                    {ticket.createdAt ||
                      (ticket.created ? new Date(ticket.created).toLocaleString() : "Unknown")}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Logged by: {ticket.loggedBy || "Unknown"}
                  </p>
                  {ticket.isLoggedByTech && ticket.loggedFor && (
                    <p className="text-xs text-gray-500 mt-1">
                      Logged for:{" "}
                      {allUsers[ticket.loggedFor]?.email
                        ? allUsers[ticket.loggedFor].email
                        : "Unknown user"}
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  <h3 className="font-semibold mb-3 text-sm">💬 Comments:</h3>
                  {ticket.comments ? (
                    <ul className="space-y-2 max-h-48 overflow-y-auto">
                      {Object.entries(ticket.comments).map(([cid, comment]) => (
                        <li
                          key={cid}
                          className={`text-sm rounded-md p-2 ${
                            darkMode
                              ? "bg-gray-700 text-gray-200"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <span className="font-bold text-indigo-400">
                            {comment.author}
                          </span>
                          : {comment.text}
                        </li>
                      ))}
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
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Add the Pagination component here */}
        <Pagination />
      </main>
    </div>
  );
}
