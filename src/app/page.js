"use client"
import { useEffect, useState } from "react";
import Link from "next/link";
import { db, auth } from "../lib/firebase";
import { ref, push, onValue, get } from "firebase/database";
import { Moon, Sun } from "lucide-react"; // Optional: install lucide-react

const NEWS_API_KEY = process.env.NEXT_PUBLIC_GNEWS_API_KEY;

export default function Home() {
  const [tickets, setTickets] = useState([]);
  const [newTicket, setNewTicket] = useState("");
  const [news, setNews] = useState([]);
  const [user, setUser] = useState(null);
  const [isTechnician, setIsTechnician] = useState(false);
  const [darkMode, setDarkMode] = useState(false); // 🔥 Theme toggle

  useEffect(() => {
    const ticketsRef = ref(db, "tickets");
    onValue(ticketsRef, (snapshot) => {
      const data = snapshot.val() || {};
      setTickets(Object.entries(data));
    });
  }, []);

  useEffect(() => {
    fetch(`https://gnews.io/api/v4/top-headlines?lang=en&token=${NEWS_API_KEY}`)
      .then((res) => res.json())
      .then((data) => setNews(data.articles || []))
      .catch((err) => console.error("Error fetching news:", err));
  }, []);

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

  const addTicket = async () => {
    if (!newTicket) return;
    try {
      await push(ref(db, "tickets"), { text: newTicket, created: Date.now() });
      setNewTicket("");
    } catch (error) {
      console.error("Error adding ticket:", error);
    }
  };

  return (
    <div className={`${darkMode ? "bg-zinc-900 text-white" : "bg-blue-50 text-gray-900"} min-h-screen transition-colors duration-500`}>
      <div className="flex justify-between items-center px-6 py-4 shadow-md sticky top-0 bg-opacity-90 backdrop-blur-md z-10">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-300">🎫 Ticketing Hub</h1>
        <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition">
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <main className="flex flex-col items-center py-10 px-4">
        {/* Welcome Text */}
        <header className="mb-8 text-center max-w-xl">
          <h2 className="text-3xl font-extrabold mb-2">Hey there 👋</h2>
          <p className="text-md text-gray-700 dark:text-gray-300">
            Log issues, check latest news, and stay updated — all in one place.
          </p>
        </header>

        {/* Nav Buttons */}
        <nav className="mb-10 flex gap-6 flex-wrap justify-center text-sm">
          {!user ? (
            <>
              <Link href="/signin" className="px-4 py-2 rounded-full bg-green-500 text-white hover:bg-green-600 shadow">
                Sign In
              </Link>
              <Link href="/signup" className="px-4 py-2 rounded-full bg-purple-500 text-white hover:bg-purple-600 shadow">
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link href="/log-ticket" className="px-4 py-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 shadow">
                Log Ticket
              </Link>
              {isTechnician && (
                <Link href="/technician" className="px-4 py-2 rounded-full bg-indigo-500 text-white hover:bg-indigo-600 shadow">
                  Technician Dashboard
                </Link>
              )}
            </>
          )}
        </nav>

        {/* News Section */}
        <div className="w-full max-w-3xl">
          <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-300">📰 What's Happening?</h2>
          <div className="grid gap-4">
            {news.length === 0 && <p className="text-gray-500">Loading news...</p>}
            {news.map((article, idx) => (
              <a
                key={idx}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 rounded-xl shadow-md bg-white hover:bg-blue-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition"
              >
                <h3 className="font-semibold text-lg">{article.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{article.source?.name}</p>
                <p className="text-xs text-gray-500">{article.publishedAt?.slice(0, 10)}</p>
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
