import { Suspense } from 'react';
import CommentSection from '../../../components/CommentSection';
import { fetchTicket } from '../../../lib/dbHelpers';

export default async function TicketPage({ params }) {
  const ticket = await fetchTicket(params.id);

  return (
    <div className="p-4">
      <h1>{ticket.title}</h1>
      <p>{ticket.description}</p>
      <Suspense fallback={<div>Loading comments...</div>}>
        <CommentSection ticketId={params.id} />
      </Suspense>
      {/* Add resolve button if technician */}
    </div>
  );
}