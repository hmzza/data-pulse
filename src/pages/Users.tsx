import { AlertCircle, CheckCircle2, Loader2, RefreshCw, Search, ShieldCheck, Trash2, UserCog, X } from "lucide-react";
import { FormEvent, useDeferredValue, useEffect, useState } from "react";
import { createUser, deleteUser, listUsers, updateUser } from "../api/client";
import type { User } from "../api/types";
import { SectionPanel } from "../components/SectionPanel";

const initialForm = {
  username: "",
  fullName: "",
  password: "",
  role: "analyst" as User["role"],
  isActive: true,
};

export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState(initialForm);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"All" | User["role"]>("All");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    void refreshUsers();
  }, []);

  async function refreshUsers() {
    setLoading(true);
    try {
      setUsers(await listUsers());
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const user = await createUser(form);
      setForm(initialForm);
      await refreshUsers();
      setMessage(`User created: ${user.username}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create user.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(user: User) {
    setError("");
    setMessage("");
    try {
      await updateUser(user.id, { isActive: !user.isActive });
      await refreshUsers();
      setMessage(`User ${user.username} ${user.isActive ? "disabled" : "enabled"}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update user.");
    }
  }

  async function resetPassword(user: User) {
    const nextPassword = window.prompt(`Set a new password for ${user.username}:`, "");
    if (!nextPassword) return;

    setError("");
    setMessage("");
    try {
      await updateUser(user.id, { password: nextPassword });
      setMessage(`Password updated for ${user.username}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update password.");
    }
  }

  async function handleDelete(user: User) {
    if (!window.confirm(`Delete ${user.username}?`)) return;

    setError("");
    setMessage("");
    try {
      await deleteUser(user.id);
      await refreshUsers();
      setMessage(`User deleted: ${user.username}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete user.");
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesQuery = `${user.username} ${user.fullName} ${user.role}`.toLowerCase().includes(deferredQuery.toLowerCase());
    const matchesRole = roleFilter === "All" || user.role === roleFilter;
    return matchesQuery && matchesRole;
  });

  return (
    <div className="space-y-6">
      {(message || error) && (
        <div className="fixed right-4 top-24 z-50 w-[calc(100vw-2rem)] max-w-md">
          <div className={`glass-panel rounded-2xl border p-4 shadow-2xl ${error ? "border-rose-300/30 bg-rose-950/90 text-rose-50" : "border-emerald-300/30 bg-emerald-950/90 text-emerald-50"}`}>
            <div className="flex items-start gap-3">
              {error ? <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-200" /> : <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-200" />}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">{error ? "Action failed" : "Action completed"}</p>
                <p className="mt-1 text-sm leading-6 opacity-90">{error || message}</p>
              </div>
              <button onClick={() => { setError(""); setMessage(""); }} className="rounded-lg p-1 text-white/70 transition hover:bg-white/10 hover:text-white" aria-label="Dismiss notification">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-pink-300/80">Super admin</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">User Management</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">Create accounts, activate or disable access, and manage local test users.</p>
        </div>
        <button onClick={refreshUsers} className="flex items-center gap-2 rounded-2xl border border-pink-300/20 bg-pink-400/10 px-4 py-3 text-sm font-semibold text-pink-100 transition hover:bg-pink-400/15">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Users
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <SectionPanel title="Create Account" eyebrow="Local access">
          <form onSubmit={handleCreate} className="space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-300">Username</span>
              <input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-slate-100 outline-none transition focus:border-pink-300/50 focus:shadow-glow" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-300">Full Name</span>
              <input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-slate-100 outline-none transition focus:border-pink-300/50 focus:shadow-glow" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-300">Password</span>
              <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-slate-100 outline-none transition focus:border-pink-300/50 focus:shadow-glow" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-300">Role</span>
                <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as User["role"] })} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-slate-100 outline-none transition focus:border-pink-300/50 focus:shadow-glow">
                  <option value="analyst">Analyst</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </label>
              <label className="mt-8 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                <input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />
                Active user
              </label>
            </div>
            <button className="flex items-center justify-center gap-2 rounded-2xl bg-[#b00062] px-5 py-3 text-sm font-bold text-white shadow-[0_0_28px_rgba(176,0,98,0.28)] transition hover:-translate-y-0.5 hover:bg-[#c01878]">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCog className="h-4 w-4" />}
              Create User
            </button>
          </form>
        </SectionPanel>

        <SectionPanel title="Accounts" eyebrow={`${users.length} total`}>
          <div className="mb-5 grid gap-3 md:grid-cols-[1fr_220px]">
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 transition focus-within:border-pink-300/50">
              <Search className="h-5 w-5 text-pink-200" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-600" placeholder="Search username, name, role..." />
            </label>
            <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as "All" | User["role"])} className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm font-semibold text-slate-100 outline-none transition focus:border-pink-300/50">
              <option value="All">All roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="analyst">Analyst</option>
            </select>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-slate-400">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">No users match the current filters.</div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div key={user.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white">{user.fullName}</p>
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${user.role === "super_admin" ? "border-pink-300/25 bg-pink-400/10 text-pink-100" : "border-slate-300/15 bg-white/5 text-slate-200"}`}>{user.role === "super_admin" ? "Super Admin" : "Analyst"}</span>
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${user.isActive ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-100" : "border-amber-300/25 bg-amber-400/10 text-amber-100"}`}>{user.isActive ? "Active" : "Disabled"}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-400">@{user.username}</p>
                      <p className="mt-2 text-xs text-slate-500">Created {new Date(user.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => toggleActive(user)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-pink-300/30 hover:text-pink-100">
                        {user.isActive ? "Disable" : "Enable"}
                      </button>
                      <button onClick={() => resetPassword(user)} className="rounded-xl border border-pink-300/20 bg-pink-400/10 px-3 py-2 text-sm font-semibold text-pink-100 transition hover:bg-pink-400/15">
                        Reset Password
                      </button>
                      <button onClick={() => handleDelete(user)} className="rounded-xl border border-rose-300/20 bg-rose-400/10 px-3 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/15">
                        <span className="inline-flex items-center gap-2"><Trash2 className="h-4 w-4" />Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionPanel>
      </div>

      <div className="rounded-2xl border border-pink-300/15 bg-pink-400/10 p-4 text-sm leading-6 text-pink-50">
        Default seeded local super admin comes from `.env` or `.env.example` using `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `ADMIN_FULL_NAME`.
      </div>
    </div>
  );
}
