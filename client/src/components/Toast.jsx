import React, { useEffect } from "react";

export default function Toast({ message, isVisible, onClose, type = "success" }) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
      <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 min-w-[300px]`}>
        <span className="text-2xl">
          {type === "success" ? "🎉" : "❌"}
        </span>
        <p className="font-semibold text-lg">{message}</p>
        <button
          onClick={onClose}
          className="ml-2 text-white hover:text-gray-200 font-bold text-xl"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
