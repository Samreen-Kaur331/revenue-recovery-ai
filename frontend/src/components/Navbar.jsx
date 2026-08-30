import { Bell, Menu, Search } from "lucide-react";

function Navbar({ title, onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="rounded-xl border border-slate-200 p-2.5 text-slate-600 lg:hidden"
          >
            <Menu size={20} />
          </button>
          <div>
            <p className="text-xs font-medium text-slate-400">Revenue Recovery AI</p>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 sm:flex">
            <Search size={16} className="text-slate-400" />
            <span className="text-sm text-slate-400">AI powered analytics</span>
          </div>

          <button className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50">
            <Bell size={19} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-white" />
          </button>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
              AI
            </div>
            <div className="hidden xl:block">
              <p className="text-sm font-semibold text-slate-800">Admin</p>
              <p className="text-xs text-slate-400">Analytics</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;