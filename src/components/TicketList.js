import Link from 'next/link';

export default function TicketList({ tickets, isTechnician = false }) {
  return (
    <ul className="space-y-4">
      {tickets.map((ticket) => (
        <li key={ticket.id} className="border p-4 rounded">
          <Link href={`/ticket/${ticket.id}`}>
            <h2>{ticket.title}</h2>
            <p>Status: {ticket.status}</p>
            {isTechnician && <button>Resolve</button>}  {/* Add logic via server action */}
          </Link>
        </li>
      ))}
    </ul>
  );
}