"use client"
import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "../lib/firebase";
import { ref, push, onValue } from "firebase/database";

const NEWS_API_KEY = process.env.NEXT_PUBLIC_GNEWS_API_KEY;

export default function Home() {
  const [tickets, setTickets] = useState([]);
  const [newTicket, setNewTicket] = useState("");
  const [news, setNews] = useState([]);

  // Fetch tickets from Firebase
  useEffect(() => {
    const ticketsRef = ref(db, "tickets");
    onValue(
      ticketsRef,
      (snapshot) => {
        const data = snapshot.val() || {};
        setTickets(Object.entries(data));
      },
      (error) => {
        console.error("Error fetching tickets:", error);
      }
    );
  }, []);

  // Fetch news from GNews API
  useEffect(() => {
    fetch(`https://gnews.io/api/v4/top-headlines?lang=en&token=${NEWS_API_KEY}`)
      .then((res) => res.json())
      .then((data) => setNews(data.articles || []))
      .catch((err) => console.error("Error fetching news:", err));
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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      {/* App Title and Welcome */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-blue-700 mb-2">Welcome to the Ticketing System</h1>
        <p className="text-gray-600">Log issues, view news, and manage tickets with ease.</p>
      </header>

      {/* Navigation */}
      <nav className="mb-8 flex gap-4">
        <Link href="/log-ticket" className="text-blue-600 underline hover:text-blue-800">
          Log a Ticket
        </Link>
        <Link href="/technician" className="text-blue-600 underline hover:text-blue-800">
          Technician Dashboard
        </Link>
        <Link href="/signin" className="text-green-600 underline hover:text-green-800">
          Sign In
        </Link>
        <Link href="/signup" className="text-purple-600 underline hover:text-purple-800">
          Sign Up
        </Link>
      </nav>

      {/* News Section */}
      <div className="w-full max-w-2xl mb-8">
        <h2 className="text-xl font-bold mb-4 text-blue-600">Latest News</h2>
        <div className="grid gap-4">
          {news.length === 0 && <p className="text-gray-500">Loading news...</p>}
          {news.map((article, idx) => (
            <a
              key={idx}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white rounded shadow p-4 hover:bg-blue-50 transition"
            >
              <div className="font-semibold">{article.title}</div>
              <div className="text-sm text-gray-600">{article.source?.name}</div>
              <div className="text-xs text-gray-500">{article.publishedAt?.slice(0, 10)}</div>
            </a>
          ))}
        </div>
      </div>

     
    </div>
  );
}