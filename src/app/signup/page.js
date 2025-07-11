"use client";
import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { ref, set } from "firebase/database";
import { useRouter } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import Navbar from "../../components/Navbar";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [error, setError] = useState("");
  const [isTechnician, setIsTechnician] = useState("no");
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.push("/");
    });
    return () => unsubscribe();
  }, [router]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await set(ref(db, "users/" + userCredential.user.uid), {
        name,
        surname,
        email,
        isTechnician: isTechnician === "yes",
      });
      router.push("/technician");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={`${darkMode ? "bg-zinc-900 text-white" : "bg-blue-50 text-gray-900"} min-h-screen transition-colors duration-500`}>
      <div className="flex justify-between items-center px-6 py-4 shadow-md sticky top-0 bg-opacity-90 backdrop-blur-md z-10">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-300">🎫 Tickitie</h1>
        <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition">
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <main className="flex flex-col items-center justify-center px-4 py-12">
        <form onSubmit={handleSignUp} className="bg-white dark:bg-zinc-800 shadow-md rounded-xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-blue-600 dark:text-blue-300">Create an Account</h2>

          <input
            className="w-full mb-4 px-4 py-2 rounded-lg border dark:border-zinc-600 bg-white dark:bg-zinc-900 dark:text-white"
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="w-full mb-4 px-4 py-2 rounded-lg border dark:border-zinc-600 bg-white dark:bg-zinc-900 dark:text-white"
            type="text"
            placeholder="Surname"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            required
          />
          <input
            className="w-full mb-4 px-4 py-2 rounded-lg border dark:border-zinc-600 bg-white dark:bg-zinc-900 dark:text-white"
            type="email"
            placeholder="Company Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full mb-4 px-4 py-2 rounded-lg border dark:border-zinc-600 bg-white dark:bg-zinc-900 dark:text-white"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <select
            className="w-full mb-4 px-4 py-2 rounded-lg border dark:border-zinc-600 bg-white dark:bg-zinc-900 dark:text-white"
            value={isTechnician}
            onChange={(e) => setIsTechnician(e.target.value)}
            required
          >
            <option value="no">Are you a technician?</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>

          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

          <button
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            type="submit"
          >
            Sign Up
          </button>

          <p className="mt-4 text-sm text-center text-gray-700 dark:text-gray-300">
            Already have an account?{" "}
            <a href="/signin" className="text-blue-600 underline dark:text-blue-400">
              Sign In
            </a>
          </p>
        </form>
      </main>
    </div>
  );
}
