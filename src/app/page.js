import { redirect } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { app as firebaseApp } from '../lib/firebase'; // Fixed import (app, not firebaseApp)

export const dynamic = 'force-static';

export default async function Home() {
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;

  if (!user) {
    redirect('/signin');
  }

  const role = await fetchUserRole(user.uid);

  if (role === 'technician') {
    redirect('/technician');
  } else {
    redirect('/my-tickets');
  }

  return <div>Loading...</div>;
}

async function fetchUserRole(uid) {
  return 'user'; // Placeholder
}