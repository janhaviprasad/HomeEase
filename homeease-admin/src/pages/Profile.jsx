import { useContext } from "react";
import { AdminContext } from "../context/AdminContext";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();

  const {
    adminName,
    adminEmail,
    adminImage,
  } = useContext(AdminContext);

  return (
    <div className="max-w-3xl mx-auto">

      {/* Header */}

      <h1 className="text-4xl font-bold mb-8">
        My Profile
      </h1>

      {/* Card */}

      <div
        className="
          bg-white
          rounded-3xl
          shadow-sm
          border
          border-gray-200
          p-8
        "
      >

        {/* Profile Image */}

        <div className="text-center">

          <img
            src={adminImage}
            alt="Profile"
            className="
              w-32
              h-32
              rounded-full
              object-cover
              border-4
              border-teal-600
              mx-auto
            "
          />

          <h2 className="text-3xl font-bold mt-4">
            {adminName}
          </h2>

          <p className="text-gray-500">
            Super Admin
          </p>

        </div>

        {/* Information */}

        <div className="mt-10 space-y-5">

          <div>
            <label className="text-gray-500 text-sm">
              Full Name
            </label>

            <div className="border rounded-xl p-4 mt-1">
              {adminName}
            </div>
          </div>

          <div>
            <label className="text-gray-500 text-sm">
              Email Address
            </label>

            <div className="border rounded-xl p-4 mt-1">
              {adminEmail}
            </div>
          </div>

          <div>
            <label className="text-gray-500 text-sm">
              Phone Number
            </label>

            <div className="border rounded-xl p-4 mt-1">
              9876543210
            </div>
          </div>

          <div>
            <label className="text-gray-500 text-sm">
              Address
            </label>

            <div className="border rounded-xl p-4 mt-1">
              Nagpur, Maharashtra
            </div>
          </div>

          <div>
            <label className="text-gray-500 text-sm">
              Role
            </label>

            <div className="border rounded-xl p-4 mt-1">
              Super Admin
            </div>
          </div>

          <div>
            <label className="text-gray-500 text-sm">
              Status
            </label>

            <div
              className="
                border
                rounded-xl
                p-4
                mt-1
                text-green-600
                font-semibold
              "
            >
              Active
            </div>
          </div>

        </div>

        {/* Button */}

        <div className="mt-8">

          <button
            onClick={() =>
              navigate("/settings")
            }
            className="
              w-full
              bg-teal-700
              hover:bg-teal-800
              text-white
              py-4
              rounded-xl
              font-semibold
            "
          >
            Edit Profile
          </button>

        </div>

      </div>

    </div>
  );
}