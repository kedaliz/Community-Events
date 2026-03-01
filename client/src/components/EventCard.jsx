import React, { useState } from "react";
import axios from "axios";
import EventModal from "./EventModal";
import Toast from "./Toast";

export default function EventCard({
  _id, name, location, dateTime, description, imageUri,numberOfAttendees,category,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRSVPed,    setIsRSVPed]    = useState(false);
  const [attendeeCount, setAttendeeCount] = useState(numberOfAttendees);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const dt = new Date(dateTime);
  const dateStr = new Intl.DateTimeFormat("en-US", {
    month: "long", day: "numeric", year: "numeric",
  }).format(dt);
  const timeStr = new Intl.DateTimeFormat("en-US", {
    hour: "numeric", minute: "numeric",
  }).format(dt);


  const toggleRSVP = () => {
    const action = isRSVPed ? "cancel-rsvp" : "rsvp";

    axios.post(`/api/events/${_id}/${action}`)
      .then((response) => {
        setIsRSVPed(prev => !prev);
        if (response.data && response.data.numberOfAttendees !== undefined) {
          setAttendeeCount(response.data.numberOfAttendees);
        }
        
        // Show toast notification when RSVPing (not canceling)
        if (action === "rsvp") {
          setToastMessage("You have RSVP'd! Stay tuned for more info.");
          setToastType("success");
          setShowToast(true);
        }
      })
      .catch(err => {
        console.error("RSVP failed:", err);
        setToastMessage("Failed to RSVP. Please try again.");
        setToastType("error");
        setShowToast(true);
      });
  };

  // 2) Rebuild the event object so the modal can read all its fields
  const event = { _id, name, location, dateTime, description, imageUri, numberOfAttendees: attendeeCount, category};

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col w-full md:w-96 lg:w-[400px]">
      <button onClick={() => setIsModalOpen(true)} className="cursor-pointer group">
        <img src={imageUri} alt={name} className="h-48 w-full object-cover group-hover:opacity-90 transition-opacity" />
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-900">{name}</h2>
          <p className="text-gray-500 mb-1 text-sm">{dateStr} • {timeStr}</p>
          <p className="text-gray-600 mb-3 text-sm">📍 {location}</p>
          <p className="text-gray-700 text-sm line-clamp-2">{description}</p>
        </div>
      </button>

      <div className="px-6 pb-6">
        <button
          onClick={toggleRSVP}
          className={`w-full py-2.5 rounded-lg font-semibold transition text-white ${
            isRSVPed
              ? "bg-gray-400 hover:bg-gray-500"
              : "bg-blue-500 hover:bg-blue-600 shadow-md"
          }`}
        >
          {isRSVPed ? "✓ RSVP'd" : "RSVP Now"}
        </button>
      </div>

      <EventModal
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        event={event}
      />
      
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type={toastType}
      />
    </div>
  );
}
