import { useEffect, useState } from "react";

import DashboardCards from "../components/DashboardCards";
import StatusBreakdownChart from "../components/StatusBreakdownChart";
import PopularServicesChart from "../components/PopularServicesChart";
import RecentBooking from "../components/RecentBooking";

import {
  getBookingStats,
  getPopularServices,
} from "../services/analyticsApi";

export default function Dashboard() {

  const [stats, setStats] = useState(null);

  const [popularServices, setPopularServices] =
    useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {

    setIsLoading(true);
    setError(null);

    // allSettled, not all: one failing endpoint should not blank out the
    // half of the dashboard that loaded fine.
    const [statsResult, servicesResult] =
      await Promise.allSettled([
        getBookingStats(),
        getPopularServices(),
      ]);

    const failed = [];

    if (statsResult.status === "fulfilled") {

      setStats(statsResult.value.data.data);

    } else {

      console.log(statsResult.reason);

      setStats(null);
      failed.push("booking stats");

    }

    if (servicesResult.status === "fulfilled") {

      const payload =
        servicesResult.value.data.data;

      setPopularServices(
        Array.isArray(payload) ? payload : []
      );

    } else {

      console.log(servicesResult.reason);

      setPopularServices([]);
      failed.push("popular services");

    }

    if (failed.length > 0) {
      setError(
        `Could not load ${failed.join(
          " and "
        )}. Check that the Booking Service is running.`
      );
    }

    setIsLoading(false);

  };

  useEffect(() => {

    // intentional: one fetch on mount; the setters it calls are stable.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAnalytics();

  }, []);

  return (
    <div>

      {/* Header */}

      <div>

        <h1 className="text-5xl font-bold">
          Dashboard
        </h1>

        <p className="text-gray-500 mt-2">
          Overview of HomeEase
          platform performance.
        </p>

      </div>

      {/* Error — rendered alongside whatever did load */}

      {!isLoading && error && (

        <div
          className="
            bg-white
            rounded-2xl
            border
            border-red-200
            p-6
            mt-8
          "
        >

          <p className="text-red-600 font-medium">
            {error}
          </p>

          <button
            onClick={fetchAnalytics}
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

      )}

      {isLoading ? (

        <div
          className="
            bg-white
            rounded-2xl
            border
            border-gray-200
            p-6
            mt-8
            text-gray-500
          "
        >
          Loading analytics...
        </div>

      ) : (

        <>

          {/* Cards */}

          <div className="mt-8">

            <DashboardCards stats={stats} />

          </div>

          {/* Charts */}

          <div
            className="
              grid
              grid-cols-1
              lg:grid-cols-2
              gap-6
              mt-8
            "
          >

            <StatusBreakdownChart
              stats={stats}
            />

            <PopularServicesChart
              services={popularServices}
            />

          </div>

        </>

      )}

      {/* Table */}

      <RecentBooking />

    </div>
  );
}
