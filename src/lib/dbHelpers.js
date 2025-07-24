'use server';  // Mark as server-only

import { ref, onValue, query, orderByChild, equalTo, limitToFirst } from 'firebase/database';
import { db } from './firebase';
import { auth } from './firebase';

export async function fetchUserTickets(limit = 20) {
  const user = auth.currentUser;
  if (!user) throw new Error('Unauthorized');

  return new Promise((resolve) => {
    const ticketsRef = query(
      ref(db, 'tickets'),
      orderByChild('loggedByUid'),
      equalTo(user.uid),
      limitToFirst(limit)  // Limit for performance
    );
    onValue(ticketsRef, (snapshot) => {
      const data = snapshot.val() || {};
      resolve(Object.entries(data).map(([id, ticket]) => ({ id, ...ticket })));
    }, { onlyOnce: true });
  });
}

export async function fetchAllTickets(limit = 50) {
  return new Promise((resolve) => {
    const ticketsRef = query(ref(db, 'tickets'), limitToFirst(limit));
    onValue(ticketsRef, (snapshot) => {
      const data = snapshot.val() || {};
      resolve(Object.entries(data).map(([id, ticket]) => ({ id, ...ticket })));
    }, { onlyOnce: true });
  });
}

export async function fetchTicket(id) {
  return new Promise((resolve) => {
    onValue(ref(db, 'tickets/' + id), (snapshot) => {
      resolve(snapshot.val() || {});
    }, { onlyOnce: true });
  });
}

export async function checkIsTechnician() {
  const user = auth.currentUser;
  if (!user) return false;
  return new Promise((resolve) => {
    onValue(ref(db, 'users/' + user.uid), (snapshot) => {
      resolve(snapshot.val()?.isTechnician || false);
    }, { onlyOnce: true });
  });
}

export async function fetchUserRole(uid) {
  return new Promise((resolve) => {
    onValue(ref(db, 'users/' + uid), (snapshot) => {
      resolve(snapshot.val()?.isTechnician ? 'technician' : 'user');
    }, { onlyOnce: true });
  });
}