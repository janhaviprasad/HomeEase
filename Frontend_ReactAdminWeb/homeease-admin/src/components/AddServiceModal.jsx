import { useState } from "react";

export default function AddServiceModal({
  isOpen,
  onClose,
  onSave,
}) {
  const [formData, setFormData] = useState({
    serviceName: "",
    category: "",
    price: "",
    duration: "",
    description: "",
    status: "Active",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    onSave(formData);

    setFormData({
      serviceName: "",
      category: "",
      price: "",
      duration: "",
      description: "",
      status: "Active",
    });

    onClose();
  };

  if (!isOpen) return null;

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
      "
    >
      <div
        className="
          bg-white
          rounded-2xl
          w-full
          max-w-2xl
          p-8
        "
      >
        <h2 className="text-3xl font-bold mb-6">
          Add Service
        </h2>

        <div className="grid grid-cols-2 gap-4">

          <input
            type="text"
            name="serviceName"
            placeholder="Service Name"
            value={formData.serviceName}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <input
            type="text"
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <input
            type="text"
            name="duration"
            placeholder="Duration"
            value={formData.duration}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

        </div>

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
          className="
            border
            p-3
            rounded-lg
            w-full
            mt-4
          "
        />

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="
            border
            p-3
            rounded-lg
            w-full
            mt-4
          "
        >
          <option>Active</option>
          <option>Inactive</option>
        </select>

        <div
          className="
            flex
            justify-end
            gap-4
            mt-6
          "
        >
          <button
            onClick={onClose}
            className="
              px-5
              py-3
              border
              rounded-lg
            "
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="
              px-5
              py-3
              bg-teal-700
              text-white
              rounded-lg
            "
          >
            Save Service
          </button>
        </div>

      </div>
    </div>
  );
}