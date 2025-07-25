import { Suspense } from 'react';
import TicketList from '../../components/TicketList';
import { fetchUserTickets } from '../../lib/dbHelpers';

export const revalidate = 60;

export default async function MyTickets() {
  const tickets = await fetchUserTickets();

  return (
    <div className="p-4">
      <h1>My Tickets</h1>
      <Suspense fallback={<div>Loading tickets...</div>}>
        <TicketList tickets={tickets} />
      </Suspense>
    </div>
  );
}