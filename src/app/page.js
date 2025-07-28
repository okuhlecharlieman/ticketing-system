// src/app/page.js
import { redirect } from 'next/navigation';
import { getAuth } from 'firebase/auth'; // From /lib/firebase.js (server-side import)
import { app as firebaseApp } from '../lib/firebase'; // Use renamed import to avoid conflicts

export const dynamic = 'force-static'; // Static for faster load

export default async function Home() {
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser; // Server-side check (use admin SDK for real server auth)

  if (!user) {
    redirect('/signin');
  }

  // Fetch role from Firebase (server-side)
  const role = await fetchUserRole(user.uid); // Implement in /lib/dbHelpers.js

  if (role === 'technician') {
    redirect('/technician');
  } else {
    redirect('/my-tickets');
  }

  return <div>Loading...</div>; // Fallback (should not reach here)
}

// Helper (add to /lib/dbHelpers.js if not there; no duplicate here)
async function fetchUserRole(uid) {
  // Use Firebase admin SDK for server fetch
  return 'user'; // Placeholder
}
