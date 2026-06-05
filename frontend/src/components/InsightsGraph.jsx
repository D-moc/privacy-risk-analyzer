import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function InsightsGraph({ data }) {
  const chartData = data
    ? Object.keys(data).map((key) => ({
        name: key,
        value:
          typeof data[key] === "number"
            ? data[key]
            : Array.isArray(data[key])
            ? data[key].length
            : 0,
      }))
    : [];

  return (
    <div className="w-full h-80 min-h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 10,
            right: 20,
            left: 0,
            bottom: 40,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="name"
            angle={-20}
            textAnchor="end"
            interval={0}
            height={60}
            tick={{ fontSize: 12 }}
          />

          <YAxis domain={[0, 100]} />

          <Tooltip
            formatter={(value) => [
              `${value}`,
              "Score",
            ]}
          />

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