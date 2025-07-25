'use client';

import { useContext } from 'react';
import Link from 'next/link';
import { AuthContext } from '../context/AuthContext';
import DarkModeToggle from './DarkModeToggle';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="bg-primary text-white p-4 flex justify-between items-center">
      <Link href="/" className="text-lg font-bold">Ticketing System</Link>
      <div className="flex space-x-4 items-center">
        {user ? (
          <>
            <Link href="/my-tickets">My Tickets</Link>
            {user.isTechnician && <Link href="/technician">Dashboard</Link>}
            <Link href="/log-ticket">Log Ticket</Link>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link href="/signin">Sign In</Link>
            <Link href="/signup">Sign Up</Link>
          </>
        )}
        <DarkModeToggle />
      </div>
    </nav>
  );
}