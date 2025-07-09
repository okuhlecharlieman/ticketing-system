"use client"
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { ref, set } from "firebase/database";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Save name and surname to Realtime Database
      await set(ref(db, "users/" + userCredential.user.uid), {
        name,
        surname,
        email,
      });
      router.push("/technician"); // Redirect after sign up
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSignUp} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-blue-600">Sign Up</h2>
        <input
          className="w-full mb-3 px-3 py-2 border rounded"
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <input
          className="w-full mb-3 px-3 py-2 border rounded"
          type="text"
          placeholder="Surname"
          value={surname}
          onChange={e => setSurname(e.target.value)}
          required
        />
        <input
          className="w-full mb-3 px-3 py-2 border rounded"
          type="email"
          placeholder="Company Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full mb-3 px-3 py-2 border rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <button
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          type="submit"
        >
          Sign Up
        </button>
        <div className="mt-4 text-sm text-center">
          Already have an account? <a href="/signin" className="text-blue-600 underline">Sign In</a>
        </div>
      </form>
    </div>
  );
}