const ROLE_FILTERS = [
  { label: "All", value: "" },
  { label: "Customer", value: "CUSTOMER" },
  { label: "Provider", value: "PROVIDER" },
  { label: "Admin", value: "ADMIN" },
];

export default function RoleFilterChips({
  selectedRole,
  onSelectRole,
}) {
  return (
    <div className="flex flex-wrap gap-3 mb-8">

      {ROLE_FILTERS.map((filter) => (

        <button
          key={filter.label}
          onClick={() =>
            onSelectRole(filter.value)
          }
          className={`
            px-6
            py-3
            rounded-full
            border
            transition

            ${
              selectedRole === filter.value
                ? "bg-teal-700 text-white"
                : "bg-white text-gray-700"
            }
          `}
        >
          {filter.label}
        </button>

      ))}

    </div>
  );
}
