"use client";
import React, { useState, useEffect } from "react";
import { db, auth } from "../../lib/firebase";
import { ref, push, get } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

export default function LogTicket() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [user, setUser] = useState(null);
  const [isTech, setIsTech] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const router = useRouter();

  useEffect(() => {
    console.log("Setting up auth listener...");
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("Auth state changed:", currentUser);
      setUser(currentUser);

      if (!currentUser) {
        console.log("User not logged in. Redirecting to /signin");
        router.push("/signin");
        return;
      }

      try {
        const userRef = ref(db, "users/" + currentUser.uid);
        const snapshot = await get(userRef);
        const userData = snapshot.val();
        console.log("User data:", userData);

        if (userData?.isTechnician) {
          console.log("User is a technician");
          setIsTech(true);

          const allUsersRef = ref(db, "users");
          const allUsersSnapshot = await get(allUsersRef);
          const users = [];

          allUsersSnapshot.forEach((childSnapshot) => {
            const val = childSnapshot.val();
            users.push({
              id: childSnapshot.key,
              name: val.name,
              surname: val.surname,
              email: val.email,
            });
          });

          setAllUsers(users);
          console.log("Fetched all users:", users);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    });

    return () => {
      console.log("Cleaning up auth listener.");
      unsubscribe();
    };
  }, [router]);

  const submitTicket = async () => {
    console.log("Submit ticket clicked");
    if (!title || !description) {
      console.warn("Missing title or description");
      alert("Please fill in all fields.");
      return;
    }

    if (!user) {
      console.warn("User not logged in during ticket submission");
      alert("You must be logged in to submit a ticket.");
      return;
    }

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
        console.log("Technician logging for user:", selectedUser);
      }

      console.log("Submitting ticket data to Firebase:", ticketData);
      await push(ref(db, "tickets"), ticketData);
      console.log("Ticket successfully submitted to Firebase");

      // Send email notification
      console.log("Preparing to send email...");
      const emailPayload = {
        title,
        description,
        email: user.email,
      };

      console.log("Email payload:", emailPayload);
      const response = await fetch("/.netlify/functions/sendTicketEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailPayload),
      });

      const responseText = await response.text();
      console.log("Email function response status:", response.status);
      console.log("Email function response body:", responseText);

      if (!response.ok) {
        console.error("Email failed to send:", responseText);
        alert("⚠️ Email notification failed.");
      } else {
        console.log("✅ Email sent successfully.");
      }

      // Reset form
      setTitle("");
      setDescription("");
      setSelectedUser("");
      alert("Ticket submitted!");
    } catch (err) {
      console.error("❌ Error submitting ticket:", err);
      alert("Error submitting ticket: " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <Navbar />
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-blue-600">Log a Ticket</h2>

        {isTech && (
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Log Ticket For</label>
            <select
              className="w-full px-3 py-2 border rounded"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">Select a User</option>
              {allUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} {user.surname} ({user.email})
                </option>
              ))}
            </select>
          </div>
        )}

        <input
          className="w-full mb-3 px-3 py-2 border rounded"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="w-full mb-3 px-3 py-2 border rounded"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          onClick={submitTicket}
        >
          Submit Ticket
        </button>
      </div>
    </div>
  );
}
