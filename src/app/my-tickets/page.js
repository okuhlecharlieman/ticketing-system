"use client";

import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
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

      if (techStatus) {
        // fetch all users for dropdown
        const usersRef = ref(db, "users");
        const usersSnap = await get(usersRef);
        setAllUsers(usersSnap.val() || {});
      }

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

    // For tech with filter selected: tickets loggedByUid or loggedFor equals filterUser UID
    if (filterUser) {
      return ticket.loggedByUid === filterUser || ticket.loggedFor === filterUser;
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
            You haven’t logged any tickets yet.
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
                      new Date(ticket.created).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Logged by: {ticket.loggedBy || "Unknown"}
                  </p>
                  {ticket.isLoggedByTech && (
                    <p className="text-xs text-gray-500 mt-1">
                      Logged for: {ticket.loggedFor
                        ? allUsers[ticket.loggedFor]
                          ? getUserDisplay(ticket.loggedFor)
                          : ticket.loggedFor
                        : "N/A"}
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
      </main>
    </div>
  );
}
