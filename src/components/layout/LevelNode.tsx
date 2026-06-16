import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { motion } from "framer-motion";
import type { Level, ThemeId } from "@/lib/levels";
import StarRow from "@/components/ui/StarRow";
import { cn } from "@/lib/utils";

interface Props {
  level: Level;
  theme: ThemeId;
  unlocked: boolean;
  stars: number;
  index: number;
}

const THEME_BG: Record<ThemeId, string> = {
  kitchen: "bg-tomato",
  numberline: "bg-sky",
  puzzle: "bg-basil",
};

const THEME_RING: Record<ThemeId, string> = {
  kitchen: "ring-tomato/30",
  numberline: "ring-sky/30",
  puzzle: "ring-basil/30",
};

export default function LevelNode({ level, theme, unlocked, stars, index }: Props) {
  const path = `/play/${theme}/${level.id}`;
  const inner = (
    <motion.div
      className="flex flex-col items-center gap-1.5"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 220, damping: 18 }}
      whileHover={unlocked ? { y: -4 } : undefined}
    >
      <div
        className={cn(
          "relative grid h-16 w-16 place-items-center rounded-full font-display text-2xl font-bold text-white shadow-stickerSm ring-4",
          unlocked ? THEME_BG[theme] : "bg-dough/40 text-inkSoft",
          unlocked ? THEME_RING[theme] : "ring-transparent",
        )}
      >
        {unlocked ? level.order : <Lock size={22} />}
        {unlocked && stars > 0 && (
          <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-cheese text-xs font-bold text-ink shadow-stickerSm">
            {stars}
          </span>
        )}
      </div>
      <div className="max-w-[5rem] text-center text-xs font-medium leading-tight text-ink">
        {level.title}
      </div>
      <StarRow value={stars} size={12} />
    </motion.div>
  );

  if (!unlocked) {
    return <div className="cursor-not-allowed opacity-80">{inner}</div>;
  }
  return (
    <Link to={path} className="block">
      {inner}
    </Link>
  );
}
