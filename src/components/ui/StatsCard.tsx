type StatsCardProps = {
  label: string;
  value: string | number;
  hint?: string;
};

export function StatsCard({ label, value, hint }: StatsCardProps) {
  return (
    <div className="card-surface rounded-2xl border border-amber-200/15 p-5 transition hover:border-amber-300/30">
      <p className="text-xs uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-amber-100">{value}</p>
      {hint && <p className="mt-1 text-xs text-zinc-400">{hint}</p>}
    </div>
  );
}
