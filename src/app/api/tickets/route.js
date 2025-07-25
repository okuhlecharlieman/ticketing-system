import { NextResponse } from 'next/server';
import { ref, push } from 'firebase/database';
import { db, auth } from '@/lib/firebase';

export async function POST(req) {
  try {
    const { title, description } = await req.json();

    const user = auth.currentUser;
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ticketData = {
      title,
      description,
      loggedByUid: user.uid,
      status: 'open',
      createdAt: Date.now(),
    };

    await push(ref(db, 'tickets'), ticketData);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
