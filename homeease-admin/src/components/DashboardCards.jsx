import {
  FaCalendarCheck,
  FaRupeeSign,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

import { formatCurrency } from "../utils/format";

export default function DashboardCards({ stats }) {

  const cards = [
    {
      title: "Total Bookings",
      value:
        Number(stats?.totalBookings) || 0,
      icon: <FaCalendarCheck />,
      color: "text-teal-700",
    },

    {
      title: "Total Revenue",
      value: formatCurrency(
        stats?.totalRevenue
      ),
      icon: <FaRupeeSign />,
      color: "text-teal-700",
    },

    {
      title: "Completed Jobs",
      value: Number(stats?.completed) || 0,
      icon: <FaCheckCircle />,
      color: "text-teal-700",
    },

    {
      title: "Pending Jobs",
      value: Number(stats?.pending) || 0,
      icon: <FaExclamationTriangle />,
      color: "text-red-600",
      danger: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

      {cards.map((card) => (

        <div
          key={card.title}
          className={`
            bg-white
            rounded-2xl
            p-6
            border

            ${
              card.danger
                ? "border-red-200"
                : "border-gray-200"
            }
          `}
        >

          <div className="flex justify-between gap-3">

            <div className="min-w-0">

              <p className="text-gray-500">
                {card.title}
              </p>

              <h1 className="text-4xl font-bold mt-4 break-words">
                {card.value}
              </h1>

            </div>

            <div
              className={`
                h-12
                w-12
                shrink-0
                rounded-xl
                bg-gray-100
                flex
                items-center
                justify-center
                ${card.color}
              `}
            >
              {card.icon}
            </div>

          </div>

        </div>

      ))}

    </div>
  );
}
