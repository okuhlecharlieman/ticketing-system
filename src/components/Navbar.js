"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { ref, get } from "firebase/database";
import { signOut } from "firebase/auth";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useDarkMode } from "../context/DarkModeContext";

export default function Navbar() {
  const { darkMode, setDarkMode } = useDarkMode();
  const [user, setUser] = useState(null);
  const [isTechnician, setIsTechnician] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
    setMenuOpen(false);
  };

  return (
    <nav
      className={`w-full px-4 py-4 sticky top-0 z-50 shadow-lg transition-colors duration-300 ${
        darkMode ? "bg-red-800 text-white" : "bg-red-500 text-white"
      }`}
    >
      <div className="flex justify-between items-center">
        {/* Logo */}
        <Link
          href="/"
          className="text-lg font-extrabold tracking-tight hover:scale-105 transition-transform duration-200"
        >
          🎫 Tickitie
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-4 text-sm">
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
                className="hover:underline hover:text-gray-200 font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="hover:underline hover:text-gray-200 font-medium"
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

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-3 text-sm">
          {user && (
            <>
              <Link href="/log-ticket" onClick={() => setMenuOpen(false)}>
                Log Ticket
              </Link>
              <Link href="/my-tickets" onClick={() => setMenuOpen(false)}>
                My Tickets
              </Link>
            </>
          )}

          {isTechnician && (
            <Link href="/technician" onClick={() => setMenuOpen(false)}>
              Dashboard
            </Link>
          )}

          {!user ? (
            <>
              <Link href="/signin" onClick={() => setMenuOpen(false)}>
                Sign In
              </Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)}>
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <span className="text-xs opacity-75">
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
            onClick={() => {
              setDarkMode(!darkMode);
              setMenuOpen(false);
            }}
            className="p-2 rounded-full hover:bg-red-700 dark:hover:bg-red-900 transition self-start"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      )}
    </nav>
  );
}
