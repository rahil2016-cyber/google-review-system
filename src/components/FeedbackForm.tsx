"use client";

import { LOW_RATING_REASONS } from "@/lib/constants";
import { FeedbackPayload, LowRatingReason } from "@/lib/types";
import { FormEvent, useState } from "react";

type FeedbackFormProps = {
  rating: number;
  onSubmit: (payload: FeedbackPayload) => Promise<void>;
};

export function FeedbackForm({ rating, onSubmit }: FeedbackFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState<LowRatingReason>("Service issue");
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await onSubmit({ rating, name, phone, email, reason, comments });
    } catch {
      setError("Could not submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <h2 className="text-xl font-semibold text-amber-100">Help us improve</h2>
      <input
        required
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Name"
        className="w-full rounded-xl border border-amber-300/20 bg-zinc-900/80 px-4 py-3 text-sm outline-none focus:border-amber-300"
      />
      <input
        required
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        placeholder="Phone"
        className="w-full rounded-xl border border-amber-300/20 bg-zinc-900/80 px-4 py-3 text-sm outline-none focus:border-amber-300"
      />
      <input
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Email (optional)"
        type="email"
        className="w-full rounded-xl border border-amber-300/20 bg-zinc-900/80 px-4 py-3 text-sm outline-none focus:border-amber-300"
      />
      <select
        value={reason}
        onChange={(event) => setReason(event.target.value as LowRatingReason)}
        className="w-full rounded-xl border border-amber-300/20 bg-zinc-900/80 px-4 py-3 text-sm outline-none focus:border-amber-300"
      >
        {LOW_RATING_REASONS.map((entry) => (
          <option key={entry} value={entry}>
            {entry}
          </option>
        ))}
      </select>
      <textarea
        value={comments}
        onChange={(event) => setComments(event.target.value)}
        placeholder="Comments"
        rows={4}
        className="w-full rounded-xl border border-amber-300/20 bg-zinc-900/80 px-4 py-3 text-sm outline-none focus:border-amber-300"
      />
      {error && <p className="text-sm text-red-300">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="gold-gradient w-full rounded-xl px-4 py-3 font-semibold text-zinc-900 transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {isSubmitting ? "Submitting..." : "Submit Feedback"}
      </button>
    </form>
  );
}
