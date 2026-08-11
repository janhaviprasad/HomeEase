import { useEffect, useState } from "react";

import ProviderTabs from "../components/ProviderTabs";
import Banner from "../components/Banner";
import PendingProvidersTable from "../components/PendingProvidersTable";
import ApprovedProvidersTable from "../components/ApprovedProvidersTable";

import {
  getProviders,
  getPendingProviders,
  approveProvider,
} from "../services/providerApi";

export default function Providers() {

  const [providers, setProviders] = useState([]);

  const [activeTab, setActiveTab] =
    useState("pending");

  const [selectedCategory, setSelectedCategory] =
    useState("");

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState(null);

  const [approvingId, setApprovingId] = useState(null);

  const [actionError, setActionError] =
    useState(null);

  const fetchProviders = async () => {

    setIsLoading(true);
    setError(null);

    try {

      const response =
        activeTab === "pending"
          ? await getPendingProviders()
          : await getProviders();

      setProviders(response.data.data);

    } catch (err) {

      console.log(err);

      setProviders([]);

      setError(
        "Could not load providers. Check that the Auth Service is running."
      );

    } finally {

      setIsLoading(false);

    }

  };

  useEffect(() => {

    // intentional: refetches on mount and whenever the tab changes; the
    // setters it calls are stable.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProviders();

    // intentional: fetchProviders reads activeTab, which is already the only
    // dependency, so it cannot capture a stale value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleApprove = async (id) => {

    setApprovingId(id);
    setActionError(null);

    try {

      await approveProvider(id);

      setProviders((prevProviders) =>
        prevProviders.map((provider) =>
          provider.id === id
            ? {
                ...provider,
                isApproved: true,
              }
            : provider
        )
      );

      // No success banner, mirroring the Services delete flow: the row
      // dropping out of the Pending tab is the confirmation.

    } catch (err) {

      console.log(err);

      setActionError(
        "Could not approve the provider. Please try again."
      );

    } finally {

      setApprovingId(null);

    }

  };

  const pendingProviders = providers.filter(
    (provider) => !provider.isApproved
  );

  const visiblePending = selectedCategory
    ? pendingProviders.filter(
        (provider) =>
          provider.categoryId ===
          Number(selectedCategory)
      )
    : pendingProviders;

  const approvedProviders = providers.filter(
    (provider) => provider.isApproved
  );

  return (

    <div className="p-2">

      <h1 className="text-5xl font-bold">
        Providers
      </h1>

      <p className="text-gray-500 mt-2 mb-8">
        Manage service professionals
        and applications.
      </p>

      <ProviderTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {actionError && (

        <Banner
          message={actionError}
          onDismiss={() => setActionError(null)}
        />

      )}

      {isLoading && (

        <div
          className="
            bg-white
            rounded-2xl
            border
            border-gray-200
            p-6
            text-gray-500
          "
        >
          Loading providers...
        </div>

      )}

      {!isLoading && error && (

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

      )}

      {!isLoading && !error && (

        activeTab === "pending" ? (

          <PendingProvidersTable
            providers={visiblePending}
            onApprove={handleApprove}
            approvingId={approvingId}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />

        ) : (

          <ApprovedProvidersTable
            providers={approvedProviders}
          />

        )

      )}

    </div>
  );
}
