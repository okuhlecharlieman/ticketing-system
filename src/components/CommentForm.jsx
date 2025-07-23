// components/CommentForm.jsx
"use client";
import { useState } from "react";

export default function CommentForm({ ticketId, onAddComment, darkMode }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddComment(ticketId, text);
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col sm:flex-row gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add comment..."
        className={`w-full px-3 py-2 rounded border text-sm focus:outline-none ${
          darkMode
            ? "bg-gray-600 border-gray-500 text-white"
            : "bg-gray-100 border-gray-300 text-gray-900"
        }`}
      />
      <button
        type="submit"
        className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
      >
        Post
      </button>
    </form>
  );
}
