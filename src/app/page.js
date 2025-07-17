"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db, auth } from "../lib/firebase";
import { ref, push, onValue, get } from "firebase/database";
import { Moon, Sun } from "lucide-react";

const logoUrl = "https://www.heartfm.co.za/content/uploads/2017/12/logo-dark.png";
const NEWS_API_KEY = process.env.NEXT_PUBLIC_GNEWS_API_KEY;

export default function Home() {
  const [tickets, setTickets] = useState([]);
  const [newTicket, setNewTicket] = useState("");
  const [news, setNews] = useState([]);
  const [user, setUser] = useState(null);
  const [isTechnician, setIsTechnician] = useState(false);
  const [darkMode, setDarkMode] = useState(() =>
    typeof window !== "undefined" && window.document.documentElement.classList.contains("dark")
  );

  // Fetch tickets from Firebase Realtime Database
  useEffect(() => {
    const ticketsRef = ref(db, "tickets");
    onValue(ticketsRef, (snapshot) => {
      const data = snapshot.val() || {};
      setTickets(Object.entries(data));
    });
  }, []);

  // Fetch news articles using GNews API
  useEffect(() => {
    fetch(`https://gnews.io/api/v4/top-headlines?lang=en&token=${NEWS_API_KEY}`)
      .then((res) => res.json())
      .then((data) => setNews(data.articles || []))
      .catch((err) => console.error("Error fetching news:", err));
  }, []);

  // Firebase auth listener to detect user & role
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

  // Sync dark mode with <html> class for consistent styling
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Add new ticket to Firebase DB
  const addTicket = async () => {
    if (!newTicket.trim()) return;
    try {
      await push(ref(db, "tickets"), { text: newTicket.trim(), created: Date.now() });
      setNewTicket("");
    } catch (error) {
      console.error("Error adding ticket:", error);
    }
  };

  return (
    <div className={`${darkMode ? "bg-gray-900 text-gray-200" : "bg-gray-100 text-gray-800"} min-h-screen transition-colors duration-500 font-sans`}>
      {/* Header/Navbar */}
      <header className="flex justify-between items-center px-6 py-4 shadow-md sticky top-0 bg-red-600 dark:bg-red-800 z-50">
        <div className="flex items-center space-x-4">
          <img src={logoUrl} alt="Heart FM Logo" className="h-10" />
          <h1 className="text-2xl font-extrabold text-white select-none">Tickitie</h1>
        </div>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="bg-white text-red-600 dark:bg-gray-700 dark:text-gray-300 px-4 py-2 rounded-md shadow transition-all flex items-center gap-2"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
        </button>
      </header>

      <main className="flex flex-col items-center py-10 px-4 max-w-5xl mx-auto space-y-12 w-full">
        {/* Welcome Section */}
        <section className="text-center max-w-xl">
          <h2 className="text-3xl font-extrabold mb-2">Hey there 👋</h2>
          <p className="text-md text-gray-700 dark:text-gray-300">
            Log issues, check latest news, and stay updated — all in one place.
          </p>
        </section>

        {/* Navigation Buttons */}
        <nav className="flex gap-6 flex-wrap justify-center text-sm">
          {!user ? (
            <>
              <Link
                href="/signin"
                className="px-4 py-2 rounded-full bg-green-500 text-white hover:bg-green-600 shadow transition"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-full bg-purple-500 text-white hover:bg-purple-600 shadow transition"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/log-ticket"
                className="px-4 py-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 shadow transition"
              >
                Log Ticket
              </Link>
              {isTechnician && (
                <Link
                  href="/technician"
                  className="px-4 py-2 rounded-full bg-indigo-500 text-white hover:bg-indigo-600 shadow transition"
                >
                  Technician Dashboard
                </Link>
              )}
            </>
          )}
        </nav>


        {/* News Section */}
        <section className="w-full max-w-3xl">
          <h2 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">📰 What&apos;s Happening?</h2>
          <div className="grid gap-4">
            {news.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400">Loading news...</p>
            )}
            {news.map((article, idx) => (
              <a
                key={idx}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 rounded-xl shadow-md bg-white hover:bg-red-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition"
              >
                <h3 className="font-semibold text-lg text-red-700 dark:text-red-300 truncate">{article.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{article.source?.name}</p>
                <p className="text-xs text-gray-500">{article.publishedAt?.slice(0, 10)}</p>
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
