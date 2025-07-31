'use client';
import { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, set, remove, update } from 'firebase/database';

const UserManagement = ({ users }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');

  const handleAddUser = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const db = getDatabase();
      await set(ref(db, 'users/' + cred.user.uid), { email, role });
      setEmail(''); setPassword(''); setRole('user');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemove = async (uid) => {
    if (confirm('Remove?')) {
      const db = getDatabase();
      await remove(ref(db, 'users/' + uid));
    }
  };

  const handleUpdateRole = async (uid, newRole) => {
    const db = getDatabase();
    await update(ref(db, 'users/' + uid), { role: newRole });
  };

  return (
    <div id="userManagement">
      <h2>User Management</h2>
      <form onSubmit={handleAddUser}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="New User Email" required />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option>user</option><option>technician</option><option>admin</option>
        </select>
        <button type="submit">Add User</button>
      </form>
      <ul>
        {users.map(user => (
          <li key={user.uid}>
            {user.email} ({user.role}) 
            <button onClick={() => handleRemove(user.uid)} style={{ background: '#dc3545' }}>Remove</button>
            <select defaultValue={user.role} onChange={(e) => handleUpdateRole(user.uid, e.target.value)}>
              <option>user</option><option>technician</option><option>admin</option>
            </select>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserManagement;