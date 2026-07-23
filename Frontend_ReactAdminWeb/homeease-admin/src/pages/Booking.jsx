import { useState } from "react";
import { booking } from "../data/booking";

export default function Booking() {
  const [activeTab, setActiveTab] = useState("All");

  const tabs = [
    "All",
    "Pending",
    "Accepted",
    "In Progress",
    "Completed",
    "Cancelled",
  ];

  const filteredBookings =
    activeTab === "All"
      ? booking
      : booking.filter(
          (booking) => booking.status === activeTab
        );

  const getStatusStyle = (status) => {
    switch (status) {
      case "Accepted":
        return "bg-teal-100 text-teal-700";

      case "Pending":
        return "bg-gray-200 text-gray-700";

      case "In Progress":
        return "bg-yellow-100 text-yellow-700";

      case "Completed":
        return "bg-green-100 text-green-700";

      case "Cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "";
    }
  };

  return (
    <div>
      {/* Heading */}

      <h1 className="text-5xl font-bold mb-8">
        All Bookings
      </h1>

      {/* Tabs */}

      <div className="flex flex-wrap gap-3 mb-8">

        {tabs.map((tab) => (

          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              px-6
              py-3
              rounded-full
              border
              transition

              ${
                activeTab === tab
                  ? "bg-teal-700 text-white"
                  : "bg-white text-gray-700"
              }
            `}
          >
            {tab}
          </button>

        ))}

      </div>

      {/* Table */}

      <div
        className="
          bg-white
          rounded-3xl
          border
          border-gray-200
          overflow-hidden
        "
      >

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="bg-gray-50">

                <th className="p-5 text-left">
                  Booking ID
                </th>

                <th className="p-5 text-left">
                  Customer
                </th>

                <th className="p-5 text-left">
                  Service
                </th>

                <th className="p-5 text-left">
                  Provider
                </th>

                <th className="p-5 text-left">
                  Date
                </th>

                <th className="p-5 text-left">
                  Status
                </th>

                <th className="p-5 text-left">
                  Price
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredBookings.map((booking) => (

                <tr
                  key={booking.id}
                  className="border-t"
                >

                  <td className="p-5">
                    {booking.id}
                  </td>

                  <td className="p-5">
                    {booking.customer}
                  </td>

                  <td className="p-5">
                    {booking.service}
                  </td>

                  <td className="p-5">
                    {booking.provider}
                  </td>

                  <td className="p-5">
                    {booking.date}
                  </td>

                  <td className="p-5">

                    <span
                      className={`
                        px-4
                        py-2
                        rounded-full
                        text-sm
                        font-medium
                        ${getStatusStyle(
                          booking.status
                        )}
                      `}
                    >
                      {booking.status}
                    </span>

                  </td>

                  <td className="p-5 font-semibold">
                    {booking.price}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}