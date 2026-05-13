import {
  BarChart3,
  Bell,
  BrainCircuit,
  FileClock,
  FileCode2,
  LayoutDashboard,
  Menu,
  PlusCircle,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Reports", to: "/reports", icon: FileCode2 },
  { label: "New Investigation", to: "/new", icon: PlusCircle },
  { label: "RCA Result", to: "/result/RCA-1048", icon: BrainCircuit },
  { label: "History", to: "/history", icon: FileClock },
];

export function AppLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-trace-bg text-slate-100">
      <div className="pointer-events-none fixed inset-0 opacity-70">
        <div className="absolute left-[14%] top-10 h-64 w-64 rounded-full bg-pink-500/10 blur-3xl" />
        <div className="absolute right-[10%] top-20 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-[45%] h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-white/10 bg-slate-950/80 px-4 py-5 backdrop-blur-2xl transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/data-pulse-logo.png" alt="Data Pulse logo" className="h-12 w-12 object-contain drop-shadow-[0_0_20px_rgba(236,72,153,0.45)]" />
            <div>
              <p className="text-xl font-extrabold tracking-tight text-white">Data Pulse</p>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-pink-300/70">RCA Console</p>
            </div>
          </div>
          <button className="rounded-xl p-2 text-slate-300 hover:bg-white/10 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-9 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-pink-400/12 text-pink-100 shadow-glow"
                    : "text-slate-400 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-5 left-4 right-4 rounded-2xl border border-pink-300/15 bg-pink-300/10 p-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-pink-200" />
            <div>
              <p className="text-sm font-semibold text-white">Mock Mode Active</p>
              <p className="text-xs text-slate-400">Frontend-only demo data</p>
            </div>
          </div>
        </div>
      </aside>

      {open ? <button className="fixed inset-0 z-30 bg-slate-950/70 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu overlay" /> : null}

      <div className="relative z-10 lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/60 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <button className="rounded-xl border border-white/10 p-2 text-slate-200 lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">
                <Menu className="h-5 w-5" />
              </button>
              <div className="hidden min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-400 md:flex">
                <Search className="h-4 w-4 text-pink-200" />
                <span className="truncate">Search customer, report, investigation ID...</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-100 sm:flex">
                <span className="h-2 w-2 animate-soft-pulse rounded-full bg-emerald-300" />
                Analysis Engine Ready
              </div>
              <button className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-200 transition hover:border-pink-300/30 hover:text-pink-100" aria-label="Notifications">
                <Bell className="h-5 w-5" />
              </button>
              <img src="/data-pulse-logo.png" alt="Data Pulse" className="h-10 w-10 object-contain drop-shadow-[0_0_18px_rgba(236,72,153,0.42)]" />
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
