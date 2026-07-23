import {
  FaUsers,
  FaUserTie,
  FaCalendarCheck,
  FaExclamationTriangle,
} from "react-icons/fa";

export default function DashboardCards() {
  const cards = [
    {
      title: "Total Customers",
      value: "1,240",
      info: "+12% this week",
      icon: <FaUsers />,
      color: "text-teal-700",
    },

    {
      title: "Total Providers",
      value: "85",
      info: "+3 new",
      icon: <FaUserTie />,
      color: "text-teal-700",
    },

    {
      title: "Total Bookings",
      value: "3,450",
      info: "+8% this month",
      icon: <FaCalendarCheck />,
      color: "text-teal-700",
    },

    {
      title: "Pending Approvals",
      value: "12",
      info: "Attention required",
      icon: <FaExclamationTriangle />,
      color: "text-red-600",
      danger: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

      {cards.map((card, index) => (

        <div
          key={index}
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

          <div className="flex justify-between">

            <div>

              <p className="text-gray-500">
                {card.title}
              </p>

              <h1 className="text-5xl font-bold mt-4">
                {card.value}
              </h1>

              <p
                className={`mt-4 ${card.color}`}
              >
                {card.info}
              </p>

            </div>

            <div
              className={`
                h-12
                w-12
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