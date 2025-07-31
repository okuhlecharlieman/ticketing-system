'use client';
import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const AuthForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const auth = getAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin();
    } catch (err) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const { getDatabase, ref, set } = await import('firebase/database');
        await set(ref(getDatabase(), 'users/' + cred.user.uid), { email, role: 'user' });
        setMessage('Registered and logged in as User.');
        onLogin();
      } catch (regErr) {
        setMessage(regErr.message);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
      <div className={message.includes('Registered') ? 'message success' : 'message'}>{message}</div>
      <button type="submit">Log In / Register</button>
    </form>
  );
};

export default AuthForm;