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
      setTickets(Object.entries(data));
    });
  }, []);

  const addTicket = async () => {
    if (!newTicket) return;
    await push(ref(db, "tickets"), { text: newTicket, created: Date.now() });
    setNewTicket("");
  };

  return (
    <div>
      <h1>Tickets</h1>
      <input
        value={newTicket}
        onChange={(e) => setNewTicket(e.target.value)}
        placeholder="New ticket"
      />
      <button onClick={addTicket}>Add Ticket</button>
      <ul>
        {tickets.map(([id, ticket]) => (
          <li key={id}>{ticket.text}</li>
        ))}
      </ul>
    </div>
  );
}