import { useEffect, useState } from "react";

import StatusPill from "./StatusPill";
import Banner from "./Banner";
import { bookingStatusMeta } from "../utils/bookingStatus";
import { formatCurrency } from "../utils/format";
import {
  formatSmart,
  formatIso,
} from "../utils/dateFormat";
import { getBookings } from "../services/bookingsApi";

const RECENT_COUNT = 5;
const SKELETON_ROWS = 5;
const COLUMN_COUNT = 6;

export default function RecentBooking() {

  const [bookings, setBookings] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState(null);

  const fetchRecent = async () => {

    setIsLoading(true);
    setError(null);

    try {

      const response = await getBookings();

      // The array sits at data.bookings, alongside pagination metadata.
      const payload = response.data.data;

      const list = Array.isArray(payload?.bookings)
        ? payload.bookings
        : [];

      // created_at descending, same as the Bookings page. Rows seeded in one
      // batch share a timestamp, so id breaks the tie and keeps order stable.
      const sorted = [...list].sort((a, b) => {
        const diff =
          new Date(b.created_at) -
          new Date(a.created_at);

        return diff !== 0 ? diff : b.id - a.id;
      });

      // getBookings takes no params, so the trim happens here rather than
      // server-side. Cheap at cycle-2 volumes.
      setBookings(sorted.slice(0, RECENT_COUNT));

    } catch (err) {

      console.log(err);

      setBookings([]);

      setError(
        "Could not load recent bookings. Check that the Booking Service is running."
      );

    } finally {

      setIsLoading(false);

    }

  };

  useEffect(() => {

    // intentional: one fetch on mount; the setters it calls are stable.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRecent();

  }, []);

  // Names arrive once the Booking Service ships customer_name / provider_name;
  // until then the ids stand in and these fall through automatically.
  const customerLabel = (booking) =>
    booking.customer_name ??
    `Customer #${booking.customer_id}`;

  const providerLabel = (booking) => {
    if (booking.provider_name) {
      return booking.provider_name;
    }

    return booking.provider_id
      ? `Provider #${booking.provider_id}`
      : null;
  };

  return (
    <>

      {/* Sibling to the card, not inside it — Banner is itself a bordered
          white card, and nesting one in another reads as a rendering bug. */}
      {error && (

        <Banner
          message={error}
          onRetry={fetchRecent}
          onDismiss={() => setError(null)}
        />

      )}

      <div
        className="
        bg-white
        mt-8
        rounded-2xl
        border
        border-gray-200
        overflow-hidden
      "
      >

        <div className="p-6">

          <h2 className="text-4xl font-bold">
            Recent Bookings
          </h2>

        </div>

        <table className="w-full">

          <thead className="bg-gray-50">

            <tr>

              <th className="text-left p-4">
                ID
              </th>

              <th className="text-left p-4">
                CUSTOMER
              </th>

              <th className="text-left p-4">
                DATE
              </th>

              <th className="text-left p-4">
                PROVIDER
              </th>

              <th className="text-left p-4">
                STATUS
              </th>

              <th className="text-left p-4">
                PRICE
              </th>

            </tr>

          </thead>

          <tbody>

            {isLoading ? (

              Array.from({
                length: SKELETON_ROWS,
              }).map((_, rowIndex) => (

                <tr
                  key={rowIndex}
                  className="border-t"
                >

                  {Array.from({
                    length: COLUMN_COUNT,
                  }).map((__, cellIndex) => (

                    <td
                      key={cellIndex}
                      className="p-4"
                    >
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>

                  ))}

                </tr>

              ))

            ) : bookings.length === 0 ? (

              <tr>

                <td
                  colSpan={COLUMN_COUNT}
                  className="text-center py-10 text-gray-500"
                >
                  No recent bookings.
                </td>

              </tr>

            ) : (

              bookings.map((booking) => {

                const meta = bookingStatusMeta(
                  booking.status
                );

                const provider =
                  providerLabel(booking);

                return (
                  <tr
                    key={booking.id}
                    className="border-t"
                  >

                    <td className="p-4">
                      #{booking.id}
                    </td>

                    <td className="p-4">
                      {customerLabel(booking)}
                    </td>

                    <td
                      className="p-4"
                      title={formatIso(
                        booking.booking_date
                      )}
                    >
                      {formatSmart(
                        booking.booking_date
                      )}
                    </td>

                    <td className="p-4">
                      {provider ?? (
                        <span className="text-gray-400">
                          Not assigned
                        </span>
                      )}
                    </td>

                    <td className="p-4">

                      <StatusPill
                        label={meta.label}
                        tone={meta.tone}
                      />

                    </td>

                    <td className="p-4 font-semibold">
                      {formatCurrency(
                        booking.total_price
                      )}
                    </td>

                  </tr>
                );

              })

            )}

          </tbody>

        </table>

      </div>

    </>
  );
}
