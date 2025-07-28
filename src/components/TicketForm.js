// src/components/TicketForm.js
'use client';

import { useState } from 'react';
import { useFormState } from 'react-dom';
import { createTicket } from '../app/api/tickets/route';  // Corrected relative path (ensure /app/api/tickets/route.js exists)

export default function TicketForm() {
  const [state, formAction] = useFormState(createTicket, null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  return (
    <form action={formAction}>
      <input name="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="border p-2" />
      <textarea name="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="border p-2" />
      <button type="submit" className="bg-blue-500 text-white p-2">Submit</button>
      {state?.error && <p>{state.error}</p>}
    </form>
  );
}
