import { useEffect, useState } from "react";
import { useDebounce } from 'use-debounce';
import axios from "axios";

import EventCard from "./components/EventCard"
import Filters from "./components/Filters"
import Error from "./components/Error"
import LoadingSpinner from "./components/LoadingSpinner"
import RequestEventModal from "./components/RequestEventModal"
import Toast from "./components/Toast"

export default function Home() {
  const categories = ["Social", "Festivities", "Networking"];
  const [filter, setFilter] = useState(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebounce(searchQuery, 600);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isOffHomePath = typeof window !== "undefined" && window.location.pathname !== "/";
  const canGoBack = typeof window !== "undefined" && window.history.length > 1;

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");


  const fetchEvents = () => {
    setLoading(true); setError(null);
    const params = {};
    if (filter) {
      params.category = filter;
    }
    if (debouncedSearch) {
      params.search = debouncedSearch;
    }

    axios.get("/api/events", { params })
      .then(res => setEvents(res.data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  };

  useEffect(fetchEvents, [filter, debouncedSearch]);

  const handleFilterChange = (category) => {
    setFilter(prev => (prev === category ? undefined : category));
  };

  const handleRequestSuccess = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    fetchEvents(); // Refresh events list
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <Error onRetry={fetchEvents} homeHref="/" />;
  }


  return (
    <>
      <div className="container mx-auto px-4 md:px-8 py-10">
        {isOffHomePath && (
          <div className="mb-6">
            <button
              onClick={() => {
                if (canGoBack) {
                  window.history.back();
                  return;
                }
                window.location.assign("/");
              }}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium transition"
            >
              ← Back
            </button>
          </div>
        )}
        <h1 className="text-5xl font-bold text-gray-900 text-center mt-8 mb-2">
          <a href="/" className="hover:text-blue-600 transition">Community Events</a>
        </h1>
        <p className="text-center text-gray-600 mb-8">Discover and connect with campus events</p>
        {filter && <p className="text-center text-blue-600 font-semibold mb-6">Viewing {filter} Events</p>}

        <div className="flex flex-col md:flex-row md:justify-center items-center gap-4 mb-10">
          <Filters categories={categories}
            currentFilter={filter}
            onFilterChange={handleFilterChange} />

          {/* search */}
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="border border-gray-300 px-4 py-2.5 rounded-lg w-full md:w-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          {/* Request Event Button */}
          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg shadow-md transition whitespace-nowrap"
          >
            + Request Event
          </button>
        </div>

        {/* Event Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => (
            <EventCard key={evt._id} _id={evt._id} event={evt} name={evt.name}
              location={evt.location}
              dateTime={evt.dateTime}
              description={evt.description}
              imageUri={evt.imageUri}
              numberOfAttendees={evt.numberOfAttendees}
              category={evt.category} />
          ))}
        </div>
      </div>

      <RequestEventModal
        isOpen={isRequestModalOpen}
        closeModal={() => setIsRequestModalOpen(false)}
        onSuccess={handleRequestSuccess}
      />

      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type={toastType}
      />
    </>
  )
}
