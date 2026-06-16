import type { Fraction } from "@/lib/fraction";
import { simplify } from "@/lib/fraction";
import { cn } from "@/lib/utils";

interface Props {
  fraction: Fraction;
  simplify?: boolean;
  color?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
}

const SIZE_MAP = {
  sm: { box: "min-w-[56px] px-3 py-2", num: "text-xl", bar: "w-7", den: "text-xl" },
  md: { box: "min-w-[76px] px-4 py-3", num: "text-3xl", bar: "w-10", den: "text-3xl" },
  lg: { box: "min-w-[100px] px-5 py-4", num: "text-4xl", bar: "w-12", den: "text-4xl" },
} as const;

const COLOR_BG: Record<string, string> = {
  tomato: "bg-tomato/15 border-tomato/40 text-ink",
  cheese: "bg-cheese/20 border-cheese/50 text-ink",
  basil: "bg-basil/15 border-basil/40 text-ink",
  sky: "bg-sky/15 border-sky/40 text-ink",
  plum: "bg-plum/15 border-plum/40 text-ink",
  dough: "bg-dough/15 border-dough/40 text-ink",
  cream: "bg-cream border-dough/30 text-ink",
};

export default function FractionCard({
  fraction,
  simplify: doSimplify = false,
  color = "cheese",
  size = "md",
  className,
  onClick,
  selected = false,
  disabled = false,
}: Props) {
  const f = doSimplify ? simplify(fraction) : fraction;
  const s = SIZE_MAP[size];
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={cn(
        "no-select inline-flex flex-col items-center justify-center rounded-2xl border-2 border-dashed font-display font-semibold shadow-stickerSm transition-all",
        s.box,
        COLOR_BG[color] ?? COLOR_BG.cheese,
        onClick && !disabled && "cursor-pointer hover:-translate-y-0.5 hover:shadow-sticker",
        selected && "ring-4 ring-cheese/60 scale-105",
        disabled && "opacity-50",
        className,
      )}
    >
      <span className={cn(s.num, "leading-none")}>{f.num}</span>
      <span className={cn(s.bar, "h-[3px] my-1 rounded-full bg-ink/70")} />
      <span className={cn(s.den, "leading-none")}>{f.den}</span>
    </div>
  );
}
