import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function FailureReasonChart({ data = [] }) {
  const chartData = data.map((item) => ({
    reason: String(item.failure_reason || "").replaceAll("_", " "),
    total: Number(item.total_payments),
  }));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="font-semibold text-slate-900">Failure Reasons</h3>
        <p className="mt-1 text-xs text-slate-400">Most common causes of failed payments</p>
      </div>

      <div className="mt-6 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
            <XAxis type="number" axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="reason"
              width={118}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickFormatter={(value) =>
                value.length > 17 ? `${value.slice(0, 17)}…` : value
              }
            />
            <Tooltip />
            <Bar dataKey="total" fill="#6366f1" radius={[0, 7, 7, 0]} barSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default FailureReasonChart;