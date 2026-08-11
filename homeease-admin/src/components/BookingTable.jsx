import StatusPill from "./StatusPill";
import { bookingStatusMeta } from "../utils/bookingStatus";
import { formatCurrency } from "../utils/format";
import {
  formatSmart,
  formatIso,
} from "../utils/dateFormat";

const SKELETON_ROWS = 5;
const COLUMN_COUNT = 7;

export default function BookingTable({
  bookings,
  activeStatus,
  isLoading,
  onClearFilter,
}) {
  return (
    <div
      className="
        bg-white
        rounded-2xl
        border
        border-gray-200
        overflow-hidden
      "
    >

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead>

            <tr className="bg-gray-50">

              <th className="p-5 text-left">ID</th>
              <th className="p-5 text-left">Service</th>
              <th className="p-5 text-left">Customer</th>
              <th className="p-5 text-left">Provider</th>
              <th className="p-5 text-left">Booking Date</th>
              <th className="p-5 text-left">Status</th>
              <th className="p-5 text-left">Total Price</th>

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
                      className="p-5"
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

                  {activeStatus ? (

                    <>
                      No bookings match this filter.

                      <button
                        onClick={onClearFilter}
                        className="
                          ml-2
                          text-teal-700
                          font-medium
                          underline
                        "
                      >
                        Clear filter
                      </button>
                    </>

                  ) : (
                    "No bookings yet."
                  )}

                </td>

              </tr>

            ) : (

              bookings.map((booking) => {

                const meta = bookingStatusMeta(
                  booking.status
                );

                return (
                  <tr
                    key={booking.id}
                    className="border-t"
                  >

                    <td className="p-5">
                      #{booking.id}
                    </td>

                    <td className="p-5">
                      Service #{booking.service_id}
                    </td>

                    {/* The Booking Service now sends customer_name and
                        provider_name alongside the ids. The id fallbacks stay
                        for rows the enrichment could not resolve. */}
                    <td className="p-5">
                      {booking.customer_name ??
                        `Customer #${booking.customer_id}`}
                    </td>

                    <td className="p-5">
                      {booking.provider_name ??
                        (booking.provider_id ? (
                          `Provider #${booking.provider_id}`
                        ) : (
                          <span className="text-gray-400">
                            Not assigned
                          </span>
                        ))}
                    </td>

                    <td
                      className="p-5"
                      title={formatIso(
                        booking.booking_date
                      )}
                    >
                      {formatSmart(
                        booking.booking_date
                      )}
                    </td>

                    <td className="p-5">
                      <StatusPill
                        label={meta.label}
                        tone={meta.tone}
                      />
                    </td>

                    <td className="p-5 font-semibold">
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

    </div>
  );
}
