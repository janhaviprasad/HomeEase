import { recentBooking } from "../data/booking";

export default function RecentBooking() {
  return (
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

      <div
        className="
        flex
        justify-between
        items-center
        p-6
      "
      >

        <h2 className="text-4xl font-bold">
          Recent Bookings
        </h2>

        <button className="text-teal-700 font-semibold">
          View All →
        </button>

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
              SERVICE
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

          {recentBooking.map((booking) => (

            <tr
              key={booking.id}
              className="border-t"
            >

              <td className="p-4">
                {booking.id}
              </td>

              <td className="p-4">
                {booking.customer}
              </td>

              <td className="p-4">
                {booking.service}
              </td>

              <td className="p-4">
                {booking.provider}
              </td>

              <td className="p-4">

                <span
                  className={`
                    px-3
                    py-1
                    rounded-full
                    text-sm

                    ${
                      booking.status ===
                      "Completed"
                        ? "bg-gray-200"
                        : booking.status ===
                          "Pending"
                        ? "bg-yellow-100"
                        : "bg-green-100 text-green-700"
                    }
                  `}
                >
                  {booking.status}
                </span>

              </td>

              <td className="p-4 font-semibold">
                {booking.price}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}