// netlify/functions/firebase-proxy.js
const admin = require('firebase-admin');

// Initialize Firebase Admin (use env vars from Netlify)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\n/g, '\n'),
    }),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const db = admin.database();
    const snapshot = await db.ref('tickets').once('value');
    return {
      statusCode: 200,
      body: JSON.stringify(snapshot.val()),
    };
  } catch (error) {
    return { statusCode: 500, body: error.message };
  }
};