import React from "react";

export default function Filters({ categories, currentFilter, onFilterChange }) {
  return (
    <div className="flex space-x-2">
      {categories.map((cat) => {
        const isActive = currentFilter === cat;
        return (
          <button
            key={cat}
            onClick={() => onFilterChange(cat)}
            className={`px-4 py-2 rounded-full border transition
              ${
                isActive
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-gray-800 border-gray-300 hover:opacity-90"
              }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
