type RatingChartProps = {
  distribution: { star: number; count: number }[];
};

export function RatingChart({ distribution }: RatingChartProps) {
  const max = Math.max(...distribution.map((d) => d.count), 1);

  return (
    <div className="card-surface rounded-2xl border border-amber-200/15 p-5">
      <h3 className="mb-4 text-sm font-semibold text-amber-100">Rating distribution</h3>
      <div className="space-y-3">
        {distribution
          .slice()
          .reverse()
          .map((item) => (
            <div key={item.star} className="flex items-center gap-3 text-sm">
              <span className="w-8 text-zinc-400">{item.star}★</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="gold-gradient h-full rounded-full transition-all duration-500"
                  style={{ width: `${(item.count / max) * 100}%` }}
                />
              </div>
              <span className="w-8 text-right text-zinc-300">{item.count}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
