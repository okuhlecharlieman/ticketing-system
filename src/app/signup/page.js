"use client";
import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { ref, set } from "firebase/database";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [isTechnician, setIsTechnician] = useState("no");
  const [error, setError] = useState("");
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
    <div className={`${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"} min-h-screen transition-colors duration-500`}>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="flex justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
        <div className={`w-full max-w-lg rounded-3xl shadow-xl p-10 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          <h2 className={`text-3xl font-extrabold mb-8 ${darkMode ? "text-indigo-300" : "text-indigo-600"}`}>
            🧾 Create an Account
          </h2>

          <form onSubmit={handleSignUp}>
            <input
              type="text"
              className={`w-full mb-5 px-5 py-3 rounded-2xl border placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-indigo-400 transition
                ${darkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-gray-100 border-gray-300 text-gray-900"}`}
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="text"
              className={`w-full mb-5 px-5 py-3 rounded-2xl border placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-indigo-400 transition
                ${darkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-gray-100 border-gray-300 text-gray-900"}`}
              placeholder="Surname"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              required
            />
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
              className={`w-full mb-5 px-5 py-3 rounded-2xl border placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-indigo-400 transition
                ${darkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-gray-100 border-gray-300 text-gray-900"}`}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <select
              className={`w-full mb-6 px-5 py-3 rounded-2xl border focus:outline-none focus:ring-2
                focus:ring-indigo-400 transition
                ${darkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-gray-100 border-gray-300 text-gray-900"}`}
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
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-3xl shadow-lg transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              ✅ Sign Up
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <a href="/signin" className="text-indigo-600 dark:text-indigo-400 underline">
              Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
