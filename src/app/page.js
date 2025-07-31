"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db, auth } from "../lib/firebase";
import { ref, push, onValue, get } from "firebase/database";
import { Moon, Sun } from "lucide-react";
import Image from "next/image";

const logoUrl = "https://www.heartfm.co.za/content/uploads/2017/12/logo-dark.png";
const NEWS_API_KEY = process.env.NEXT_PUBLIC_GNEWS_API_KEY;

export default function Home() {
  const [tickets, setTickets] = useState([]);
  const [newTicket, setNewTicket] = useState("");
  const [news, setNews] = useState([]);
  const [user, setUser] = useState(null);
  const [isTechnician, setIsTechnician] = useState(false);
  const [darkMode, setDarkMode] = useState(() =>
    typeof window !== "undefined" &&
    window.document.documentElement.classList.contains("dark")
  );

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

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const addTicket = async () => {
    if (!newTicket.trim()) return;
    try {
      await push(ref(db, "tickets"), {
        text: newTicket.trim(),
        created: Date.now(),
      });
      setNewTicket("");
    } catch (error) {
      console.error("Error adding ticket:", error);
    }
  };

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"} min-h-screen font-sans transition-colors duration-300`}>
      {/* Header */}
      <header className="sticky top-0 z-50 flex justify-between items-center px-4 md:px-8 py-4 shadow bg-red-500 dark:bg-red-800">
        <div className="flex items-center space-x-3">
          <Image 
            src={logoUrl}
            alt="Heart FM Logo"
            width={500}
            height={300}
            priority={true}
            className="h-8 sm:h-10 w-auto"
          />
          <span className="text-xl sm:text-2xl font-bold text-white">Tickitie</span>
        </div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-white dark:bg-gray-700 text-red-600 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          <span className="hidden sm:inline">{darkMode ? "Light" : "Dark"} Mode</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="px-4 py-10 sm:px-6 md:px-12 max-w-6xl mx-auto space-y-12">
        {/* Welcome Section */}
        <section className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Hey there 👋</h1>
          <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base max-w-2xl mx-auto">
            Log issues, check the latest news, and stay updated — all in one place.
          </p>
        </section>

        {/* Auth Navigation */}
        <section className="flex flex-wrap gap-4 justify-center">
          {!user ? (
            <>
              <Link href="/signin" className="px-5 py-2 rounded-full bg-green-500 text-white hover:bg-green-600 font-semibold transition">
                Sign In
              </Link>
              <Link href="/signup" className="px-5 py-2 rounded-full bg-purple-500 text-white hover:bg-purple-600 font-semibold transition">
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link href="/log-ticket" className="px-5 py-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 font-semibold transition">
                Log Ticket
              </Link>
              {isTechnician && (
                <Link href="/technician" className="px-5 py-2 rounded-full bg-indigo-500 text-white hover:bg-indigo-600 font-semibold transition">
                  Technician Dashboard
                </Link>
              )}
            </>
          )}
        </section>

        {/* News Feed */}
        <section className="w-full max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-red-600 dark:text-red-400 text-center sm:text-left">
            📰 What’s Happening?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.length === 0 && (
              <p className="col-span-full text-center text-gray-500 dark:text-gray-400">Loading news...</p>
            )}
            {news.map((article, idx) => (
              <a
                key={idx}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl shadow-md bg-white hover:bg-red-50 dark:bg-gray-800 dark:hover:bg-gray-700 transition"
              >
                <h3 className="font-semibold text-lg text-red-700 dark:text-red-300 truncate">
                  {article.title}
                </h3>
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
