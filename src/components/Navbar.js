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
      className={`w-full px-4 py-3 shadow-md flex justify-between items-center ${
        darkMode ? "bg-zinc-800 text-white" : "bg-white text-gray-900"
      } transition-colors duration-300`}
    >
      <Link
        href="/"
        className="text-lg font-extrabold text-blue-600 dark:text-blue-300"
      >
        🎫 Tickitie
      </Link>

      <div className="flex items-center gap-4 text-sm">
        {user && (
          <>
            <Link
              href="/log-ticket"
              className="hover:underline hover:text-blue-500"
            >
              Log Ticket
            </Link>

            {!isTechnician && (
              <Link
                href="/my-tickets"
                className="hover:underline hover:text-blue-500"
              >
                My Tickets
              </Link>
            )}
          </>
        )}

        {isTechnician && (
          <Link
            href="/technician"
            className="hover:underline hover:text-indigo-500"
          >
            Dashboard
          </Link>
        )}

        {!user ? (
          <>
            <Link
              href="/signin"
              className="text-green-600 hover:underline"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-purple-600 hover:underline"
            >
              Sign Up
            </Link>
          </>
        ) : (
          <>
            <span className="text-xs text-gray-500 dark:text-gray-300">
              {user.email} ({isTechnician ? "Technician" : "User"})
            </span>
            <button
              onClick={handleLogout}
              className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </>
        )}

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </nav>
  );
}