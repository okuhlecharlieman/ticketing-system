"use client";
import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.push("/");
    });
    return () => unsubscribe();
  }, [router]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/technician");
    } catch (err) {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className={`${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"} min-h-screen transition-colors duration-500`}>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      <div className="flex justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
        <div className={`w-full max-w-lg rounded-3xl shadow-xl p-10 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          <h2 className={`text-3xl font-extrabold mb-8 text-center ${darkMode ? "text-indigo-300" : "text-indigo-600"}`}>
            🔐 Sign In
          </h2>

          <form onSubmit={handleSignIn}>
            <input
              type="email"
              className={`w-full mb-5 px-5 py-3 rounded-2xl border placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-indigo-400 transition
                ${darkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-gray-100 border-gray-300 text-gray-900"}`}
              placeholder="Company Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              className={`w-full mb-6 px-5 py-3 rounded-2xl border placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-indigo-400 transition
                ${darkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-gray-100 border-gray-300 text-gray-900"}`}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-3xl shadow-lg transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              🔓 Sign In
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-gray-500 dark:text-gray-400">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="text-indigo-600 dark:text-indigo-400 underline">
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
