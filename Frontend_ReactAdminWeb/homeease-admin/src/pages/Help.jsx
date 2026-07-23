import {
  FaQuestionCircle,
  FaEnvelope,
  FaPhone,
  FaBug,
} from "react-icons/fa";

export default function Help() {
  return (
    <div className="max-w-5xl">

      {/* Header */}

      <div className="mb-8">

        <h1 className="text-5xl font-bold">
          Help & Support
        </h1>

        <p className="text-gray-500 mt-2">
          Find answers and get support for
          HomeEase Admin Dashboard.
        </p>

      </div>

      {/* Support Cards */}

      <div className="grid md:grid-cols-3 gap-6">

        <div
          className="
            bg-white
            p-6
            rounded-2xl
            border
            border-gray-200
          "
        >
          <FaEnvelope
            className="
              text-teal-700
              text-3xl
              mb-4
            "
          />

          <h3 className="text-xl font-semibold">
            Email Support
          </h3>

          <p className="text-gray-500 mt-2">
            support@homeease.com
          </p>

        </div>

        <div
          className="
            bg-white
            p-6
            rounded-2xl
            border
            border-gray-200
          "
        >
          <FaPhone
            className="
              text-teal-700
              text-3xl
              mb-4
            "
          />

          <h3 className="text-xl font-semibold">
            Phone Support
          </h3>

          <p className="text-gray-500 mt-2">
            +91 9876543210
          </p>

        </div>

        <div
          className="
            bg-white
            p-6
            rounded-2xl
            border
            border-gray-200
          "
        >
          <FaBug
            className="
              text-red-500
              text-3xl
              mb-4
            "
          />

          <h3 className="text-xl font-semibold">
            Report Issue
          </h3>

          <p className="text-gray-500 mt-2">
            Report bugs and technical
            issues.
          </p>

        </div>

      </div>

      {/* FAQ Section */}

      <div
        className="
          bg-white
          rounded-2xl
          border
          border-gray-200
          p-8
          mt-8
        "
      >

        <div className="flex items-center gap-3 mb-6">

          <FaQuestionCircle
            className="
              text-teal-700
              text-2xl
            "
          />

          <h2 className="text-3xl font-bold">
            Frequently Asked Questions
          </h2>

        </div>

        <div className="space-y-6">

          <div>

            <h3 className="font-semibold">
              How do I approve providers?
            </h3>

            <p className="text-gray-500 mt-2">
              Navigate to Providers page
              and click the Approve button.
            </p>

          </div>

          <hr />

          <div>

            <h3 className="font-semibold">
              How can I add a service?
            </h3>

            <p className="text-gray-500 mt-2">
              Open Services page and click
              Add Service.
            </p>

          </div>

          <hr />

          <div>

            <h3 className="font-semibold">
              How do I manage bookings?
            </h3>

            <p className="text-gray-500 mt-2">
              Open Bookings page and filter
              bookings by status.
            </p>

          </div>

          <hr />

          <div>

            <h3 className="font-semibold">
              How can I update my profile?
            </h3>

            <p className="text-gray-500 mt-2">
              Go to Profile page and click
              Edit Profile.
            </p>

          </div>

        </div>

      </div>

      {/* Quick Guide */}

      <div
        className="
          bg-white
          rounded-2xl
          border
          border-gray-200
          p-8
          mt-8
        "
      >

        <h2 className="text-3xl font-bold mb-6">
          Quick Guide
        </h2>

        <ul className="space-y-3 text-gray-600">

          <li>
            ✅ Manage Providers
          </li>

          <li>
            ✅ Approve Applications
          </li>

          <li>
            ✅ Manage Bookings
          </li>

          <li>
            ✅ Add/Edit Services
          </li>

          <li>
            ✅ Update Profile Settings
          </li>

        </ul>

      </div>

    </div>
  );
}