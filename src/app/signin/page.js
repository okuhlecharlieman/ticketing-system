"use client";
import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useRouter } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import Navbar from "../../components/Navbar";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/");
      }
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
    <div className={`${darkMode ? "bg-zinc-900 text-white" : "bg-blue-50 text-gray-900"} min-h-screen transition-colors duration-500`}>
      <Navbar />

      {/* Theme Toggle */}
      <div className="flex justify-end px-6 pt-4">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* Sign In Form */}
      <div className="flex justify-center items-center py-10">
        <form
          onSubmit={handleSignIn}
          className="bg-white dark:bg-zinc-800 p-8 rounded-2xl shadow-lg w-full max-w-md"
        >
          <h2 className="text-2xl font-bold mb-6 text-blue-600 dark:text-blue-300 text-center">
            🔐 Sign In
          </h2>

          <input
            className="w-full mb-3 px-4 py-2 border rounded dark:bg-zinc-700 dark:text-white"
            type="email"
            placeholder="Company Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full mb-3 px-4 py-2 border rounded dark:bg-zinc-700 dark:text-white"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <div className="text-red-500 text-sm mb-3">{error}</div>}

          <button
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            type="submit"
          >
            Sign In
          </button>

          <div className="mt-4 text-sm text-center dark:text-gray-300">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="text-blue-600 underline dark:text-blue-400">
              Sign Up
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
