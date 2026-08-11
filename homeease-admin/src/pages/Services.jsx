import { useEffect, useState } from "react";
import {
  FaEdit,
  FaTrash,
  FaPlus,
} from "react-icons/fa";

import ServiceFormModal from "../components/ServiceFormModal";
import StatusPill from "../components/StatusPill";
import Banner from "../components/Banner";
import { formatCurrency } from "../utils/format";
import {
  getServices,
  createService,
  updateService,
  deleteService,
} from "../services/servicesApi";

const SKELETON_ROWS = 5;
const COLUMN_COUNT = 5;

// is_active arrives as 1/0 in the sample. Number() also copes with "1" and
// true, either of which would slip past a bare truthiness check.
const isActive = (service) =>
  Number(service.is_active) === 1;

export default function Services() {

  const [services, setServices] = useState([]);

  const [showInactive, setShowInactive] =
    useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState(null);

  // null = closed. Holds the service being edited, or {} sentinel via
  // isFormOpen for create.
  const [editingService, setEditingService] =
    useState(null);

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [submitError, setSubmitError] =
    useState(null);

  const [deletingId, setDeletingId] =
    useState(null);

  const [actionError, setActionError] =
    useState(null);

  // `silent` skips the skeletons, for re-fetches that happen behind a modal
  // or after a delete where the table is already on screen.
  const fetchServices = async (silent = false) => {

    if (!silent) {
      setIsLoading(true);
    }

    setError(null);

    try {

      const response = await getServices();

      const list = response.data.data;

      setServices(
        Array.isArray(list) ? list : []
      );

    } catch (err) {

      console.log(err);

      setServices([]);

      setError(
        "Could not load services. Check that the Booking Service is running."
      );

    } finally {

      setIsLoading(false);

    }

  };

  useEffect(() => {

    // intentional: one fetch on mount; the setters it calls are stable.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchServices();

  }, []);

  const openCreate = () => {
    setEditingService(null);
    setSubmitError(null);
    setIsFormOpen(true);
  };

  const openEdit = (service) => {
    setEditingService(service);
    setSubmitError(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingService(null);
    setSubmitError(null);
  };

  const handleSubmit = async (payload) => {

    setIsSubmitting(true);
    setSubmitError(null);

    try {

      if (editingService) {

        // PUT returns the full updated service, so splice it into state.
        const response = await updateService(
          editingService.id,
          payload
        );

        const updated = response.data.data;

        setServices((previous) =>
          previous.map((service) =>
            service.id === editingService.id
              ? updated
              : service
          )
        );

      } else {

        // POST returns only { service_id }, so re-fetch for the full row.
        await createService(payload);

        await fetchServices(true);

      }

      closeForm();

    } catch (err) {

      console.log(err);

      setSubmitError(
        "Could not save the service. Please try again."
      );

    } finally {

      setIsSubmitting(false);

    }

  };

  const handleDelete = async (service) => {

    const confirmed = window.confirm(
      "Delete this service? It will be soft-deleted and can only be restored by an engineer directly in the database."
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(service.id);
    setActionError(null);

    try {

      await deleteService(service.id);

      await fetchServices(true);

    } catch (err) {

      console.log(err);

      setActionError(
        "Could not delete the service. Please try again."
      );

    } finally {

      setDeletingId(null);

    }

  };

  const visibleServices = showInactive
    ? services
    : services.filter(isActive);

  const emptyMessage =
    services.length === 0
      ? "No services yet."
      : "No active services. Turn on Show inactive to see them.";

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
          onClick={openCreate}
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

      {/* Show inactive toggle */}

      <label className="flex items-center gap-3 mb-6 w-fit cursor-pointer">

        <input
          type="checkbox"
          checked={showInactive}
          onChange={(e) =>
            setShowInactive(e.target.checked)
          }
          className="w-5 h-5"
        />

        <span className="text-gray-700">
          Show inactive
        </span>

      </label>

      {/* Delete failure */}

      {actionError && (

        <Banner
          message={actionError}
          onDismiss={() => setActionError(null)}
        />

      )}

      {/* Load failure */}

      {error ? (

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
            onClick={() => fetchServices()}
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

        <div
          className="
            bg-white
            rounded-2xl
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
                    Category Name
                  </th>

                  <th className="p-5 text-left">
                    Description
                  </th>

                  <th className="p-5 text-left">
                    Price
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

                {isLoading ? (

                  Array.from({
                    length: SKELETON_ROWS,
                  }).map((_, rowIndex) => (

                    <tr
                      key={rowIndex}
                      className="border-t"
                    >

                      {Array.from({
                        length: COLUMN_COUNT,
                      }).map((__, cellIndex) => (

                        <td
                          key={cellIndex}
                          className="p-5"
                        >
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>

                      ))}

                    </tr>

                  ))

                ) : visibleServices.length === 0 ? (

                  <tr>

                    <td
                      colSpan={COLUMN_COUNT}
                      className="text-center py-10 text-gray-500"
                    >
                      {emptyMessage}
                    </td>

                  </tr>

                ) : (

                  visibleServices.map((service) => {

                    const active = isActive(service);

                    return (
                      <tr
                        key={service.id}
                        className={`
                          border-t
                          ${
                            active
                              ? ""
                              : "opacity-50"
                          }
                        `}
                      >

                        <td className="p-5">
                          {service.category_name}
                        </td>

                        <td className="p-5">
                          <div
                            className="max-w-sm truncate"
                            title={
                              service.description ??
                              ""
                            }
                          >
                            {service.description}
                          </div>
                        </td>

                        <td className="p-5">
                          {formatCurrency(
                            service.price
                          )}
                        </td>

                        <td className="p-5">
                          <StatusPill
                            label={
                              active
                                ? "Active"
                                : "Inactive"
                            }
                            tone={
                              active
                                ? "green"
                                : "red"
                            }
                          />
                        </td>

                        <td className="p-5">

                          <div className="flex gap-4">

                            <button
                              onClick={() =>
                                openEdit(service)
                              }
                              title="Edit"
                              className="
                                text-blue-600
                                hover:text-blue-800
                              "
                            >
                              <FaEdit />
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(service)
                              }
                              disabled={
                                deletingId ===
                                service.id
                              }
                              title="Delete"
                              className="
                                text-red-600
                                hover:text-red-800
                                disabled:opacity-40
                              "
                            >
                              <FaTrash />
                            </button>

                          </div>

                        </td>

                      </tr>
                    );

                  })

                )}

              </tbody>

            </table>

          </div>

        </div>

      )}

      {/* Create / Edit */}

      {isFormOpen && (

        <ServiceFormModal
          key={editingService?.id ?? "new"}
          service={editingService}
          isSubmitting={isSubmitting}
          submitError={submitError}
          onClose={closeForm}
          onSubmit={handleSubmit}
        />

      )}

    </div>
  );
}
