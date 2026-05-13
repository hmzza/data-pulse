import { ArrowRight, Lock, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function Login() {
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login({ username, password });
      navigate(location.state?.from || "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  if (!authLoading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-trace-bg px-4 py-10 text-slate-100">
      <div className="absolute inset-0">
        <div className="absolute left-[8%] top-[12%] h-80 w-80 rounded-full bg-pink-500/15 blur-3xl" />
        <div className="absolute bottom-[12%] right-[10%] h-96 w-96 rounded-full bg-fuchsia-600/15 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      <section className="glass-panel relative w-full max-w-5xl overflow-hidden rounded-3xl">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="hidden min-h-[620px] border-r border-white/10 p-10 lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <img src="/data-pulse-logo.png" alt="Data Pulse logo" className="h-16 w-16 object-contain drop-shadow-[0_0_24px_rgba(236,72,153,0.48)]" />
                <div>
                  <p className="text-2xl font-extrabold tracking-tight text-white">Data Pulse</p>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-pink-300/80">Data RCA Platform</p>
                </div>
              </div>
              <div className="mt-16 max-w-md">
                <img
                  src="/data-pulse-logo.png"
                  alt="Data Pulse logo"
                  className="mx-auto mb-8 h-64 w-full max-w-sm object-contain object-center drop-shadow-[0_0_38px_rgba(236,72,153,0.38)]"
                />
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-pink-200">AI-powered investigation workspace</p>
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
                <div key={item} className="rounded-2xl border border-pink-300/20 bg-[#8f0054]/35 p-4 text-center text-sm font-semibold text-pink-50 shadow-[0_0_24px_rgba(176,0,98,0.12)]">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <div className="mb-9 flex items-center gap-3 lg:hidden">
              <img src="/data-pulse-logo.png" alt="Data Pulse logo" className="h-12 w-12 object-contain drop-shadow-[0_0_20px_rgba(236,72,153,0.45)]" />
              <div>
                <p className="text-2xl font-extrabold text-white">Data Pulse</p>
                <p className="text-xs uppercase tracking-[0.24em] text-pink-300">RCA Console</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-pink-200">Secure workspace</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">Sign in to Data Pulse</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">Use a local account created by the super admin. Default seeded super admin comes from your backend environment.</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-9 space-y-5">
              {error ? <div className="rounded-2xl border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</div> : null}
              <label className="block">
                <span className="text-sm font-semibold text-slate-300">Username</span>
                <span className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition focus-within:border-pink-300/50 focus-within:shadow-glow">
                  <UserRound className="h-5 w-5 text-pink-200" />
                  <input value={username} onChange={(event) => setUsername(event.target.value)} className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-600" placeholder="superadmin" />
                </span>
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-300">Password</span>
                <span className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition focus-within:border-pink-300/50 focus-within:shadow-glow">
                  <Lock className="h-5 w-5 text-pink-200" />
                  <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-600" placeholder="••••••••" />
                </span>
              </label>
              <button disabled={loading} className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[#b00062] px-5 py-3.5 font-bold text-white shadow-[0_0_32px_rgba(176,0,98,0.34)] transition hover:-translate-y-0.5 hover:bg-[#c01878] hover:shadow-[0_0_42px_rgba(176,0,98,0.45)] disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? "Signing In..." : "Enter RCA Console"}
                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
