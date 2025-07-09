"use client"
import { useEffect, useState } from "react";
import { db, auth } from "../../lib/firebase";
import { ref, onValue, update, remove, get } from "firebase/database";
import { useRouter } from "next/navigation";

export default function Technician() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTechnician, setIsTechnician] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/signin");
        return;
      }
      // Check technician status
      const userRef = ref(db, "users/" + user.uid);
      const snapshot = await get(userRef);
      const userData = snapshot.val();
      if (!userData?.isTechnician) {
        router.push("/"); // redirect non-technicians
        return;
      }
      setIsTechnician(true);
      // Load tickets
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
    await update(ref(db, `tickets/${id}`), { ...ticket, status: "resolved" });
  };

  const deleteTicket = async (id) => {
    if (confirm("Are you sure you want to delete this ticket?")) {
      await remove(ref(db, `tickets/${id}`));
    }
  };

  if (loading || isTechnician === null) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-4 text-blue-600">Technician Dashboard</h2>
        <ul className="space-y-4">
          {tickets.map(([id, ticket]) => (
            <li key={id} className="border rounded p-4 bg-blue-50 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-semibold">{ticket.title}</h3>
                <p className="mb-2">{ticket.description}</p>
                <span className={`text-xs font-semibold ${ticket.status === "resolved" ? "text-green-600" : "text-gray-500"}`}>
                  Status: {ticket.status}
                </span>
                <div className="text-xs text-gray-400 mt-1">
                  Logged at: {ticket.createdAt || (ticket.created ? new Date(ticket.created).toLocaleString() : "N/A")}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Logged by: {ticket.loggedBy || "Unknown"}
                </div>
              </div>
              <div className="flex gap-2 mt-2 md:mt-0">
                {ticket.status !== "resolved" && (
                  <button
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-xs"
                    onClick={() => markResolved(id, ticket)}
                  >
                    Mark Resolved
                  </button>
                )}
                <button
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-xs"
                  onClick={() => deleteTicket(id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}