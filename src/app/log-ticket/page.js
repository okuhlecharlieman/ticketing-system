"use client";
import React, { useState, useEffect } from "react";
import { db, auth } from "../../lib/firebase";
import { ref, push, get } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import { useDarkMode } from "../../context/DarkModeContext";
import { Ticket, Send, Users, AlertCircle, CheckCircle } from "lucide-react";

export default function LogTicket() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [user, setUser] = useState(null);
  const [isTech, setIsTech] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success"); // success, error, warning
  const { darkMode, setDarkMode } = useDarkMode();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        router.push("/signin");
        return;
      }

      try {
        const userRef = ref(db, "users/" + currentUser.uid);
        const snapshot = await get(userRef);
        const userData = snapshot.val();

        if (userData?.isTechnician) {
          setIsTech(true);
          const allUsersRef = ref(db, "users");
          const allUsersSnapshot = await get(allUsersRef);
          const users = [];

          allUsersSnapshot.forEach((child) => {
            const val = child.val();
            users.push({
              id: child.key,
              name: val.name,
              surname: val.surname,
              email: val.email,
            });
          });

          setAllUsers(users);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const submitTicket = async () => {
    if (isSubmitting) return;

    if (!title || !description) {
      setMessage("Please fill in all required fields.");
      setMessageType("error");
      return;
    }
    if (!user) {
      setMessage("You must be logged in to submit a ticket.");
      setMessageType("error");
      return;
    }

    setIsSubmitting(true);

    try {
      const ticketData = {
        title,
        description,
        status: "open",
        created: Date.now(),
        createdAt: new Date().toLocaleString(),
        loggedBy: user.email,
        loggedByUid: user.uid,
      };

      if (isTech && selectedUser) {
        ticketData.loggedFor = selectedUser;
        ticketData.isLoggedByTech = true;
      }

      await push(ref(db, "tickets"), ticketData);

      // Trigger email function
      const response = await fetch("/.netlify/functions/sendTicketEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          email: user.email,
        }),
      });

      if (!response.ok) {
        setMessage("Ticket submitted successfully! Email notification may have failed.");
        setMessageType("warning");
      } else {
        setMessage("Ticket submitted successfully! You'll receive a confirmation email shortly.");
        setMessageType("success");
      }

      setTitle("");
      setDescription("");
      setSelectedUser("");
    } catch (err) {
      setMessage("Error submitting ticket: " + err.message);
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closePopup = () => {
    setMessage(null);
    if (messageType === "success") {
      router.push("/my-tickets");
    }
  };

  return (
    <div
      className={`${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      } min-h-screen transition-colors duration-500`}
    >
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-red-600 to-red-800 dark:from-red-800 dark:to-red-900 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Ticket className="h-12 w-12" />
              <h1 className="text-4xl font-extrabold">Log a Support Ticket</h1>
            </div>
            <p className="text-lg text-gray-200">
              Need help? Report an issue and our technical team will get back to you as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div
            className={`rounded-3xl shadow-xl p-8 ${
              darkMode ? "bg-gray-800" : "bg-white"
            } border border-gray-200 dark:border-gray-700`}
          >
            {/* Technician Section */}
            {isTech && (
              <div className="mb-8 p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <h3 className="text-lg font-semibold text-red-700 dark:text-red-300">
                    Technician Options
                  </h3>
                </div>
                <label
                  className={`block mb-2 text-sm font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Log ticket for another user (optional)
                </label>
                <select
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2
                    focus:ring-red-400 transition-all
                    ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-gray-200"
                        : "bg-gray-50 border-gray-300 text-gray-900"
                    }`}
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  <option value="">Select a user (leave blank for yourself)</option>
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} {u.surname} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-6">
              <div>
                <label
                  className={`block mb-2 text-sm font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Issue Title *
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-3 rounded-xl border placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-red-400 transition-all
                    ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-gray-200"
                        : "bg-gray-50 border-gray-300 text-gray-900"
                    }`}
                  placeholder="Brief description of the issue"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {title.length}/100 characters
                </p>
              </div>

              <div>
                <label
                  className={`block mb-2 text-sm font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Detailed Description *
                </label>
                <textarea
                  className={`w-full px-4 py-3 rounded-xl border placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-red-400 resize-none transition-all
                    ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-gray-200"
                        : "bg-gray-50 border-gray-300 text-gray-900"
                    }`}
                  placeholder="Please provide detailed information about the issue, including steps to reproduce, error messages, and any relevant context..."
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {description.length}/1000 characters
                </p>
              </div>

              {/* Submit Button */}
              <button
                onClick={submitTicket}
                disabled={isSubmitting || !title.trim() || !description.trim()}
                className={`w-full font-semibold py-4 rounded-xl shadow-lg transition-all transform flex items-center justify-center gap-3
                  ${
                    isSubmitting || !title.trim() || !description.trim()
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700 hover:scale-105 active:scale-95"
                  } text-white`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Submit Ticket
                  </>
                )}
              </button>
            </div>

            {/* Help Text */}
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                💡 Tips for better support:
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                <li>• Be specific about what you were trying to do</li>
                <li>• Include any error messages you saw</li>
                <li>• Mention what browser/device you're using</li>
                <li>• Describe what you expected vs. what actually happened</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Pop-up Modal */}
      {message && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
          <div
            className={`p-6 rounded-xl shadow-lg max-w-md w-full ${
              darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"
            } border ${
              messageType === "success" ? "border-green-200 dark:border-green-800" :
              messageType === "error" ? "border-red-200 dark:border-red-800" :
              "border-yellow-200 dark:border-yellow-800"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              {messageType === "success" && <CheckCircle className="h-6 w-6 text-green-500" />}
              {messageType === "error" && <AlertCircle className="h-6 w-6 text-red-500" />}
              {messageType === "warning" && <AlertCircle className="h-6 w-6 text-yellow-500" />}
              <h3 className="font-semibold">
                {messageType === "success" ? "Success!" : 
                 messageType === "error" ? "Error" : "Warning"}
              </h3>
            </div>
            <p className="text-sm mb-6">{message}</p>
            <button
              onClick={closePopup}
              className={`w-full py-3 rounded-md font-medium transition-all ${
                messageType === "success" ? "bg-green-600 hover:bg-green-700" :
                messageType === "error" ? "bg-red-600 hover:bg-red-700" :
                "bg-yellow-600 hover:bg-yellow-700"
              } text-white`}
            >
              {messageType === "success" ? "View My Tickets" : "Close"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
