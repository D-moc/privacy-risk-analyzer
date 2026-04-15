import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

function InsightsGraph({ data }) {

  // 🔥 Convert backend clauses → chart data
  const chartData = data
    ? Object.keys(data).map((key) => ({
        name: key.replace("_", " ").toUpperCase(),
        value: data[key]?.length || 0,
      }))
    : [];

  return (
    <div className="w-full h-64">

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>

          {/* GRID */}
          <CartesianGrid strokeDasharray="3 3" />

          {/* AXES */}
          <XAxis dataKey="name" />
          <YAxis />

          {/* TOOLTIP */}
          <Tooltip />

          {/* BAR */}
          <Bar
            dataKey="value"
            fill="#2563eb"
            radius={[8, 8, 0, 0]}
          />

        </BarChart>
      </ResponsiveContainer>

    </div>
  );
}

export default InsightsGraph;