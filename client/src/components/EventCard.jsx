import React, { useState } from "react";
import axios from "axios";
import EventModal from "./EventModal";

export default function EventCard({
  _id, name, location, dateTime, description, imageUri,numberOfAttendees,category,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRSVPed,    setIsRSVPed]    = useState(false);

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
      .then(() => {
        setIsRSVPed(prev => !prev);
      })
      .catch(err => {
        console.error("RSVP failed:", err);
      });
  };

  // 2) Rebuild the event object so the modal can read all its fields
  const event = { _id, name, location, dateTime, description, imageUri,numberOfAttendees,category};

  return (
    <div className="bg-[#F7F7F7] border-2 border-[#D1D5DB]  rounded-lg shadow-lg overflow-hidden flex flex-col w-full md:w-96 lg:w-[400px]">
      <button onClick={() => setIsModalOpen(true)} className="cursor-pointer">
        <img src={imageUri} alt={name} className="h-48 w-full object-cover" />
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-2">{name}</h2>
          <p className="text-gray-600 mb-1">{dateStr} @ {timeStr}</p>
          <p className="text-gray-600 mb-4">Location: {location}</p>
          <p className="text-gray-600">{description}</p>
        </div>
      </button>

      <div className="px-4 pb-4">
        <button
          onClick={toggleRSVP}
          className={`w-full py-2 rounded text-white ${
            isRSVPed
              ? "bg-gray-500 hover:bg-gray-600"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isRSVPed ? "Cancel RSVP" : "RSVP"}
        </button>
      </div>

      <EventModal
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        event={event}
      />
    </div>
  );
}
