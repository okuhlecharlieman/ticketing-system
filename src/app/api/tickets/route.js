'use server';

import { ref, push } from 'firebase/database';
import { db } from '../../../lib/firebase';
import { auth } from '../../../lib/firebase';

export async function createTicket(prevState, formData) {
  const user = auth.currentUser;
  if (!user) return { error: 'Unauthorized' };

  const ticketData = {
    title: formData.get('title'),
    description: formData.get('description'),
    loggedByUid: user.uid,
    status: 'open',
    createdAt: Date.now(),
  };

  try {
    await push(ref(db, 'tickets'), ticketData);
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}