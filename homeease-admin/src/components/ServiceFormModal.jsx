import { useState } from "react";

// Create and edit share the same fields, so one component covers both:
// `service` null means create, an object means edit.
//
// The parent mounts this with a key derived from the service id, so switching
// which row is being edited remounts the component and re-seeds the form —
// no effect needed to sync props into state.
//
// The modal never closes itself. The parent closes it on a successful save,
// which is what keeps typed input on screen when a save fails.
export default function ServiceFormModal({
  service,
  isSubmitting,
  submitError,
  onClose,
  onSubmit,
}) {

  const isEdit = Boolean(service);

  const [form, setForm] = useState({
    category_name: service?.category_name ?? "",
    description: service?.description ?? "",
    price: service?.price ?? "",
    image_url: service?.image_url ?? "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: undefined,
    }));
  };

  const validate = () => {
    const next = {};

    if (!form.category_name.trim()) {
      next.category_name =
        "Category name is required.";
    }

    const price = Number(form.price);

    if (String(form.price).trim() === "") {
      next.price = "Price is required.";
    } else if (
      !Number.isFinite(price) ||
      price <= 0
    ) {
      next.price =
        "Price must be a positive number.";
    }

    setErrors(next);

    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (isSubmitting || !validate()) {
      return;
    }

    onSubmit({
      category_name: form.category_name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      // GET returns null for an empty image, so send null rather than "".
      image_url:
        String(form.image_url).trim() || null,
    });
  };

  const fieldClass = `
    w-full
    border
    rounded-lg
    p-3
  `;

  return (
    <div
      className="
        fixed
        inset-0
        bg-black/40
        flex
        items-center
        justify-center
        z-50
        p-4
      "
    >

      <form
        onSubmit={handleSubmit}
        className="
          bg-white
          rounded-2xl
          w-full
          max-w-2xl
          p-8
          max-h-full
          overflow-y-auto
        "
      >

        <h2 className="text-3xl font-bold mb-6">
          {isEdit
            ? "Edit Service"
            : "Add Service"}
        </h2>

        {/* Category name */}

        <div className="mb-4">

          <label className="block mb-2 font-medium">
            Category Name
          </label>

          <input
            type="text"
            name="category_name"
            value={form.category_name}
            onChange={handleChange}
            placeholder="Electrician"
            className={fieldClass}
          />

          {errors.category_name && (
            <p className="text-red-600 text-sm mt-1">
              {errors.category_name}
            </p>
          )}

        </div>

        {/* Description */}

        <div className="mb-4">

          <label className="block mb-2 font-medium">
            Description
          </label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="4"
            placeholder="What this service covers"
            className={fieldClass}
          />

        </div>

        {/* Price */}

        <div className="mb-4">

          <label className="block mb-2 font-medium">
            Price (₹)
          </label>

          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            placeholder="299.00"
            className={fieldClass}
          />

          {errors.price && (
            <p className="text-red-600 text-sm mt-1">
              {errors.price}
            </p>
          )}

        </div>

        {/* Image URL */}

        <div className="mb-4">

          <label className="block mb-2 font-medium">
            Image URL
            <span className="text-gray-400 font-normal">
              {" "}
              (optional)
            </span>
          </label>

          <input
            type="text"
            name="image_url"
            value={form.image_url ?? ""}
            onChange={handleChange}
            placeholder="sofa.jpg"
            className={fieldClass}
          />

        </div>

        {/* Save failure — the modal stays open so input is not lost */}

        {submitError && (

          <div
            className="
              border
              border-red-200
              bg-red-50
              rounded-lg
              p-4
              mb-4
            "
          >
            <p className="text-red-600 font-medium">
              {submitError}
            </p>
          </div>

        )}

        <div className="flex justify-end gap-4 mt-6">

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="
              px-5
              py-3
              border
              rounded-lg
              disabled:opacity-50
            "
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="
              px-5
              py-3
              bg-teal-700
              text-white
              rounded-lg
              hover:bg-teal-800
              disabled:opacity-50
            "
          >
            {isSubmitting
              ? "Saving..."
              : "Save Service"}
          </button>

        </div>

      </form>

    </div>
  );
}
