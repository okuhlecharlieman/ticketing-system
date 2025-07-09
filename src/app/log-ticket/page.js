"use client"
import React from "react";
import { useState } from "react";
import { db, auth } from "../../lib/firebase";
import { ref, push, get } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";

export default function LogTicket() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [user, setUser] = useState(null);

  // Listen for auth state
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

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
      // Fetch user profile from database
      const userRef = ref(db, "users/" + user.uid);
      const snapshot = await get(userRef);
      const userData = snapshot.val();

      await push(ref(db, "tickets"), {
        title,
        description,
        status: "open",
        created: Date.now(),
        createdAt: new Date().toLocaleString(),
        loggedBy: userData ? `${userData.name} ${userData.surname}` : user.email,
        loggedByUid: user.uid,
      });
      setTitle("");
      setDescription("");
      alert("Ticket submitted!");
    } catch (error) {
      alert("Error submitting ticket: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-blue-600">Log a Ticket</h2>
        <input
          className="w-full mb-3 px-3 py-2 border rounded"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <textarea
          className="w-full mb-3 px-3 py-2 border rounded"
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <button
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          onClick={submitTicket}
        >
          Submit Ticket
        </button>
      </div>
    </div>
  );
}