'use client';

import { useState } from 'react';

export default function TicketForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, description }),
    });

    const data = await res.json();
    if (res.ok) {
      setSuccess('Ticket submitted successfully!');
      setTitle('');
      setDescription('');
    } else {
      setError(data.error || 'Something went wrong.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="border p-2 block mb-2 w-full"
        required
      />
      <textarea
        name="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="border p-2 block mb-2 w-full"
        required
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2">
        Submit
      </button>
      {error && <p className="text-red-600 mt-2">{error}</p>}
      {success && <p className="text-green-600 mt-2">{success}</p>}
    </form>
  );
}
