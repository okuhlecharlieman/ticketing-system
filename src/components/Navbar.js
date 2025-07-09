"use client"
import Link from "next/link";
import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { ref, get } from "firebase/database";
import { signOut } from "firebase/auth";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [isTechnician, setIsTechnician] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = ref(db, "users/" + currentUser.uid);
        const snapshot = await get(userRef);
        setIsTechnician(snapshot.val()?.isTechnician || false);
      } else {
        setIsTechnician(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setIsTechnician(false);
  };

  return (
    <nav className="mb-8 flex gap-4 bg-white shadow px-6 py-3 rounded w-full max-w-2xl mx-auto items-center">
      <Link href="/" className="font-bold text-blue-700 hover:underline">
        Home
      </Link>
      <Link href="/log-ticket" className="text-blue-600 hover:underline">
        Log a Ticket
      </Link>
      {isTechnician && (
        <Link href="/technician" className="text-blue-600 hover:underline">
          Technician Dashboard
        </Link>
      )}
      {!user && (
        <>
          <Link href="/signin" className="text-green-600 hover:underline">
            Sign In
          </Link>
          <Link href="/signup" className="text-purple-600 hover:underline">
            Sign Up
          </Link>
        </>
      )}
      {user && (
        <>
          <span className="ml-auto text-gray-500 text-sm">
            {user.email} ({isTechnician ? "Technician" : "User"})
          </span>
          <button
            onClick={handleLogout}
            className="ml-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700 text-xs"
          >
            Logout
          </button>
        </>
      )}
    </nav>
  );
}