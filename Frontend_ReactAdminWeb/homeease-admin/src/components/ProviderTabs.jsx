export default function ProviderTabs({
  activeTab,
  setActiveTab,
}) {
  return (
    <div className="flex gap-10 border-b mb-8">

      <button
        onClick={() =>
          setActiveTab("pending")
        }
        className={`pb-3 font-medium ${
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
        className={`pb-3 font-medium ${
          activeTab === "approved"
            ? "text-teal-700 border-b-2 border-teal-700"
            : "text-gray-500"
        }`}
      >
        Approved
      </button>

    </div>
  );
}




























/*
import { FaFilter } from "react-icons/fa";
import { approveProvider } from "../services/providerApi";

export default function ProviderTable({
  providers,
  fetchProviders,
}) {

  const pendingProviders = providers.filter(
    (provider) => provider.isApproved === false
  );

  const approvedProviders = providers.filter(
    (provider) => provider.isApproved === true
  );

  const handleApprove = async (id) => {

    try {

      await approveProvider(id);

      if (fetchProviders) {
        fetchProviders();
      }

      alert("Provider Approved Successfully");

    } catch (error) {

      console.log(error);

      alert("Failed to Approve Provider");
    }
  };

  return (
    <div
      className="
        bg-white
        rounded-2xl
        border
        border-gray-200
        p-6
      "
    >
      

      <div className="flex justify-between items-center mb-6">

        <h2 className="text-3xl font-bold">
          Provider Management
        </h2>

        <button
          className="
            flex
            items-center
            gap-2
            text-teal-700
            font-medium
          "
        >
          <FaFilter />
          Filter
        </button>

      </div>

    

      <div className="mb-12">

        <h3 className="text-2xl font-semibold mb-4">
          Pending Applications
        </h3>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="text-left text-gray-600 border-b">

                <th className="pb-4">Name</th>

                <th className="pb-4">Email</th>

                <th className="pb-4">Category</th>

                <th className="pb-4">Experience</th>

                <th className="pb-4">Action</th>

              </tr>

            </thead>

            <tbody>

              {pendingProviders.length > 0 ? (

                pendingProviders.map((provider) => (

                  <tr
                    key={provider.id}
                    className="border-b"
                  >

                    <td className="py-5">

                      <div className="flex items-center gap-3">

                        <div
                          className="
                            w-12
                            h-12
                            rounded-full
                            bg-gray-200
                            flex
                            items-center
                            justify-center
                            font-semibold
                          "
                        >
                          {provider.name?.charAt(0)}
                        </div>

                        {provider.name}

                      </div>

                    </td>

                    <td>
                      {provider.email}
                    </td>

                    <td>
                      {provider.categoryId}
                    </td>

                    <td>
                      {provider.experience} Years
                    </td>

                    <td>

                      <button
                        onClick={() =>
                          handleApprove(provider.id)
                        }
                        className="
                          bg-teal-700
                          text-white
                          px-5
                          py-2
                          rounded-lg
                          hover:bg-teal-800
                        "
                      >
                        Approve
                      </button>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="5"
                    className="
                      text-center
                      py-6
                      text-gray-500
                    "
                  >
                    No Pending Applications
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

     

      <div>

        <h3 className="text-2xl font-semibold mb-4">
          Approved Providers
        </h3>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="text-left text-gray-600 border-b">

                <th className="pb-4">Name</th>

                <th className="pb-4">Email</th>

                <th className="pb-4">Category</th>

                <th className="pb-4">Experience</th>

                <th className="pb-4">Status</th>

              </tr>

            </thead>

            <tbody>

              {approvedProviders.length > 0 ? (

                approvedProviders.map((provider) => (

                  <tr
                    key={provider.id}
                    className="border-b"
                  >

                    <td className="py-5">

                      <div className="flex items-center gap-3">

                        <div
                          className="
                            w-12
                            h-12
                            rounded-full
                            bg-green-100
                            flex
                            items-center
                            justify-center
                            font-semibold
                            text-green-700
                          "
                        >
                          {provider.name?.charAt(0)}
                        </div>

                        {provider.name}

                      </div>

                    </td>

                    <td>
                      {provider.email}
                    </td>

                    <td>
                      {provider.categoryId}
                    </td>

                    <td>
                      {provider.experience} Years
                    </td>

                    <td>

                      <span
                        className="
                          bg-green-100
                          text-green-700
                          px-3
                          py-1
                          rounded-full
                          text-sm
                        "
                      >
                        Approved
                      </span>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="5"
                    className="
                      text-center
                      py-6
                      text-gray-500
                    "
                  >
                    No Approved Providers
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}
  */