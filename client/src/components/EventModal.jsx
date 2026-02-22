import React from "react";
export default function EventModal({isOpen,closeModal,event}){
  if (!isOpen || !event){
    return null;}
  const {
    name,
    dateTime,
    location,
    description,
    numberOfAttendees,
    category,
    imageUri,
  } = event;

  const dt = new Date(dateTime);

  // format date and time separately
  const dateStr = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(dt);
  const timeStr = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
  }).format(dt);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-20">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        <div className="relative">
          <img
            src={imageUri}
            alt={name}
            className="w-full h-72 object-cover"
          />
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold transition"
          >
            ✕
          </button>
        </div>
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-3 text-gray-900">{name}</h2>
          <div className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full mb-4">{category}</div>
          <p className="text-gray-600 mb-2 text-sm">{dateStr} • {timeStr}</p>
          <p className="text-gray-600 mb-5 text-sm">📍 {location}</p>
          <p className="text-gray-700 mb-6 leading-relaxed">{description}</p>
          <div className="flex gap-4 text-sm text-gray-600 mb-6">
            <span>👥 {numberOfAttendees} attending</span>
          </div>
          <button
            onClick={closeModal}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
    );
}
