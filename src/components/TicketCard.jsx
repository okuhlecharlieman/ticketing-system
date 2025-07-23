// components/TicketCard.jsx
"use client";
import { useState } from "react";
import CommentList from "./CommentList";
import CommentForm from "./CommentForm";

export default function TicketCard({ id, ticket, userDisplay, onMarkResolved, onDelete, onAddComment, darkMode }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <li
      className={`rounded-3xl p-6 shadow-md ${darkMode ? "bg-gray-700" : "bg-blue-50"}`}
      onClick={() => setExpanded((prev) => !prev)}
    >
      <h3 className="text-lg font-semibold cursor-pointer">{ticket.title}</h3>
      <p className="text-sm mb-2">{ticket.description}</p>
      <span className={`inline-block text-sm font-semibold px-3 py-1 rounded-full ${
        ticket.status === "resolved"
          ? "bg-green-100 text-green-700"
          : "bg-yellow-100 text-yellow-700"
      }`}>
        Status: {ticket.status}
      </span>

      {expanded && (
        <div className="mt-4">
          <div className="text-xs text-gray-400">
            Logged at: {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : "N/A"}
          </div>
          <div className="text-xs text-gray-500">Logged by: {userDisplay(ticket.loggedByUid)}</div>
          {ticket.isLoggedByTech && (
            <div className="text-xs text-gray-500">Logged for: {userDisplay(ticket.loggedFor)}</div>
          )}

          <CommentList comments={ticket.comments} darkMode={darkMode} />
          <CommentForm ticketId={id} onAddComment={onAddComment} darkMode={darkMode} />

          <div className="flex gap-2 pt-4">
            {ticket.status !== "resolved" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkResolved(id, ticket);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs hover:bg-green-700"
              >
                ✅ Mark Resolved
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(id);
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs hover:bg-red-700"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
