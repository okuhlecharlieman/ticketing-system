// src/lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, onValue, query, orderByChild, equalTo, limitToFirst, startAt } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);

// Helper to fetch tickets with queries
export function fetchTicketsForUser(uid, isTechnician, filterUser = null, lastTicketKey = null, pageSize = 10) {
  const ticketsRef = ref(database, 'tickets');
  let q;

  if (isTechnician && filterUser) {
    // Technician view: filter by selected user
    q = query(ticketsRef, orderByChild('loggedFor'), equalTo(filterUser), limitToFirst(pageSize));
  } else {
    // User view: tickets logged by or for current user
    q = query(ticketsRef, orderByChild('loggedByUid'), equalTo(uid), limitToFirst(pageSize));
    // Note: You may need a secondary query for 'loggedFor' == uid and merge results
  }

  // For pagination (see Improvement 2)
  if (lastTicketKey) {
    q = query(q, startAt(lastTicketKey));
  }

  return new Promise((resolve, reject) => {
    onValue(q, (snapshot) => {
      const tickets = [];
      snapshot.forEach((child) => {
        tickets.push({ id: child.key, ...child.val() });
      });
      resolve(tickets);
    }, (error) => reject(error));
  });
}

// Other helpers (e.g., auth, users) remain as in your original code
export { auth, database, ref, onValue };
