"use client";

import { buildPublicRatingUrl } from "@/lib/codes";
import QRCode from "qrcode";
import { QRCodeSVG } from "qrcode.react";
import { FormEvent, useCallback, useEffect, useState } from "react";

type ClientRow = {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  uniqueCode: string;
  plan: string;
  status: string;
  publicUrl?: string;
  restaurants: Array<{ id: string; restaurantName: string; uniqueCode: string; googleReviewUrl: string }>;
  _count: { feedback: number; ratingEvents: number; scans: number };
};

export default function SuperAdminClientsPage() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    password: "",
    plan: "FREE",
    restaurantName: "",
    googleReviewUrl: "",
  });

  const load = useCallback(async () => {
    const res = await fetch("/api/super-admin/clients");
    const data = await res.json();
    if (res.ok) setClients(data.clients);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/super-admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(`Client created. QR link: ${data.client.publicUrl}`);
      setForm({
        businessName: "",
        ownerName: "",
        email: "",
        password: "",
        plan: "FREE",
        restaurantName: "",
        googleReviewUrl: "",
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create client");
    } finally {
      setLoading(false);
    }
  }

  async function toggleLock(client: ClientRow) {
    const next = client.status === "ACTIVE" ? "LOCKED" : "ACTIVE";
    await fetch(`/api/super-admin/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    await load();
  }

  async function downloadQr(url: string, name: string) {
    const dataUrl = await QRCode.toDataURL(url, { width: 512, margin: 2 });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${name}-qr.png`;
    a.click();
  }

  const filtered = clients.filter(
    (c) =>
      c.businessName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.uniqueCode.includes(search),
  );

  const appBase = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-amber-100">Manage clients</h2>
        <p className="text-sm text-zinc-400">Add businesses, generate unique QR codes, lock accounts</p>
      </header>

      <section className="card-surface rounded-2xl border border-amber-200/15 p-6">
        <h3 className="mb-4 font-semibold text-amber-100">Add new business</h3>
        <form className="grid gap-3 md:grid-cols-2" onSubmit={handleCreate}>
          {(
            [
              ["businessName", "Business name"],
              ["ownerName", "Owner name"],
              ["email", "Login email"],
              ["password", "Password"],
              ["restaurantName", "Restaurant / location name"],
              ["googleReviewUrl", "Google review URL"],
            ] as const
          ).map(([key, label]) => (
            <input
              key={key}
              value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              placeholder={label}
              type={key === "password" ? "password" : key === "googleReviewUrl" ? "url" : "text"}
              required={key !== "email" || true}
              className="input-field"
            />
          ))}
          <select
            value={form.plan}
            onChange={(e) => setForm((f) => ({ ...f, plan: e.target.value }))}
            className="input-field"
          >
            <option value="FREE">Free</option>
            <option value="STARTER">Starter</option>
            <option value="PRO">Pro</option>
            <option value="ENTERPRISE">Enterprise</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="gold-gradient rounded-xl py-3 font-semibold text-zinc-900 disabled:opacity-60 md:col-span-2 md:max-w-xs"
          >
            {loading ? "Creating..." : "Create client & QR"}
          </button>
        </form>
        {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
        {success && <p className="mt-3 text-sm text-green-300">{success}</p>}
      </section>

      <section>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clients..."
          className="input-field mb-4 max-w-md"
        />

        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((client) => {
            const restaurant = client.restaurants[0];
            const qrUrl =
              client.publicUrl ??
              (restaurant ? buildPublicRatingUrl(restaurant.uniqueCode, appBase) : "");
            return (
              <article key={client.id} className="card-surface rounded-2xl border border-amber-200/15 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-amber-100">{client.businessName}</h3>
                    <p className="text-xs text-zinc-500">
                      {client.ownerName} · {client.email}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Code: {client.uniqueCode} · {client.plan} ·{" "}
                      <span className={client.status === "ACTIVE" ? "text-green-400" : "text-red-400"}>
                        {client.status}
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleLock(client)}
                    className="rounded-lg border border-amber-300/30 px-2 py-1 text-xs text-amber-100"
                  >
                    {client.status === "ACTIVE" ? "Lock" : "Unlock"}
                  </button>
                </div>

                {restaurant && qrUrl && (
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="rounded-xl bg-white p-2">
                      <QRCodeSVG value={qrUrl} size={100} />
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="break-all text-xs text-zinc-400">{qrUrl}</p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => downloadQr(qrUrl, client.businessName)}
                          className="gold-gradient rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-900"
                        >
                          Download QR
                        </button>
                        <a
                          href={qrUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs text-zinc-300"
                        >
                          Open funnel
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex gap-4 text-xs text-zinc-500">
                  <span>{client._count.scans} scans</span>
                  <span>{client._count.ratingEvents} ratings</span>
                  <span>{client._count.feedback} feedback</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
