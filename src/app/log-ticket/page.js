"use client";
import React, { useState, useEffect } from "react";
import { db, auth } from "../../lib/firebase";
import { ref, push, get } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import Navbar from "../../components/Navbar";

export default function LogTicket() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [user, setUser] = useState(null);
  const [isTech, setIsTech] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [darkMode, setDarkMode] = useState(false);
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

          allUsersSnapshot.forEach((childSnapshot) => {
            const val = childSnapshot.val();
            users.push({
              id: childSnapshot.key,
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
    if (!title || !description) {
      alert("Please fill in all fields.");
      return;
    }

    if (!user) {
      alert("You must be logged in to submit a ticket.");
      return;
    }

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

      const emailPayload = {
        title,
        description,
        email: user.email,
      };

      const response = await fetch("/.netlify/functions/sendTicketEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailPayload),
      });

      if (!response.ok) {
        alert("⚠️ Email notification failed.");
      }

      setTitle("");
      setDescription("");
      setSelectedUser("");
      alert("Ticket submitted!");
    } catch (err) {
      alert("Error submitting ticket: " + err.message);
    }
  };

  return (
    <div className={`${darkMode ? "bg-zinc-900 text-white" : "bg-blue-50 text-gray-900"} min-h-screen transition-colors duration-500`}>
      <Navbar />

      {/* Theme Toggle */}
      <div className="flex justify-end px-6 pt-4">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* Ticket Form */}
      <div className="flex justify-center items-center py-10">
        <div className="bg-white dark:bg-zinc-800 p-8 rounded-2xl shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-blue-600 dark:text-blue-300">📝 Log a Ticket</h2>

          {isTech && (
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium">Log Ticket For</label>
              <select
                className="w-full px-3 py-2 border rounded dark:bg-zinc-700 dark:text-white"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">Select a User</option>
                {allUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} {user.surname} ({user.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <input
            className="w-full mb-3 px-3 py-2 border rounded dark:bg-zinc-700 dark:text-white"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="w-full mb-4 px-3 py-2 border rounded dark:bg-zinc-700 dark:text-white"
            placeholder="Description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            onClick={submitTicket}
          >
            🚀 Submit Ticket
          </button>
        </div>
      </div>
    </div>
  );
}
