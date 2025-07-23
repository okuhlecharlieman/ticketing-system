"use client";

export default function CommentList({ comments = {}, darkMode }) {
  if (!comments || Object.keys(comments).length === 0) {
    return <p className={`text-xs italic ${darkMode ? "text-gray-400" : "text-gray-600"}`}>No comments yet.</p>;
  }

  return (
    <ul className="space-y-2 text-sm max-h-48 overflow-y-auto pr-1">
      {Object.entries(comments).map(([cid, comment]) => (
        <li
          key={cid}
          className={`border-l-4 pl-3 py-1 rounded-r-md ${
            darkMode
              ? "border-blue-400 bg-gray-600 text-gray-200"
              : "border-blue-500 bg-blue-100 text-blue-900"
          }`}
        >
          <div className="text-xs text-gray-400 mb-1">
            {new Date(comment.timestamp).toLocaleString()} – {comment.author}
          </div>
          <p>{comment.text}</p>
        </li>
      ))}
    </ul>
  );
}
