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
      <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-20">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 overflow-hidden">
        <div className="relative">
          <img
            src={imageUri}
            alt={name}
            className="w-full h-64 object-cover"
          />
          <button
            onClick={closeModal}
            className="absolute top-2 right-2 text-white text-2xl font-bold"
          >
            &times;
          </button>
        </div>
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-2">{name}</h2>
          <p className="text-gray-600 mb-1">{dateStr} @ {timeStr}</p>
          <p className="text-gray-600 mb-3">Location: {location}</p>
          <p className="text-gray-800 mb-4">{description}</p>
          <p className="text-gray-600 mb-1">Attendees: {numberOfAttendees}</p>
          <p className="text-gray-600 mb-4">Category: {category}</p>

          <button
            onClick={closeModal}
            className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
    );
}
