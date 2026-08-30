import { ArrowUpRight, CircleDollarSign, Gauge, RotateCcw, TriangleAlert } from "lucide-react";

const icons = {
  failed: TriangleAlert,
  risk: CircleDollarSign,
  recovered: RotateCcw,
  rate: Gauge,
};

function StatCard({ type, title, value, subtitle }) {
  const Icon = icons[type] || Gauge;

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Icon size={21} />
        </div>
        <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
          <ArrowUpRight size={13} />
          Live
        </div>
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
      <p className="mt-2 text-xs text-slate-400">{subtitle}</p>
    </div>
  );
}

export default StatCard;