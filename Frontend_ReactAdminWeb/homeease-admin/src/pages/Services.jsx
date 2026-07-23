import { useState } from "react";
import { services } from "../data/services";
import {
  FaEdit,
  FaTrash,
  FaPlus,
} from "react-icons/fa";

import AddServiceModal from "../components/AddServiceModal";

export default function Services() {
  const [serviceList, setServiceList] =
    useState(services);

  const [showModal, setShowModal] =
    useState(false);

  const deleteService = (id) => {
    setServiceList(
      serviceList.filter(
        (service) => service.id !== id
      )
    );
  };

  const handleSaveService = (newService) => {
    const service = {
      id: Date.now(),
      name: newService.serviceName,
      category: newService.category,
      price: `$${newService.price}`,
      duration: newService.duration,
      status: newService.status,
    };

    setServiceList([
      ...serviceList,
      service,
    ]);
  };

  return (
    <div>
      {/* Header */}

      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-5xl font-bold">
            Services
          </h1>

          <p className="text-gray-500 mt-2">
            Manage HomeEase service catalog.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="
            bg-teal-700
            text-white
            px-6
            py-3
            rounded-xl
            flex
            items-center
            gap-2
            hover:bg-teal-800
          "
        >
          <FaPlus />

          Add Service
        </button>

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
                  Service Name
                </th>

                <th className="p-5 text-left">
                  Category
                </th>

                <th className="p-5 text-left">
                  Price
                </th>

                <th className="p-5 text-left">
                  Duration
                </th>

                <th className="p-5 text-left">
                  Status
                </th>

                <th className="p-5 text-left">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {serviceList.map((service) => (

                <tr
                  key={service.id}
                  className="border-t"
                >

                  <td className="p-5">
                    {service.name}
                  </td>

                  <td className="p-5">
                    {service.category}
                  </td>

                  <td className="p-5">
                    {service.price}
                  </td>

                  <td className="p-5">
                    {service.duration}
                  </td>

                  <td className="p-5">

                    <span
                      className={`
                        px-4
                        py-2
                        rounded-full
                        text-sm
                        font-medium

                        ${
                          service.status ===
                          "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }
                      `}
                    >
                      {service.status}
                    </span>

                  </td>

                  <td className="p-5">

                    <div className="flex gap-4">

                      <button
                        className="
                          text-blue-600
                          hover:text-blue-800
                        "
                      >
                        <FaEdit />
                      </button>

                      <button
                        onClick={() =>
                          deleteService(
                            service.id
                          )
                        }
                        className="
                          text-red-600
                          hover:text-red-800
                        "
                      >
                        <FaTrash />
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>
      </div>

      {/* Add Service Modal */}

      <AddServiceModal
        isOpen={showModal}
        onClose={() =>
          setShowModal(false)
        }
        onSave={handleSaveService}
      />

    </div>
  );
}