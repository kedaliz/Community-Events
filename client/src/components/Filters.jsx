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
            className={`px-5 py-2.5 rounded-lg font-medium transition shadow-sm
              ${
                isActive
                  ? "bg-blue-600 text-white border border-blue-600"
                  : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400"
              }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
