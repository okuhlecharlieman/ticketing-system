import TicketForm from '../../components/TicketForm'; // Assume this is a client component

export default function LogTicket() {
  return (
    <div className="p-4">
      <h1>Log a New Ticket</h1>
      <TicketForm /> {/* Client form submits to server action */}
    </div>
  );
}