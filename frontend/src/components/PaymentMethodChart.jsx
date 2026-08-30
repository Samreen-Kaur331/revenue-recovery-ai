import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function PaymentMethodChart({ data = [] }) {
  const chartData = data.map((item) => ({
    method: item.payment_method,
    payments: Number(item.total_payments),
    amount: Number(item.total_amount || 0),
  }));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">Payment Methods</h3>
          <p className="mt-1 text-xs text-slate-400">Failed payment volume by method</p>
        </div>
        <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
          Amount at risk
        </span>
      </div>

      <div className="mt-6 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ left: 0, right: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="method" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(value, name) =>
                name === "amount"
                  ? [`₹${Number(value).toLocaleString()}`, "Amount"]
                  : [value, "Payments"]
              }
            />
            <Bar dataKey="amount" fill="#8b5cf6" radius={[7, 7, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default PaymentMethodChart;