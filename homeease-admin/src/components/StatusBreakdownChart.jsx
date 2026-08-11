import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Same hues as the Bookings status pills, one step saturated so the slices
// stay distinguishable against a white card. The pills use the -100/-200
// backgrounds; these are the matching -600 values.
const STATUS_SEGMENTS = [
  { key: "pending",    label: "Pending",     color: "#4b5563" }, // gray-600
  { key: "accepted",   label: "Accepted",    color: "#0d9488" }, // teal-600
  { key: "inProgress", label: "In Progress", color: "#ca8a04" }, // yellow-600
  { key: "completed",  label: "Completed",   color: "#16a34a" }, // green-600
  { key: "cancelled",  label: "Cancelled",   color: "#dc2626" }, // red-600
];

export default function StatusBreakdownChart({
  stats,
}) {

  const data = STATUS_SEGMENTS.map((segment) => ({
    name: segment.label,
    value: Number(stats?.[segment.key]) || 0,
    color: segment.color,
  }));

  const total = data.reduce(
    (sum, entry) => sum + entry.value,
    0
  );

  return (
    <div
      className="
        bg-white
        rounded-2xl
        border
        border-gray-200
        p-6
      "
    >

      <h2 className="text-2xl font-bold mb-6">
        Booking Status
      </h2>

      {total === 0 ? (

        <p className="text-gray-500 text-center py-20">
          No bookings yet.
        </p>

      ) : (

        <ResponsiveContainer
          width="100%"
          height={300}
        >

          <PieChart>

            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={2}
            >

              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.color}
                />
              ))}

            </Pie>

            <Tooltip />

            <Legend />

          </PieChart>

        </ResponsiveContainer>

      )}

    </div>
  );
}
