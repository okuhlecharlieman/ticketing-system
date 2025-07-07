"use client"
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { ref, push, onValue } from "firebase/database";

export default function Home() {
  const [tickets, setTickets] = useState([]);
  const [newTicket, setNewTicket] = useState("");

  useEffect(() => {
    const ticketsRef = ref(db, "tickets");
    onValue(ticketsRef, (snapshot) => {
      const data = snapshot.val() || {};

      console.log("Fetched tickets from DB:", data); // Debugging
      setTickets(Object.entries(data));
    }, (error) => {
      console.error("Error fetching tickets:", error); // Debugging
    });
  }, []);

  const addTicket = async () => {
    if (!newTicket) {
      console.log("No ticket text entered."); // Debugging
      return;
    }
    console.log("Attempting to add ticket:", newTicket); // Debugging
    try {
      await push(ref(db, "tickets"), { text: newTicket, created: Date.now() });
      console.log("Ticket added successfully!"); // Debugging
      setNewTicket("");
    } catch (error) {
      console.error("Error adding ticket:", error); // Debugging
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">🎫 Tickets</h1>
        <div className="flex gap-2 mb-6">
          <input
            className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={newTicket}
            onChange={(e) => setNewTicket(e.target.value)}
            placeholder="New ticket"
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            onClick={addTicket}
          >
            Add
          </button>
        </div>
        <ul className="space-y-2">
          {tickets.map(([id, ticket]) => (
            <li
              key={id}
              className="bg-blue-50 border border-blue-200 rounded px-4 py-2 text-gray-800"
            >
              {ticket.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}