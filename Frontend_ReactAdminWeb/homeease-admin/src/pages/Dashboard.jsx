import DashboardCards from "../components/DashboardCards";
import RecentBooking from "../components/RecentBooking";

export default function Dashboard() {
  console.log("after dashboard ");
  return (
    <div>

      {/* Header */}

      <div className="flex justify-between items-start">

        <div>

          <h1 className="text-5xl font-bold">
            Dashboard
          </h1>

          <p className="text-gray-500 mt-2">
            Overview of HomeEase
            platform performance.
          </p>

        </div>

        <div className="flex gap-4">

          <button
            className="
            px-6
            py-3
            border
            rounded-xl
            font-semibold
          "
          >
            Export Report
          </button>

          <button
            className="
            px-6
            py-3
            bg-teal-700
            text-white
            rounded-xl
            font-semibold
          "
          >
            + New Booking
          </button>

        </div>

      </div>

      {/* Cards */}

      <div className="mt-8">

        <DashboardCards />

      </div>

      {/* Table */}

      <RecentBooking />

    </div>
  );
}