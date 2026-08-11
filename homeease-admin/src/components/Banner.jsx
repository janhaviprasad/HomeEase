// Dismissible red message strip, shown above a table.
//
// Both actions are optional, so a call site can offer Retry, Dismiss, both, or
// neither: the Services page uses Dismiss alone for a failed delete, the Users
// page uses both for a failed load.
export default function Banner({
  message,
  onRetry,
  onDismiss,
}) {
  return (
    <div
      className="
        bg-white
        rounded-2xl
        border
        border-red-200
        p-4
        mb-6
        flex
        justify-between
        items-center
        gap-4
      "
    >

      <p className="text-red-600 font-medium">
        {message}
      </p>

      <div className="flex items-center gap-4 shrink-0">

        {onRetry && (

          <button
            onClick={onRetry}
            className="
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

        )}

        {onDismiss && (

          <button
            onClick={onDismiss}
            className="text-gray-500 hover:text-gray-700"
          >
            Dismiss
          </button>

        )}

      </div>

    </div>
  );
}
