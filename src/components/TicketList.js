'use client';
const TicketList = ({ tickets, role, onOpenModal }) => (
  <ul className="ticket-list">
    {tickets.map((ticket) => (
      <li key={ticket.id} className="ticket-item" onClick={() => onOpenModal(ticket)}>
        <h3 className={ticket.status === 'Resolved' || ticket.status === 'Closed' ? 'status-resolved' : ''}>{ticket.title}</h3>
        <p>Status: {ticket.status} | Priority: <span className={`priority-${ticket.priority.toLowerCase()}`}>{ticket.priority}</span> | Category: {ticket.category} | Assignee: {ticket.assignee || 'Unassigned'}</p>
      </li>
    ))}
  </ul>
);

export default TicketList;