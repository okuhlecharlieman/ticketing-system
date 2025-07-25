'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = '/';
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-4">
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="border p-2" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="border p-2" />
      <button onClick={handleSignIn} className="bg-blue-500 text-white p-2">Sign In</button>
    </div>
  );
}