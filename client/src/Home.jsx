import { useEffect, useState } from "react";
import { useDebounce } from 'use-debounce';
import axios from "axios";

import EventCard from "./components/EventCard"
import Filters from "./components/Filters"
import Error from "./components/Error"
import LoadingSpinner from "./components/LoadingSpinner"

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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <Error onRetry={fetchEvents} homeHref="/" />;
  }


  return (
    <>

      <div className="container mx-auto px-4 md:px-8 py-6">
        {isOffHomePath && (
          <div className="mb-4">
            <button
              onClick={() => {
                if (canGoBack) {
                  window.history.back();
                  return;
                }
                window.location.assign("/");
              }}
              className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-900"
            >
              Back
            </button>
          </div>
        )}
        <h1 className="text-4xl font-bold font-sans text-gray-900 text-center mt-5 mb-6">
          <a href="/" className="hover:underline hover:decoration-blue-600">Community Events</a>
          {filter && <span className="text-blue-600"> — {filter}</span>}
        </h1>


        <div className="flex flex-col md:flex-row md:justify-between items-center gap-4 mb-6">
          <Filters categories={categories}
            currentFilter={filter}
            onFilterChange={handleFilterChange} />

          {/* search */}
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="border px-4 py-2 rounded-lg w-1/3 md:max-w-xs ml-auto"
          />
        </div>


        {/* Event Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
    </>
  )
}
