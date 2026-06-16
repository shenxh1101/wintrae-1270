import type { ThemeId } from "@/lib/levels";
import { THEMES, levelsByTheme } from "@/lib/levels";
import type { PlayerProgress } from "@/lib/storage";
import { isLevelUnlocked } from "@/lib/store";
import LevelNode from "@/components/layout/LevelNode";

interface Props {
  theme: ThemeId;
  progress: PlayerProgress;
}

const THEME_ACCENT: Record<ThemeId, string> = {
  kitchen: "from-tomato/20 to-tomato/5",
  numberline: "from-sky/20 to-sky/5",
  puzzle: "from-basil/20 to-basil/5",
};

const THEME_HEADER: Record<ThemeId, string> = {
  kitchen: "bg-tomato",
  numberline: "bg-sky",
  puzzle: "bg-basil",
};

export default function IslandCard({ theme, progress }: Props) {
  const meta = THEMES[theme];
  const levels = levelsByTheme(theme);
  const totalStars = levels.reduce((s, l) => s + (progress.levels[l.id]?.stars ?? 0), 0);
  const maxStars = levels.length * 3;

  return (
    <div className={`relative overflow-hidden rounded-blob bg-gradient-to-b ${THEME_ACCENT[theme]} p-5 shadow-sticker`}>
      <div className="mb-4 flex items-center gap-3">
        <div className={`grid h-14 w-14 place-items-center rounded-2xl text-3xl text-white shadow-stickerSm ${THEME_HEADER[theme]}`}>
          {meta.emoji}
        </div>
        <div className="flex-1">
          <div className="font-kid text-xl text-ink">{meta.name}</div>
          <div className="text-xs text-inkSoft">{meta.subtitle}</div>
        </div>
        <div className="rounded-full bg-paper px-3 py-1 text-sm font-bold text-ink shadow-stickerSm">
          ⭐ {totalStars}/{maxStars}
        </div>
      </div>

      <div className="relative flex items-start justify-between px-2 pb-2">
        {levels.map((level, i) => (
          <div key={level.id} className="relative flex flex-1 justify-center">
            {i < levels.length - 1 && (
              <div className="absolute left-1/2 top-8 z-0 h-0.5 w-full border-t-2 border-dashed border-dough/40" />
            )}
            <div className="relative z-10">
              <LevelNode
                level={level}
                theme={theme}
                unlocked={isLevelUnlocked(progress, level.id)}
                stars={progress.levels[level.id]?.stars ?? 0}
                index={i}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
