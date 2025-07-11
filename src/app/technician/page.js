"use client";
import { useEffect, useState } from "react";
import { db, auth } from "../../lib/firebase";
import { ref, onValue, update, remove, get } from "firebase/database";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import { useDarkMode } from "../../context/DarkModeContext";

export default function Technician() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTechnician, setIsTechnician] = useState(null);
  const { darkMode } = useDarkMode();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/signin");
        return;
      }

      const userRef = ref(db, "users/" + user.uid);
      const snapshot = await get(userRef);
      const userData = snapshot.val();

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
            className={`text-3xl font-extrabold mb-8 ${
              darkMode ? "text-indigo-300" : "text-indigo-600"
            }`}
          >
            🛠️ Technician Dashboard
          </h2>

          <ul className="space-y-6">
            {tickets.map(([id, ticket]) => (
              <li
                key={id}
                className={`rounded-2xl p-6 shadow-md flex flex-col gap-2 ${
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

                <div className="flex flex-wrap gap-3 pt-2">
                  {ticket.status !== "resolved" && (
                    <button
                      onClick={() => markResolved(id, ticket)}
                      className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs hover:bg-green-700 transition"
                    >
                      ✅ Mark Resolved
                    </button>
                  )}
                  <button
                    onClick={() => deleteTicket(id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs hover:bg-red-700 transition"
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
