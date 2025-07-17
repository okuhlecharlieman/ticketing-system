"use client";
import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../../lib/firebase";
import { ref, push, get } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import { useDarkMode } from "../../context/DarkModeContext";

export default function LogTicket() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [user, setUser] = useState(null);
  const [isTech, setIsTech] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const { darkMode, setDarkMode } = useDarkMode();
  const router = useRouter();
  const messageTimeoutRef = useRef(null);
  const popupRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        router.push("/signin");
        return;
      }

      try {
        const userRef = ref(db, "users/" + currentUser.uid);
        const snapshot = await get(userRef);
        const userData = snapshot.val();

        if (userData?.isTechnician) {
          setIsTech(true);
          const allUsersRef = ref(db, "users");
          const allUsersSnapshot = await get(allUsersRef);
          const users = [];

          allUsersSnapshot.forEach((child) => {
            const val = child.val();
            users.push({
              id: child.key,
              name: val.name,
              surname: val.surname,
              email: val.email,
            });
          });

          setAllUsers(users);
        } else {
          setIsTech(false);
          setAllUsers([]);
          setSelectedUser("");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Auto-clear message after 5 seconds
  useEffect(() => {
    if (message) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      messageTimeoutRef.current = setTimeout(() => setMessage(null), 5000);
    }
    return () => clearTimeout(messageTimeoutRef.current);
  }, [message]);

  // Close popup if clicking outside the popup content
  const handlePopupClick = (e) => {
    if (popupRef.current && !popupRef.current.contains(e.target)) {
      setMessage(null);
    }
  };

  const submitTicket = async () => {
    if (isSubmitting) return;

    if (!title.trim() || !description.trim()) {
      setMessage("⚠️ Please fill in all fields.");
      return;
    }
    if (!user) {
      setMessage("⚠️ You must be logged in to submit a ticket.");
      return;
    }

    setIsSubmitting(true);

    try {
      const ticketData = {
        title: title.trim(),
        description: description.trim(),
        status: "open",
        created: Date.now(),
        createdAt: new Date().toLocaleString(),
        loggedBy: user.email,
        loggedByUid: user.uid,
      };

      if (isTech && selectedUser) {
        ticketData.loggedFor = selectedUser;
        ticketData.isLoggedByTech = true;
      }

      await push(ref(db, "tickets"), ticketData);

      const response = await fetch("/.netlify/functions/sendTicketEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: ticketData.title, description: ticketData.description, email: user.email }),
      });

      if (!response.ok) {
        setMessage("⚠️ Email notification failed.");
      } else {
        setMessage("✅ Ticket submitted successfully!");
        // Reset form only on success
        setTitle("");
        setDescription("");
        setSelectedUser("");
      }
    } catch (err) {
      setMessage("❌ Error submitting ticket: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 flex flex-col ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      <main className="flex-grow flex justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
        <div
          className={`w-full max-w-lg p-8 rounded-3xl shadow-2xl transition-colors duration-300 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h2
            className={`text-3xl font-extrabold mb-6 text-center ${
              darkMode ? "text-red-300" : "text-red-600"
            }`}
          >
            📝 Log a Ticket
          </h2>

          {isTech && (
            <div className="mb-5">
              <label
                htmlFor="userSelect"
                className={`block mb-2 text-sm font-semibold ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Log Ticket For
              </label>
              <select
                id="userSelect"
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-red-400 transition
                  ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-gray-200"
                      : "bg-gray-100 border-gray-300 text-gray-900"
                  }`}
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">Select a User</option>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} {u.surname} ({u.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <input
            type="text"
            placeholder="Title"
            aria-label="Ticket Title"
            className={`w-full mb-5 px-5 py-3 rounded-2xl border placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-red-400 transition
              ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-gray-200"
                  : "bg-gray-100 border-gray-300 text-gray-900"
              }`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            autoFocus
          />

          <textarea
            placeholder="Description"
            aria-label="Ticket Description"
            rows={5}
            className={`w-full mb-6 px-5 py-3 rounded-2xl border placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-red-400 resize-none transition
              ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-gray-200"
                  : "bg-gray-100 border-gray-300 text-gray-900"
              }`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
          />

          <button
            onClick={submitTicket}
            disabled={isSubmitting}
            className={`w-full font-semibold py-3 rounded-3xl shadow-lg transition transform flex justify-center items-center gap-2
              ${
                isSubmitting
                  ? "bg-red-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 hover:-translate-y-0.5 active:translate-y-0"
              } text-white`}
          >
            {isSubmitting && (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
            )}
            {isSubmitting ? "Submitting…" : "🚀 Submit Ticket"}
          </button>
        </div>
      </main>

      {/* Message Popup */}
      {message && (
        <div
          onClick={handlePopupClick}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
        >
          <div
            ref={popupRef}
            className={`p-6 rounded-xl shadow-xl max-w-sm w-full mx-4 transition-colors duration-300 ${
              darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"
            }`}
            role="alert"
            aria-live="assertive"
          >
            <p className="text-center mb-4 select-text">{message}</p>
            <button
              onClick={() => setMessage(null)}
              className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-400"
              aria-label="Close message popup"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
