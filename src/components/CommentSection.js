'use client';

import { useState, useEffect } from 'react';
import { ref, onValue, push } from 'firebase/database';
import { db } from '../lib/firebase';
import { auth } from '../lib/firebase';

export default function CommentSection({ ticketId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    onValue(ref(db, `tickets/${ticketId}/comments`), (snapshot) => {
      setComments(Object.values(snapshot.val() || {}));
    });
  }, [ticketId]);

  const addComment = async () => {
    const user = auth.currentUser;
    if (!user) return;
    await push(ref(db, `tickets/${ticketId}/comments`), {
      author: user.email,
      text,
      timestamp: Date.now(),
    });
    setText('');
  };

  return (
    <div>
      {comments.map((c, i) => <p key={i}>{c.author}: {c.text}</p>)}
      <textarea value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={addComment}>Add Comment</button>
    </div>
  );
}