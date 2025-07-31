'use client';
import { useState } from 'react';
import { getDatabase, ref, push } from 'firebase/database';

const TicketForm = ({ userId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Low');
  const [category, setCategory] = useState('Hardware');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Title and description required.');
      return;
    }
    const db = getDatabase();
    await push(ref(db, 'tickets'), {
      title, description, priority, category, status: 'Open', creator: userId, createdAt: Date.now(), comments: []
    });
    setTitle(''); setDescription(''); setPriority('Low'); setCategory('Hardware'); setError('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ticket Title" required />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" required />
      <select value={priority} onChange={(e) => setPriority(e.target.value)}>
        <option>Low</option><option>Medium</option><option>High</option>
      </select>
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option>Hardware</option><option>Software</option><option>Billing</option><option>Other</option>
      </select>
      <div className="error">{error}</div>
      <button type="submit">Create Ticket</button>
      <button type="button" onClick={() => { setTitle(''); setDescription(''); setError(''); }} style={{ background: '#6c757d', marginLeft: '10px' }}>Clear</button>
    </form>
  );
};

export default TicketForm;