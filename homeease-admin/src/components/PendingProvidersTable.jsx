import { FaFilter } from "react-icons/fa";
import { useState } from "react";
import {
  CATEGORIES,
  categoryName,
} from "../utils/categories";

export default function PendingProvidersTable({
   providers,
  onApprove,
  approvingId,
  selectedCategory,
  setSelectedCategory,
}) {
  const [showFilter, setShowFilter] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">

      <div className="flex justify-between items-center mb-6">

        <h2 className="text-3xl font-bold">
          Pending Applications
        </h2>

        <div className="relative">

  <button
    onClick={() =>
      setShowFilter(!showFilter)
    }
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

  {showFilter && (

    <div
      className="
        absolute
        right-0
        mt-2
        bg-white
        border
        rounded-lg
        shadow-lg
        p-3
        z-50
      "
    >

      <select
        value={selectedCategory}
        onChange={(e) => {
          setSelectedCategory(
            e.target.value
          );
          setShowFilter(false);
        }}
        className="
          border
          rounded-lg
          p-2
          w-48
        "
      >
        <option value="">
          All Categories
        </option>

        {CATEGORIES.map((category) => (

          <option
            key={category.id}
            value={category.id}
          >
            {category.name}
          </option>

        ))}

      </select>

    </div>

  )}

</div>

      </div>

      <hr className="mb-6" />

      <table className="w-full">

        <thead>

          <tr className="text-left text-gray-600">

            <th className="pb-4">Name</th>
            <th className="pb-4">Email</th>
            <th className="pb-4">Category</th>
            <th className="pb-4">Experience</th>
            <th className="pb-4">Action</th>

          </tr>

        </thead>

        <tbody>

          {providers.length === 0 ? (

            <tr>

              <td
                colSpan="5"
                className="
                  text-center
                  py-6
                  text-gray-500
                "
              >
                {selectedCategory
                  ? "No providers in this category."
                  : "No providers yet."}
              </td>

            </tr>

          ) : (

            providers.map((provider) => (

              <tr
                key={provider.id}
                className="border-t"
              >

                <td className="py-5">
                  {provider.name}
                </td>

                <td>
                  {provider.email}
                </td>

                <td>
                  {categoryName(provider.categoryId)}
                </td>

                <td>
                  {provider.experience} yrs
                </td>

                <td>

                  <button
                    onClick={() => onApprove(provider.id)}
                    disabled={
                      approvingId === provider.id
                    }
                    className="
                      bg-teal-700
                      text-white
                      px-5
                      py-2
                      rounded-lg
                      hover:bg-teal-800
                      disabled:opacity-50
                    "
                  >
                    {approvingId === provider.id
                      ? "Approving..."
                      : "Approve"}
                  </button>

                </td>

              </tr>

            ))

          )}

        </tbody>

      </table>

    </div>
  );
}
