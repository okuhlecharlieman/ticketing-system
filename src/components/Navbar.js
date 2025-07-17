"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { ref, get } from "firebase/database";
import { signOut } from "firebase/auth";
import { Moon, Sun } from "lucide-react";
import { useDarkMode } from "../context/DarkModeContext";

export default function Navbar() {
  const { darkMode, setDarkMode } = useDarkMode();
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
    <nav
      className={`w-full px-4 py-4 sticky top-0 z-50 shadow-lg flex justify-between items-center transition-colors duration-300 ${
        darkMode ? "bg-red-800 text-white" : "bg-red-500 text-white"
      }`}
    >
      <Link
        href="/"
        className="text-lg font-extrabold tracking-tight hover:scale-105 transition-transform duration-200"
      >
        🎫 Tickitie
      </Link>

      <div className="flex items-center gap-4 text-sm">
        {user && (
          <>
            <Link
              href="/log-ticket"
              className="hover:underline hover:text-gray-200 font-medium"
            >
              Log Ticket
            </Link>

            <Link
              href="/my-tickets"
              className="hover:underline hover:text-gray-200 font-medium"
            >
              My Tickets
            </Link>
          </>
        )}

        {isTechnician && (
          <Link
            href="/technician"
            className="hover:underline hover:text-yellow-200 font-medium"
          >
            Dashboard
          </Link>
        )}

        {!user ? (
          <>
            <Link
              href="/signin"
              className="text-white hover:underline hover:text-gray-200 font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-white hover:underline hover:text-gray-200 font-medium"
            >
              Sign Up
            </Link>
          </>
        ) : (
          <>
            <span className="text-xs text-white opacity-75">
              {user.email} ({isTechnician ? "Technician" : "User"})
            </span>
            <button
              onClick={handleLogout}
              className="text-xs bg-white text-red-600 px-3 py-1 rounded hover:bg-gray-100 transition-all"
            >
              Logout
            </button>
          </>
        )}

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full hover:bg-red-700 dark:hover:bg-red-900 transition"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </nav>
  );
}
