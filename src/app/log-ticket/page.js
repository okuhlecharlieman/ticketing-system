// app/log-ticket/page.jsx (refactored)
"use client";

import { useState, useEffect } from "react";
import { ref, push, get } from "firebase/database";
import { auth, db } from "../../lib/firebase";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import { useDarkMode } from "../../context/DarkModeContext";

export default function LogTicketPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loggedFor, setLoggedFor] = useState("");
  const [users, setUsers] = useState([]);
  const { darkMode, setDarkMode } = useDarkMode();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return router.push("/signin");

      const snapshot = await get(ref(db, "users"));
      const data = snapshot.val() || {};
      const userList = Object.entries(data)
        .filter(([uid]) => uid !== user.uid)
        .map(([uid, info]) => ({ uid, ...info }));
      setUsers(userList);
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const newTicket = {
      title,
      description,
      status: "open",
      createdAt: new Date().toISOString(),
      loggedBy: user.email,
      loggedByUid: user.uid,
      isLoggedByTech: !!loggedFor,
    };

    if (loggedFor) newTicket.loggedFor = loggedFor;

    await push(ref(db, "tickets"), newTicket);
    router.push("/my-tickets");
  };

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-black"} min-h-screen`}>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <main className="max-w-xl mx-auto px-4 py-10">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-indigo-500">📝 Log New Ticket</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className={`w-full px-4 py-3 rounded-xl border text-sm ${
              darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"
            }`}
          />
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            rows={5}
            className={`w-full px-4 py-3 rounded-xl border text-sm resize-none ${
              darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"
            }`}
          ></textarea>

          <select
            value={loggedFor}
            onChange={(e) => setLoggedFor(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border text-sm ${
              darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"
            }`}
          >
            <option value="">Log for myself</option>
            {users.map((u) => (
              <option key={u.uid} value={u.uid}>
                {u.name} {u.surname} ({u.email})
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition"
          >
            🚀 Submit Ticket
          </button>
        </form>
      </main>
    </div>
  );
}
