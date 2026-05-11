import { ArrowRight, DatabaseZap, Lock, UserRound } from "lucide-react";
import { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

export function Login() {
  const navigate = useNavigate();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate("/dashboard");
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-trace-bg px-4 py-10 text-slate-100">
      <div className="absolute inset-0">
        <div className="absolute left-[8%] top-[12%] h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute bottom-[12%] right-[10%] h-96 w-96 rounded-full bg-blue-600/15 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      <section className="glass-panel relative w-full max-w-5xl overflow-hidden rounded-3xl">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="hidden min-h-[620px] border-r border-white/10 p-10 lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-blue-500 text-slate-950 shadow-glow">
                  <DatabaseZap className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold tracking-tight text-white">Data Pulse</p>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">Data RCA Platform</p>
                </div>
              </div>
              <div className="mt-16 max-w-md">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200">AI-powered investigation workspace</p>
                <h1 className="mt-4 text-5xl font-extrabold leading-tight tracking-tight text-white">
                  Trace data issues from source to CSRTB.
                </h1>
                <p className="mt-5 text-base leading-7 text-slate-300">
                  A frontend prototype for intake, lineage review, SQL inspection, RCA summaries, and simulated assistant analysis.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {["SQL Trace", "Lineage", "RCA"].map((item) => (
                <div key={item} className="rounded-2xl border border-cyan-300/15 bg-cyan-400/10 p-4 text-center text-sm font-semibold text-cyan-100">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <div className="mb-9 flex items-center gap-3 lg:hidden">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-blue-500 text-slate-950">
                <DatabaseZap className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white">Data Pulse</p>
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">RCA Console</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Secure workspace</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">Sign in to Data Pulse</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">Use any demo credentials to enter the frontend prototype.</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-9 space-y-5">
              <label className="block">
                <span className="text-sm font-semibold text-slate-300">Username</span>
                <span className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition focus-within:border-cyan-300/50 focus-within:shadow-glow">
                  <UserRound className="h-5 w-5 text-cyan-200" />
                  <input className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-600" placeholder="dwh.analyst" />
                </span>
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-300">Password</span>
                <span className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition focus-within:border-cyan-300/50 focus-within:shadow-glow">
                  <Lock className="h-5 w-5 text-cyan-200" />
                  <input type="password" className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-600" placeholder="••••••••" />
                </span>
              </label>
              <button className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-5 py-3.5 font-bold text-slate-950 shadow-glow-blue transition hover:-translate-y-0.5 hover:shadow-glow">
                Enter RCA Console
                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
