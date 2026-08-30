import {
  BarChart3,
  BrainCircuit,
  ChevronRight,
  LayoutDashboard,
  X,
  Zap,
} from "lucide-react";

const items = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "predictions", label: "AI Prediction", icon: BrainCircuit },
  { id: "results", label: "Recovery Results", icon: BarChart3 },
];

function Sidebar({ activePage, setActivePage, open, setOpen }) {
  const content = (
    <div className="flex h-full flex-col bg-slate-950 text-white">
      <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/30">
            <Zap size={21} fill="currentColor" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide">Revenue</p>
            <p className="text-xs text-slate-400">Recovery AI</p>
          </div>
        </div>
        <button
          className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
          onClick={() => setOpen(false)}
        >
          <X size={20} />
        </button>
      </div>

      <div className="px-4 py-7">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Workspace
        </p>

        <nav className="space-y-1.5">
          {items.map((item) => {
            const Icon = item.icon;
            const active = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setOpen(false);
                }}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                  active
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-950/30"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={19} />
                <span className="flex-1">{item.label}</span>
                <ChevronRight
                  size={16}
                  className={`transition ${active ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`}
                />
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/40" />
            <span className="text-xs font-medium text-emerald-300">System Online</span>
          </div>
          <p className="text-xs leading-5 text-slate-400">
            ML engine and recovery APIs are connected.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 lg:block">
        {content}
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {content}
      </aside>
    </>
  );
}

export default Sidebar;