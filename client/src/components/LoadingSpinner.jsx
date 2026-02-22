import React from 'react';

export default function LoadingSpinner() {
  const placeholders = Array.from({ length: 5 });
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
      {placeholders.map((_, i) => (
        <div key={i} className="border rounded-lg p-4 bg-white animate-pulse">
          <div className="h-48 bg-gray-300 mb-4 rounded"></div>
          <div className="h-6 bg-gray-300 mb-2 rounded"></div>
          <div className="h-4 bg-gray-300 mb-1 rounded"></div>
          <div className="h-4 bg-gray-300 mb-1 rounded"></div>
          <div className="h-4 bg-gray-300 mb-4 rounded"></div>
          <div className="h-8 bg-gray-300 rounded"></div>
        </div>
      ))}
    </div>
  );
}
