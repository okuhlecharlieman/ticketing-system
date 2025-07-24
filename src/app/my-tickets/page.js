import { Suspense } from 'react';
import TicketList from '../../components/TicketList';
import { fetchUserTickets } from '../../lib/dbHelpers'; // Server helper

export const revalidate = 60; // Revalidate every 60s for semi-static

export default async function MyTickets() {
  const tickets = await fetchUserTickets(); // Server fetch

  return (
    <div className="p-4">
      <h1>My Tickets</h1>
      <Suspense fallback={<div>Loading tickets...</div>}>
        <TicketList tickets={tickets} />
      </Suspense>
    </div>
  );
}