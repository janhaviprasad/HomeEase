import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
  ResponsiveContainer,
} from "recharts";

import { formatCurrency } from "../utils/format";

export default function PopularServicesChart({
  services,
}) {

  // The endpoint name implies ranked output but the contract does not
  // guarantee it, so sort defensively. category_name is snake_case while
  // bookingCount is camelCase — see analyticsApi.js.
  const data = [...services]
    .map((service) => ({
      name: service.category_name,
      bookings:
        Number(service.bookingCount) || 0,
      revenue: Number(service.revenue) || 0,
    }))
    .sort((a, b) => b.bookings - a.bookings);

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
        Popular Services
      </h2>

      {data.length === 0 ? (

        <p className="text-gray-500 text-center py-20">
          No service data.
        </p>

      ) : (

        <ResponsiveContainer
          width="100%"
          height={300}
        >

          <BarChart
            data={data}
            layout="vertical"
            margin={{
              top: 5,
              right: 90,
              bottom: 5,
              left: 5,
            }}
          >

            <XAxis type="number" hide />

            <YAxis
              type="category"
              dataKey="name"
              width={130}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip />

            <Bar
              dataKey="bookings"
              fill="#0f766e"
              radius={[0, 6, 6, 0]}
              barSize={26}
            >

              <LabelList
                dataKey="revenue"
                position="right"
                fill="#6b7280"
                formatter={(value) =>
                  formatCurrency(value)
                }
              />

            </Bar>

          </BarChart>

        </ResponsiveContainer>

      )}

    </div>
  );
}
