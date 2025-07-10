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
  const [user, setUser] = useState(null); // Logged-in user
  const [isTech, setIsTech] = useState(false); // Check if user is a technician
  const [allUsers, setAllUsers] = useState([]); // All users in the system
  const [selectedUser, setSelectedUser] = useState(""); // User selected by the technician
  const router = useRouter();

  // Listen for auth state and fetch user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        router.push("/signin"); // Redirect if not signed in
        return;
      }

      // Fetch logged-in user's profile to check if they are a technician
      const userRef = ref(db, "users/" + currentUser.uid);
      const snapshot = await get(userRef);
      const userData = snapshot.val();

      if (userData?.isTechnician) {
        setIsTech(true);

        // Fetch all users for technician
        const allUsersRef = ref(db, "users");
        const allUsersSnapshot = await get(allUsersRef);
        const users = [];
        allUsersSnapshot.forEach((childSnapshot) => {
          users.push({
            id: childSnapshot.key,
            name: childSnapshot.val().name,
            surname: childSnapshot.val().surname,
            email: childSnapshot.val().email,
          });
        });
        setAllUsers(users);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const submitTicket = async () => {
    if (!title || !description) {
      alert("Please fill in all fields.");
      return;
    }
    if (!user) {
      alert("You must be logged in to submit a ticket.");
      return;
    }

    try {
      // Prepare ticket data
      const ticketData = {
        title,
        description,
        status: "open",
        created: Date.now(),
        createdAt: new Date().toLocaleString(),
        loggedBy: user.email, // Email of the person logging the ticket
        loggedByUid: user.uid,
      };

      // If the user is a technician logging for someone else
      if (isTech && selectedUser) {
        ticketData.loggedFor = selectedUser; // User ID of the person the ticket is logged for
        ticketData.isLoggedByTech = true; // Flag to mark technician action
      }

      // Push ticket to Firebase
      await push(ref(db, "tickets"), ticketData);

      // Reset form fields
      setTitle("");
      setDescription("");
      setSelectedUser("");

      alert("Ticket submitted!");
    } catch (error) {
      alert("Error submitting ticket: " + error.message);
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