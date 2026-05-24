"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Login failed");

      router.push(data.role === "SUPER_ADMIN" ? "/super-admin" : "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-8">
      <section className="card-surface w-full rounded-3xl border border-amber-200/20 p-8 shadow-2xl">
        <p className="text-xs uppercase tracking-widest text-amber-400/80">Review Funnel SaaS</p>
        <h1 className="mt-2 text-3xl font-bold text-amber-100">Sign in</h1>
        <p className="mt-2 text-sm text-zinc-400">Super admin or business owner account</p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="input-field"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="input-field"
          />
          {error && <p className="text-sm text-red-300">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="gold-gradient w-full rounded-xl py-3 font-semibold text-zinc-900 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-6 rounded-xl border border-amber-200/10 bg-zinc-900/50 p-4 text-xs text-zinc-500">
          <p className="font-medium text-zinc-400">Demo credentials (after seed):</p>
          <p className="mt-1">Super admin: admin@reviewfunnel.com / Admin@12345</p>
          <p>Business: demo@business.com / Demo@12345</p>
        </div>
      </section>
    </main>
  );
}
