"use client"
import { useState } from "react";
import { db } from "../../lib/firebase";
import { ref, push } from "firebase/database";

export default function LogTicket() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const submitTicket = async () => {
    if (!title || !description) {
      alert("Please fill in all fields.");
      return;
    }
    try {
      await push(ref(db, "tickets"), {
        title,
        description,
        status: "open",
        created: Date.now(),
        createdAt: new Date().toLocaleString(), // Add this line
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