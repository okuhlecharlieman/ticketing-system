"use client"
import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { ref, onValue } from "firebase/database";

export default function Technician() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const ticketsRef = ref(db, "tickets");
    onValue(ticketsRef, (snapshot) => {
      const data = snapshot.val() || {};
      setTickets(Object.entries(data));
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-4 text-blue-600">Technician Dashboard</h2>
        <ul className="space-y-4">
          {tickets.map(([id, ticket]) => (
            <li key={id} className="border rounded p-4 bg-blue-50">
              <h3 className="font-semibold">{ticket.title}</h3>
              <p className="mb-2">{ticket.description}</p>
              <span className="text-xs text-gray-500">Status: {ticket.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}