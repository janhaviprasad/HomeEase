import { useEffect, useState } from "react";

import { getProviders } from "../services/providerApi";
import { getProviderEarnings } from "../services/earningsApi";
import { categoryName } from "../utils/categories";
import { formatCurrency } from "../utils/format";
import { formatCalendarDate } from "../utils/dateFormat";

export default function Earnings() {

  // --- provider list (Auth Service :8081, on mount) ---

  const [providers, setProviders] = useState([]);

  const [providersLoading, setProvidersLoading] =
    useState(true);

  const [providersError, setProvidersError] =
    useState(null);

  // --- form ---

  const [providerId, setProviderId] = useState("");

  const [fromDate, setFromDate] = useState("");

  const [toDate, setToDate] = useState("");

  const [dateError, setDateError] = useState("");

  // --- earnings (Booking Service :8082, on demand) ---

  const [earnings, setEarnings] = useState(null);

  const [earningsLoading, setEarningsLoading] =
    useState(false);

  const [earningsError, setEarningsError] =
    useState(null);

  // The provider and range that actually produced `earnings`. Drives the
  // caption and whether the Fetch button is showing — form state alone can
  // drift ahead of what was fetched.
  const [lastFetched, setLastFetched] =
    useState(null);

  const fetchProviders = async () => {

    setProvidersLoading(true);
    setProvidersError(null);

    try {

      const response = await getProviders();

      const list = response.data.data;

      // The Auth Service has no approved-only param, so filter here — same
      // approach as Providers.jsx.
      setProviders(
        (Array.isArray(list) ? list : []).filter(
          (provider) =>
            provider.isApproved === true
        )
      );

    } catch (err) {

      console.log(err);

      setProviders([]);

      setProvidersError(
        "Failed to load providers. Retry?"
      );

    } finally {

      setProvidersLoading(false);

    }

  };

  useEffect(() => {

    // intentional: one fetch on mount; the setters it calls are stable.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProviders();

  }, []);

  const validateDates = (from, to) => {

    if (Boolean(from) !== Boolean(to)) {
      setDateError(
        "Please provide both dates or leave both empty."
      );
      return false;
    }

    if (from && to && from > to) {
      setDateError(
        "From date must be before or equal to To date."
      );
      return false;
    }

    setDateError("");
    return true;
  };

  // Takes explicit arguments rather than reading state, so it can be called
  // from the select's onChange before setProviderId has settled.
  const fetchEarnings = async (id, from, to) => {

    setEarningsLoading(true);
    setEarningsError(null);

    try {

      const response =
        await getProviderEarnings(id, from, to);

      setEarnings(response.data.data);

      setLastFetched({
        providerId: id,
        fromDate: from,
        toDate: to,
      });

    } catch (err) {

      console.log(err);

      setEarningsError(
        "Failed to load earnings. Retry?"
      );

    } finally {

      setEarningsLoading(false);

    }

  };

  const handleProviderChange = (event) => {

    const nextId = event.target.value;

    setProviderId(nextId);

    // Selecting a provider fetches straight away.
    if (
      nextId &&
      validateDates(fromDate, toDate)
    ) {
      fetchEarnings(nextId, fromDate, toDate);
    }

  };

  const handleFetchClick = () => {

    if (!providerId || earningsLoading) {
      return;
    }

    if (!validateDates(fromDate, toDate)) {
      return;
    }

    fetchEarnings(providerId, fromDate, toDate);
  };

  const handleClearDates = () => {
    setFromDate("");
    setToDate("");
    setDateError("");
  };

  const providerNameFor = (id) => {

    const match = providers.find(
      (provider) =>
        String(provider.userId) === String(id)
    );

    return match?.name ?? `Provider #${id}`;
  };

  // The Fetch button only appears once the range differs from what produced
  // the numbers on screen — otherwise it would do nothing. Clearing the dates
  // counts as a change, so the button comes back.
  const rangeDirty =
    !lastFetched ||
    fromDate !== lastFetched.fromDate ||
    toDate !== lastFetched.toDate;

  const fetchLabel = lastFetched
    ? "Fetch new range"
    : "Fetch Earnings";

  const caption = lastFetched
    ? lastFetched.fromDate && lastFetched.toDate
      ? `From ${formatCalendarDate(
          lastFetched.fromDate
        )} to ${formatCalendarDate(
          lastFetched.toDate
        )}`
      : "All time"
    : "";

  const cardClass = `
    bg-white
    rounded-2xl
    border
    border-gray-200
    p-6
  `;

  return (
    <div className="p-2">

      <h1 className="text-5xl font-bold">
        Provider Earnings
      </h1>

      <p className="text-gray-500 mt-2 mb-8">
        Total earnings and completed jobs
        for a single provider.
      </p>

      {/* Controls */}

      <div className={`${cardClass} mb-8`}>

        {providersError ? (

          <div>

            <p className="text-red-600 font-medium">
              {providersError}
            </p>

            <button
              onClick={fetchProviders}
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

          <>

            <div className="flex flex-wrap gap-4 items-end">

              <div className="flex-1 min-w-[240px]">

                <label className="block mb-2 font-medium">
                  Provider
                </label>

                <select
                  value={providerId}
                  onChange={handleProviderChange}
                  disabled={providersLoading}
                  className="
                    w-full
                    bg-white
                    border
                    rounded-xl
                    px-4
                    py-3
                    disabled:opacity-50
                  "
                >
                  <option value="">
                    {providersLoading
                      ? "Loading providers..."
                      : "Select a provider"}
                  </option>

                  {providers.map((provider) => (
                    <option
                      key={provider.userId}
                      value={provider.userId}
                    >
                      {provider.name} —{" "}
                      {categoryName(
                        provider.categoryId
                      )}
                    </option>
                  ))}
                </select>

              </div>

              <div>

                <label className="block mb-2 font-medium">
                  From
                </label>

                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setDateError("");
                  }}
                  className="
                    bg-white
                    border
                    rounded-xl
                    px-4
                    py-3
                  "
                />

              </div>

              <div>

                <label className="block mb-2 font-medium">
                  To
                </label>

                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setDateError("");
                  }}
                  className="
                    bg-white
                    border
                    rounded-xl
                    px-4
                    py-3
                  "
                />

              </div>

              {(fromDate || toDate) && (

                <button
                  onClick={handleClearDates}
                  className="
                    py-3
                    text-teal-700
                    font-medium
                    underline
                  "
                >
                  Clear dates
                </button>

              )}

              {rangeDirty && (

                <button
                  onClick={handleFetchClick}
                  disabled={
                    !providerId || earningsLoading
                  }
                  className="
                    bg-teal-700
                    text-white
                    px-6
                    py-3
                    rounded-xl
                    font-semibold
                    hover:bg-teal-800
                    disabled:opacity-50
                  "
                >
                  {fetchLabel}
                </button>

              )}

            </div>

            {dateError && (

              <p className="text-red-600 text-sm mt-3">
                {dateError}
              </p>

            )}

          </>

        )}

      </div>

      {/* Results */}

      {earningsError ? (

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
            {earningsError}
          </p>

          <button
            onClick={handleFetchClick}
            disabled={earningsLoading}
            className="
              mt-4
              bg-teal-700
              text-white
              px-5
              py-2
              rounded-lg
              hover:bg-teal-800
              disabled:opacity-50
            "
          >
            Retry
          </button>

        </div>

      ) : earningsLoading && !earnings ? (

        /* First load — skeletons in the eventual layout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div
            className={`${cardClass} lg:col-span-2`}
          >
            <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
            <div className="h-14 w-64 bg-gray-100 rounded animate-pulse mt-6" />
            <div className="h-3 w-40 bg-gray-100 rounded animate-pulse mt-6" />
          </div>

          <div className={cardClass}>
            <div className="h-4 w-28 bg-gray-100 rounded animate-pulse" />
            <div className="h-10 w-20 bg-gray-100 rounded animate-pulse mt-6" />
          </div>

        </div>

      ) : !earnings ? (

        <div
          className={`${cardClass} text-gray-500`}
        >
          Select a provider to see their earnings.
        </div>

      ) : (

        <div className="relative">

          {/* Refetch — previous numbers stay visible, muted */}
          {earningsLoading && (

            <div
              className="
                absolute
                inset-0
                z-10
                flex
                items-center
                justify-center
                gap-3
              "
            >
              <div
                className="
                  h-8
                  w-8
                  rounded-full
                  border-4
                  border-teal-700
                  border-t-transparent
                  animate-spin
                "
              />

              <span className="text-gray-700 font-medium">
                Fetching for{" "}
                {providerNameFor(providerId)}...
              </span>
            </div>

          )}

          <div
            className={`
              grid
              grid-cols-1
              lg:grid-cols-3
              gap-6
              transition-opacity
              ${
                earningsLoading
                  ? "opacity-40"
                  : "opacity-100"
              }
            `}
          >

            {Number(earnings.completedBookings) ===
            0 ? (

              <div
                className={`${cardClass} lg:col-span-3 text-gray-500`}
              >
                No earnings recorded for{" "}
                {providerNameFor(
                  lastFetched?.providerId
                )}
                {lastFetched?.fromDate
                  ? " in this date range"
                  : " yet"}
                .
              </div>

            ) : (

              <>

                {/* Total earnings — dominant */}
                <div
                  className={`${cardClass} lg:col-span-2`}
                >

                  <p className="text-gray-500">
                    Total Earnings
                  </p>

                  <h2 className="text-6xl font-bold mt-4 break-words">
                    {formatCurrency(
                      earnings.totalEarnings
                    )}
                  </h2>

                  <p className="text-gray-400 text-sm mt-4">
                    {caption}
                  </p>

                </div>

                {/* Completed jobs */}
                <div className={cardClass}>

                  <p className="text-gray-500">
                    Completed Jobs
                  </p>

                  <h2 className="text-5xl font-bold mt-4">
                    {Number(
                      earnings.completedBookings
                    ) || 0}
                  </h2>

                </div>

              </>

            )}

          </div>

        </div>

      )}

    </div>
  );
}
