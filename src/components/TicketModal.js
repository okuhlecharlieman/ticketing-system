'use client';
import { useState } from 'react';
import { getDatabase, ref, update, push, remove } from 'firebase/database';

const TicketModal = ({ ticket, role, technicians, users, onClose, currentUser }) => {
  const [newCommentText, setNewCommentText] = useState('');
  const [assignee, setAssignee] = useState(ticket.assignee || '');
  const [status, setStatus] = useState(ticket.status);

  const handleSave = async () => {
    const db = getDatabase();
    await update(ref(db, 'tickets/' + ticket.id), { assignee, status });
    if (assignee && assignee !== currentUser.uid) {
      await push(ref(db, 'notifications/' + assignee), { message: `Ticket "${ticket.title}" assigned to you.`, timestamp: Date.now() });
    }
    onClose();
  };

  const handleAddComment = async () => {
    if (!newCommentText.trim()) return;
    const db = getDatabase();
    const comment = { text: newCommentText, author: currentUser.email, timestamp: Date.now() };
    await push(ref(db, 'tickets/' + ticket.id + '/comments'), comment);
    if (ticket.creator !== currentUser.uid) await push(ref(db, 'notifications/' + ticket.creator), { message: `New comment on your ticket "${ticket.title}".`, timestamp: Date.now() });
    if (ticket.assignee && ticket.assignee !== currentUser.uid) await push(ref(db, 'notifications/' + ticket.assignee), { message: `New comment on assigned ticket "${ticket.title}".`, timestamp: Date.now() });
    setNewCommentText('');
  };

  const handleDelete = async () => {
    if (confirm('Delete?')) {
      const db = getDatabase();
      await remove(ref(db, 'tickets/' + ticket.id));
      onClose();
    }
  };

  const canEdit = role === 'technician' || role === 'admin';
  const canDelete = role === 'admin';
  const canComment = role !== 'user' || ticket.creator === currentUser.uid;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{ticket.title}</h2>
        <p>Description: {ticket.description}</p>
        <p>Priority: {ticket.priority}</p>
        <p>Category: {ticket.category}</p>
        <p>Status: {ticket.status}</p>
        <p>Assignee: {ticket.assignee ? users.find(u => u.uid === ticket.assignee)?.email : 'Unassigned'}</p>
        {canEdit && (
          <>
            <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
              <option value="">Unassigned</option>
              {technicians.map(t => <option key={t.uid} value={t.uid}>{t.email}</option>)}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>Open</option><option>In Progress</option><option>Resolved</option><option>Closed</option>
            </select>
            <button onClick={handleSave}>Save Changes</button>
          </>
        )}
        <h3>Comments</h3>
        <ul>
          {(ticket.comments || []).map((c, i) => <li key={i}>{c.author} ({new Date(c.timestamp).toLocaleString()}): {c.text}</li>)}
        </ul>
        {canComment && (
          <>
            <textarea value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)} placeholder="Add comment..." />
            <button onClick={handleAddComment}>Add Comment</button>
          </>
        )}
        <button onClick={onClose}>Close</button>
        {canDelete && <button onClick={handleDelete} style={{ background: '#dc3545' }}>Delete</button>}
      </div>
    </div>
  );
};

export default TicketModal;