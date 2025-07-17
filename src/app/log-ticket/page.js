"use client";
import React, { useState, useEffect } from "react";
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
  const [isSubmitting, setIsSubmitting] = useState(false); // 🔥 New state
  const [message, setMessage] = useState(null); // For pop-up messages
  const { darkMode, setDarkMode } = useDarkMode();
  const router = useRouter();

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
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const submitTicket = async () => {
    // Prevent double clicks
    if (isSubmitting) return;

    if (!title || !description) {
      setMessage("Please fill in all fields.");
      return;
    }
    if (!user) {
      setMessage("You must be logged in to submit a ticket.");
      return;
    }

    setIsSubmitting(true);

    try {
      const ticketData = {
        title,
        description,
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

      // Trigger email function
      const response = await fetch("/.netlify/functions/sendTicketEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          email: user.email,
        }),
      });

      if (!response.ok) {
        setMessage("⚠️ Email notification failed.");
      } else {
        setMessage("Ticket submitted!");
      }

      setTitle("");
      setDescription("");
      setSelectedUser("");
    } catch (err) {
      setMessage("Error submitting ticket: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closePopup = () => {
    setMessage(null);
  };

  return (
    <div
      className={`${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      } min-h-screen transition-colors duration-500`}
    >
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      <div className="flex justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
        <div
          className={`w-full max-w-lg rounded-3xl shadow-xl p-10 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h2
            className={`text-3xl font-extrabold mb-8 ${
              darkMode ? "text-red-300" : "text-red-600"
            }`}
          >
            📝 Log a Ticket
          </h2>

          {isTech && (
            <div className="mb-6">
              <label
                className={`block mb-2 text-sm font-semibold ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Log Ticket For
              </label>
              <select
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2
                  focus:ring-red-400 transition
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
            className={`w-full mb-5 px-5 py-3 rounded-2xl border placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-red-400 transition
              ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-gray-200"
                  : "bg-gray-100 border-gray-300 text-gray-900"
              }`}
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className={`w-full mb-6 px-5 py-3 rounded-2xl border placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-red-400 resize-none transition
              ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-gray-200"
                  : "bg-gray-100 border-gray-300 text-gray-900"
              }`}
            placeholder="Description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button
            onClick={submitTicket}
            disabled={isSubmitting}
            className={`w-full font-semibold py-3 rounded-3xl shadow-lg transition transform 
              ${
                isSubmitting
                  ? "bg-red-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 hover:-translate-y-0.5 active:translate-y-0"
              } text-white`}
          >
            {isSubmitting ? "Submitting…" : "🚀 Submit Ticket"}
          </button>
        </div>
      </div>

      {/* Pop-up Modal */}
      {message && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div
            className={`p-6 rounded-xl shadow-lg max-w-sm w-full ${
              darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"
            }`}
          >
            <p className="text-center mb-4">{message}</p>
            <button
              onClick={closePopup}
              className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
