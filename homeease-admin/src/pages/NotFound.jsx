import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="p-2">

      <h1 className="text-5xl font-bold">
        Page not found
      </h1>

      <p className="text-gray-500 mt-2 mb-8">
        That address does not match anything in
        the admin console.
      </p>

      <div
        className="
          bg-white
          rounded-2xl
          border
          border-gray-200
          p-6
        "
      >

        <Link
          to="/dashboard"
          className="
            inline-block
            bg-teal-700
            text-white
            px-5
            py-2
            rounded-lg
            hover:bg-teal-800
          "
        >
          Back to Dashboard
        </Link>

      </div>

    </div>
  );
}
