"use client";

import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { auth, db } from "../../lib/firebase";
import Navbar from "../../components/Navbar";
import { useDarkMode } from "../../context/DarkModeContext";

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { darkMode, setDarkMode } = useDarkMode();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) return;
      const ticketsRef = ref(db, "tickets");
      onValue(ticketsRef, (snapshot) => {
        const data = snapshot.val() || {};
        const userTickets = Object.entries(data).filter(
          ([_, ticket]) => ticket.loggedBy === user.email
        );
        setTickets(userTickets);
        setLoading(false);
      });
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-xl text-gray-500">
        Loading your tickets...
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">🎟️ My Tickets</h1>
        {tickets.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            You haven’t logged any tickets yet.
          </p>
        ) : (
          <ul className="space-y-6">
            {tickets.map(([id, ticket]) => (
              <li
                key={id}
                className={`rounded-2xl p-6 shadow-md flex flex-col gap-3 ${
                  darkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <div>
                  <h2 className="text-lg font-semibold">{ticket.title}</h2>
                  <p className="text-sm mb-1">{ticket.description}</p>
                  <span
                    className={`text-xs font-bold ${
                      ticket.status === "resolved"
                        ? "text-green-500"
                        : "text-yellow-500"
                    }`}
                  >
                    Status: {ticket.status}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    Logged at: {ticket.createdAt || new Date(ticket.created).toLocaleString()}
                  </p>
                </div>

                <div className="mt-3">
                  <h3 className="font-semibold mb-2 text-sm">💬 Comments:</h3>
                  {ticket.comments ? (
                    <ul className="space-y-1">
                      {Object.entries(ticket.comments).map(([cid, comment]) => (
                        <li key={cid} className="text-sm text-gray-200">
                          <span className="font-bold text-indigo-300">{comment.user}</span>: {comment.text}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs italic text-gray-500">No comments yet.</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
