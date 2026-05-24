"use client";

import { STAR_EMOJIS } from "@/lib/constants";
import { useMemo, useState } from "react";

type StarRatingProps = {
  onSelect: (rating: number) => void;
  selected?: number;
  disabled?: boolean;
};

export function StarRating({ onSelect, selected, disabled }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const activeRating = hovered ?? selected ?? 0;
  const activeEmoji = useMemo(
    () => (activeRating > 0 ? STAR_EMOJIS[activeRating - 1] : "✨"),
    [activeRating]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: 5 }, (_, index) => {
          const value = index + 1;
          const isActive = value <= activeRating;
          return (
            <button
              key={value}
              type="button"
              aria-label={`Rate ${value} out of 5`}
              onMouseEnter={() => setHovered(value)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => !disabled && onSelect(value)}
              disabled={disabled}
              className={`text-4xl transition-all duration-200 md:text-5xl disabled:cursor-not-allowed disabled:opacity-50 ${
                isActive ? "scale-110 text-amber-300" : "text-zinc-500 hover:text-amber-200"
              }`}
            >
              ★
            </button>
          );
        })}
      </div>
      <p className="text-center text-3xl">{activeEmoji}</p>
    </div>
  );
}
