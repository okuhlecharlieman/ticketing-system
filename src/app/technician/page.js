import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import TicketList from '../../components/TicketList';
import { fetchAllTickets, checkIsTechnician } from '../../lib/dbHelpers';

export const revalidate = 30; // Frequent revalidation for dashboard

export default async function Technician() {
  const isTechnician = await checkIsTechnician();
  if (!isTechnician) redirect('/');

  const tickets = await fetchAllTickets();

  return (
    <div className="p-4">
      <h1>Technician Dashboard</h1>
      <Suspense fallback={<div>Loading tickets...</div>}>
        <TicketList tickets={tickets} isTechnician={true} /> {/* Add filter UI */}
      </Suspense>
    </div>
  );
}