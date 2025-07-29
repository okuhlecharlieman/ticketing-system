"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { ref, get } from "firebase/database";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import { useDarkMode } from "../../context/DarkModeContext";
import { db } from "../../lib/firebase";
import Link from "next/link";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const { darkMode, setDarkMode } = useDarkMode();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCheckingAuth(false);
        return;
      }
      try {
        const snap = await get(ref(db, `users/${user.uid}`));
        const isTech = snap.val()?.isTechnician;
        router.replace(isTech ? "/technician" : "/log-ticket");
      } catch {
        router.replace("/"); // fallback
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const snap = await get(ref(db, `users/${cred.user.uid}`));
      const isTech = snap.val()?.isTechnician;
      router.replace(isTech ? "/technician" : "/log-ticket");
    } catch {
      setError("Invalid email or password.");
    }
    setLoading(false);
  };

  if (checkingAuth) {
    return (
      <div
        className={`${
          darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
        } min-h-screen flex justify-center items-center transition-colors duration-500`}
      >
        <p>Checking user status...</p>
      </div>
    );
  }

  return (
    <div
      className={`${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      } min-h-screen transition-colors duration-500`}
    >
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      <div className="flex justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
        <div
          className={`w-full max-w-lg rounded-3xl shadow-xl p-10 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h2
            className={`text-3xl font-extrabold mb-8 text-center ${
              darkMode ? "text-indigo-300" : "text-indigo-600"
            }`}
          >
            🔐 Sign In
          </h2>

          <form onSubmit={handleSignIn}>
            <input
              autoFocus
              type="email"
              placeholder="Company Email"
              value={email}
              aria-label="Company Email"
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`w-full mb-5 px-5 py-3 rounded-2xl border placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-gray-200"
                  : "bg-gray-100 border-gray-300 text-gray-900"
              }`}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              aria-label="Password"
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`w-full mb-6 px-5 py-3 rounded-2xl border placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-gray-200"
                  : "bg-gray-100 border-gray-300 text-gray-900"
              }`}
            />

            {error && (
              <div role="alert" className="text-red-500 text-sm mb-4">
                {error}
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-3xl shadow-lg transition transform hover:-translate-y-0.5 active:translate-y-0 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Signing In..." : "🔓 Sign In"}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-gray-500 dark:text-gray-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-indigo-600 dark:text-indigo-400 underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
