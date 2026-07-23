import { useEffect, useState } from "react";

import providersData from "../data/providers";
import ProviderTabs from "../components/ProviderTabs";
import PendingProvidersTable from "../components/PendingProvidersTable";
import ApprovedProvidersTable from "../components/ApprovedProvidersTable";

import {
  getProviders,
  getPendingProviders,
  approveProvider,
} from "../services/providerApi";

export default function Providers() {

  const [providers, setProviders] =
  useState(providersData);

  const [activeTab, setActiveTab] =
    useState("pending");
  

  const fetchProviders = async () => {

    try {

      let response;

      if (activeTab === "pending") {

        response =
          await getPendingProviders();

      } else {

        response =
          await getAllProviders();

      }

      setProviders(
        response.data.data
      );

    } catch (error) {

      console.log(error);

    }

  };

  useEffect(() => {

    fetchProviders();

  }, [activeTab]);

  const handleApprove = (id) => {

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

  alert("Provider Approved Successfully");
};

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

      {activeTab === "pending" ? (

        <PendingProvidersTable
           providers={providers.filter(
    (provider) => !provider.isApproved
  )}
          onApprove={handleApprove}
        />

      ) : (

        <ApprovedProvidersTable
          providers={providers.filter(
            (provider) =>
              provider.isApproved
          )}
        />

      )}

    </div>
  );
}


























/*

import { useState } from "react";

import ProviderTable from "../components/ProviderTable";

import {
  pendingProviders,
  approvedProviders,
} from "../data/providers";

export default function Providers() {
  const [activeTab, setActiveTab] =
    useState("pending");

  return (
    <div>

      

      <div className="flex justify-between items-start">

        <div>

          <h1 className="text-5xl font-bold">
            Providers
          </h1>

          <p className="text-gray-500 mt-2">
            Manage service professionals and
            applications.
          </p>

        </div>

        

        <div className="flex items-center gap-4">

          <button
            className="
              w-12
              h-12
              rounded-full
              border
              flex
              items-center
              justify-center
            "
          >
            🔍
          </button>

          <div
            className="
              flex
              items-center
              gap-3
              border
              px-4
              py-2
              rounded-full
            "
          >
            <img
              src="https://i.pravatar.cc/40"
              alt="Admin"
              className="w-8 h-8 rounded-full"
            />

            <span className="font-semibold">
              Admin
            </span>

          </div>

        </div>

      </div>

      

      <div className="flex gap-10 mt-10 border-b">

        <button
          onClick={() =>
            setActiveTab("pending")
          }
          className={`pb-4 font-semibold ${
            activeTab === "pending"
              ? "text-teal-700 border-b-2 border-teal-700"
              : "text-gray-500"
          }`}
        >
          Pending Approval
        </button>

        <button
          onClick={() =>
            setActiveTab("approved")
          }
          className={`pb-4 font-semibold ${
            activeTab === "approved"
              ? "text-teal-700 border-b-2 border-teal-700"
              : "text-gray-500"
          }`}
        >
          Approved
        </button>

      </div>


      <div className="mt-8">

        {activeTab === "pending" ? (
          <ProviderTable
            providers={pendingProviders}
          />
        ) : (
          <ProviderTable
            providers={approvedProviders}
            showApproveButton={false}
          />
        )}

      </div>

    </div>
  );
}
*/