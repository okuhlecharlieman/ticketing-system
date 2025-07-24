'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { ref, set } from 'firebase/database';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isTechnician, setIsTechnician] = useState(false);

  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await set(ref(db, 'users/' + user.uid), { email, isTechnician });
      window.location.href = '/';
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-4">
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="border p-2" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="border p-2" />
      <label>
        <input type="checkbox" checked={isTechnician} onChange={(e) => setIsTechnician(e.target.checked)} /> Technician
      </label>
      <button onClick={handleSignUp} className="bg-green-500 text-white p-2">Sign Up</button>
    </div>
  );
}