import StatusPill from "./StatusPill";
import Avatar from "./Avatar";

const ROLE_TONES = {
  CUSTOMER: "gray",
  PROVIDER: "green",
  ADMIN: "teal",
};

const SKELETON_ROWS = 5;
const COLUMN_COUNT = 5;

function emptyMessage({
  hasError,
  activeRole,
  searchTerm,
}) {

  // A dismissed load error would otherwise leave "No users match this filter"
  // on screen, which reads as "no data" when the truth is "request failed".
  if (hasError) {
    return "Couldn't load users.";
  }

  const applied = [];

  if (activeRole) {
    applied.push(`role ${activeRole}`);
  }

  if (searchTerm) {
    applied.push(`search "${searchTerm}"`);
  }

  return applied.length > 0
    ? `No users match this filter (${applied.join(
        ", "
      )}).`
    : "No users yet.";
}

export default function UsersTable({
  users,
  searchTerm,
  activeRole,
  isLoading,
  hasError,
}) {
  return (
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

              <th className="p-5 text-left">Name</th>
              <th className="p-5 text-left">Email</th>
              <th className="p-5 text-left">Role</th>
              <th className="p-5 text-left">Phone</th>
              <th className="p-5 text-left">Actions</th>

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

            ) : users.length === 0 ? (

              <tr>

                <td
                  colSpan={COLUMN_COUNT}
                  className="text-center py-10 text-gray-500"
                >
                  {emptyMessage({
                    hasError,
                    activeRole,
                    searchTerm,
                  })}
                </td>

              </tr>

            ) : (

              users.map((user) => (

                <tr
                  key={user.id}
                  className="border-t"
                >

                  <td className="p-5">

                    <div className="flex items-center gap-3">

                      <Avatar
                        id={user.id}
                        name={user.name}
                        imageUrl={user.imageUrl}
                      />

                      <span>{user.name}</span>

                    </div>

                  </td>

                  <td className="p-5">
                    {user.email}
                  </td>

                  <td className="p-5">

                    <StatusPill
                      label={user.role}
                      tone={
                        ROLE_TONES[user.role] ??
                        "neutral"
                      }
                    />

                  </td>

                  <td className="p-5">
                    {user.phone}
                  </td>

                  <td className="p-5">

                    <button
                      onClick={() => {
                        // TODO cycle 2 polish
                      }}
                      className="
                        border
                        px-5
                        py-2
                        rounded-lg
                        hover:bg-gray-50
                      "
                    >
                      View
                    </button>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}
