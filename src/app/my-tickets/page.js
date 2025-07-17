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
  const { darkMode, setDarkMode } = useDarkMode();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.replace("/signin");
        return;
      }
      setCurrentUser(user);

      const ticketsRef = ref(db, "tickets");
      onValue(ticketsRef, (snapshot) => {
        const data = snapshot.val() || {};
        // Filter tickets where loggedByUid or loggedFor equals currentUser.uid
        const userTickets = Object.entries(data).filter(([_, ticket]) => {
          return (
            ticket.loggedByUid === user.uid || ticket.loggedFor === user.uid
          );
        });
        setTickets(userTickets);
        setLoading(false);
      });
    });
    return () => unsubscribe();
  }, [router]);

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
        <h1
          className={`text-3xl font-extrabold mb-8 ${
            darkMode ? "text-red-300" : "text-red-600"
          }`}
        >
          🎟️ My Tickets
        </h1>

        {tickets.length === 0 ? (
          <p
            className={`text-center italic ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            You haven’t logged any tickets yet.
          </p>
        ) : (
          <ul className="space-y-8">
            {tickets.map(([id, ticket]) => (
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
                            {comment.author /* changed from comment.user */}
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
