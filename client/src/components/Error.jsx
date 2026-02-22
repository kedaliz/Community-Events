import React from 'react';

export default function Error({ onRetry, homeHref }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <svg className="w-16 h-16 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M19.428 15.341A8 8 0 1116 20" />
      </svg>
      <p className="text-red-600 mb-4 text-lg">Whoops! We couldn’t load the events.</p>
      <button
        onClick={onRetry}
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Try Again
      </button>
      {homeHref && (
        <a
          href={homeHref}
          className="mt-3 px-6 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300"
        >
          Back to Home
        </a>
      )}
    </div>
  );
}
