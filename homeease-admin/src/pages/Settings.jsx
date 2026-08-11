import { useState } from "react";
import {useContext} from "react";

import {AdminContext} from "../context/AdminContext";

export default function Settings() {

    const {
  adminName,
  setAdminName,
  adminEmail,
  setAdminEmail,
   adminImage,
  setAdminImage,
} = useContext(AdminContext);

  // Seeded from context, which itself reads what Login stored — so the form
  // shows the admin who is actually signed in, and reflects a previous save
  // instead of resetting to placeholder literals.
  const [formData, setFormData] = useState({
    name: adminName ?? "",
    email: adminEmail ?? "",
    password: "",
    notifications: true,
  });

  const handleChange = (e) => {
    const { name, value, checked, type } =
      e.target;

    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setAdminImage(imageUrl);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
setAdminName(formData.name);

setAdminEmail(formData.email);

alert("Settings Updated Successfully!");
  };

  return (
    <div>
      {/* Header */}

      <div className="mb-8">

        <h1 className="text-5xl font-bold">
          Settings
        </h1>

        <p className="text-gray-500 mt-2">
          Manage your account settings.
        </p>

      </div>

      {/* Settings Card */}

      <div
        className="
          bg-white
          rounded-3xl
          border
          border-gray-200
          p-8
          max-w-4xl
        "
      >
        

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* Profile Image */}

          <div className="flex items-center gap-6">

            <img
    src={adminImage}
    alt="Admin"
    className="
      w-24
      h-24
      rounded-full
      object-cover
      border-4
      border-teal-600
    "
  />

            <div>

              <h2 className="text-2xl font-bold">
                {adminName}
              </h2>

              <p className="text-gray-500">
                Administrator
              </p>

              <label
      className="
        mt-3
        inline-block
        bg-teal-500
        text-white
        px-2
        py-1
        rounded-lg
        cursor-pointer
      "
    >
      Upload Photo

      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

    </label>

            </div>

          </div>

          {/* Name */}

          <div>

            <label className="block mb-2 font-medium">
              Full Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="
                w-full
                border
                rounded-xl
                p-4
              "
            />

          </div>

          {/* Email */}

          <div>

            <label className="block mb-2 font-medium">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="
                w-full
                border
                rounded-xl
                p-4
              "
            />

          </div>

          {/* Password */}

          <div>

            <label className="block mb-2 font-medium">
              New Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter new password"
              className="
                w-full
                border
                rounded-xl
                p-4
              "
            />

          </div>

          {/* Notifications */}

          <div
            className="
              flex
              items-center
              justify-between
              border
              rounded-xl
              p-4
            "
          >

            <div>

              <h3 className="font-semibold">
                Email Notifications
              </h3>

              <p className="text-gray-500 text-sm">
                Receive updates about bookings
                and providers.
              </p>

            </div>

            <input
              type="checkbox"
              name="notifications"
              checked={formData.notifications}
              onChange={handleChange}
              className="w-5 h-5"
            />

          </div>

          {/* Save Button */}

          <div>

            <button
              type="submit"
              className="
                bg-teal-700
                hover:bg-teal-800
                text-white
                px-8
                py-4
                rounded-xl
                font-semibold
              "
            >
              Save Changes
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}