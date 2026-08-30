import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#10b981",
};

function RiskChart({ data = [] }) {
  const chartData = data.map((item) => ({
    name: item.risk_level,
    value: Number(item.total),
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">Risk Distribution</h3>
          <p className="mt-1 text-xs text-slate-400">AI recovery opportunity by risk</p>
        </div>
        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
          {total} total
        </span>
      </div>

      <div className="relative mt-5 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={72}
              outerRadius={98}
              paddingAngle={4}
              stroke="none"
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={COLORS[entry.name] || "#6366f1"} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [value, "Payments"]} />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-900">{total}</span>
          <span className="text-xs text-slate-400">failed</span>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2">
        {["high", "medium", "low"].map((level) => {
          const item = chartData.find((x) => x.name === level);
          return (
            <div key={level} className="rounded-xl bg-slate-50 p-2.5 text-center">
              <div className="mx-auto mb-1.5 h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[level] }} />
              <p className="text-[11px] capitalize text-slate-400">{level}</p>
              <p className="text-sm font-bold text-slate-800">{item?.value || 0}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RiskChart;