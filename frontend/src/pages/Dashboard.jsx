import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import RiskChart from "../components/RiskChart";
import FailureReasonChart from "../components/FailureReasonChart";
import PaymentMethodChart from "../components/PaymentMethodChart";
import Loading from "../components/Loading";
import {
  getDashboard,
  getFailureReasons,
  getPaymentMethods,
  getRecoveryResults,
} from "../services/api";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [failureReasons, setFailureReasons] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [dashboardData, failureData, methodData, resultsData] =
        await Promise.all([
          getDashboard(),
          getFailureReasons(),
          getPaymentMethods(),
          getRecoveryResults(),
        ]);

      setDashboard(dashboardData);
      setFailureReasons(failureData.failure_reasons || []);
      setPaymentMethods(methodData.payment_methods || []);
      setRecentResults((resultsData.results || []).slice(0, 6));
    } catch (err) {
      setError(err.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <Loading text="Loading revenue analytics..." />;

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-800">Dashboard could not load</h2>
        <p className="mt-1 text-sm text-red-600">{error}</p>
        <button
          onClick={loadData}
          className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    );
  }

  const money = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-900 p-6 text-white shadow-xl sm:p-8">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-indigo-100">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            AI Recovery Engine Active
          </div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Turn failed payments into recoverable revenue.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-indigo-100/75">
            Monitor payment failures, identify recovery opportunities and use ML-powered
            recommendations to prioritize your next action.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          type="failed"
          title="Total Failed Payments"
          value={dashboard.total_failed_payments}
          subtitle="Processed recovery records"
        />
        <StatCard
          type="risk"
          title="Revenue At Risk"
          value={money(dashboard.revenue_at_risk)}
          subtitle="Value linked to failed payments"
        />
        <StatCard
          type="recovered"
          title="Recovered Revenue"
          value={money(dashboard.recovered_revenue)}
          subtitle="Currently marked as recovered"
        />
        <StatCard
          type="rate"
          title="Recovery Rate"
          value={`${dashboard.recovery_rate}%`}
          subtitle="Recovered revenue / revenue at risk"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <RiskChart data={dashboard.risk_distribution || []} />
        <FailureReasonChart data={failureReasons} />
      </section>

      <PaymentMethodChart data={paymentMethods} />

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h3 className="font-semibold text-slate-900">Recent Recovery Results</h3>
            <p className="mt-1 text-xs text-slate-400">Latest ML decisions</p>
          </div>
          <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
            Latest 6
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Probability</th>
                <th className="px-5 py-3">Risk</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentResults.map((row) => (
                <tr key={row.result_id} className="border-t border-slate-100">
                  <td className="px-5 py-4 font-semibold text-slate-800">{row.payment_id}</td>
                  <td className="px-5 py-4 text-slate-600">{money(row.amount)}</td>
                  <td className="px-5 py-4 font-semibold text-slate-700">
                    {(Number(row.recovery_probability) * 100).toFixed(1)}%
                  </td>
                  <td className="px-5 py-4">
                    <RiskBadge risk={row.risk_level} />
                  </td>
                  <td className="px-5 py-4">
                    <ActionBadge action={row.recommended_action} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export function RiskBadge({ risk }) {
  const classes = {
    high: "bg-red-50 text-red-700 ring-red-600/10",
    medium: "bg-amber-50 text-amber-700 ring-amber-600/10",
    low: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${classes[risk] || "bg-slate-100 text-slate-600 ring-slate-500/10"}`}>
      {risk}
    </span>
  );
}

export function ActionBadge({ action }) {
  const classes = {
    retry: "bg-indigo-50 text-indigo-700",
    reminder: "bg-blue-50 text-blue-700",
    stop: "bg-slate-100 text-slate-600",
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${classes[action] || "bg-slate-100 text-slate-600"}`}>
      {action}
    </span>
  );
}

export default Dashboard;