import { useEffect, useState } from "react";

import BookingTable from "../components/BookingTable";
import {
  BOOKING_STATUSES,
  TONE_CLASSES,
} from "../utils/bookingStatus";
import { getBookings } from "../services/bookingsApi";

const CHIPS = [
  { value: "", label: "All", tone: "teal" },
  ...BOOKING_STATUSES,
];

export default function Booking() {

  const [bookings, setBookings] = useState([]);

  const [activeStatus, setActiveStatus] =
    useState("");

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState(null);

  const fetchBookings = async () => {

    setIsLoading(true);
    setError(null);

    try {

      const response = await getBookings();

      // The array sits at data.bookings, alongside pagination metadata.
      const payload = response.data.data;

      const list = Array.isArray(payload?.bookings)
        ? payload.bookings
        : [];

      // created_at descending. Bookings seeded in the same batch share a
      // timestamp, so id breaks the tie and keeps the order stable.
      const sorted = [...list].sort((a, b) => {
        const diff =
          new Date(b.created_at) -
          new Date(a.created_at);

        return diff !== 0 ? diff : b.id - a.id;
      });

      setBookings(sorted);

    } catch (err) {

      console.log(err);

      setBookings([]);

      setError(
        "Could not load bookings. Check that the Booking Service is running."
      );

    } finally {

      setIsLoading(false);

    }

  };

  useEffect(() => {

    // intentional: one fetch on mount; the setters it calls are stable.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBookings();

  }, []);

  // Client-side for now; server-side once ?status= ships.
  const visibleBookings = activeStatus
    ? bookings.filter(
        (booking) =>
          booking.status === activeStatus
      )
    : bookings;

  return (
    <div>

      <h1 className="text-5xl font-bold">
        All Bookings
      </h1>

      <p className="text-gray-500 mt-2 mb-8">
        {visibleBookings.length} booking
        {visibleBookings.length === 1 ? "" : "s"}
        {activeStatus ? " with this status" : ""}.
      </p>

      {/* Status chips */}

      <div className="flex flex-wrap gap-3 mb-8">

        {CHIPS.map((chip) => (

          <button
            key={chip.label}
            onClick={() =>
              setActiveStatus(chip.value)
            }
            className={`
              px-6
              py-3
              rounded-full
              border
              transition

              ${
                activeStatus === chip.value
                  ? `${
                      TONE_CLASSES[chip.tone]
                    } border-transparent`
                  : "bg-white text-gray-700 border-gray-300"
              }
            `}
          >
            {chip.label}
          </button>

        ))}

      </div>

      {error ? (

        <div
          className="
            bg-white
            rounded-2xl
            border
            border-red-200
            p-6
          "
        >

          <p className="text-red-600 font-medium">
            {error}
          </p>

          <button
            onClick={fetchBookings}
            className="
              mt-4
              bg-teal-700
              text-white
              px-5
              py-2
              rounded-lg
              hover:bg-teal-800
            "
          >
            Retry
          </button>

        </div>

      ) : (

        <BookingTable
          bookings={visibleBookings}
          activeStatus={activeStatus}
          isLoading={isLoading}
          onClearFilter={() =>
            setActiveStatus("")
          }
        />

      )}

    </div>
  );
}
