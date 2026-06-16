import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { useGameStore, totalStars } from "@/lib/store";
import { LEVELS, THEMES, ERROR_TYPE_LABELS } from "@/lib/levels";
import { BADGES } from "@/lib/badges";
import { CONCEPT_LIST } from "@/lib/concepts";
import { reviewTopErrorTypes } from "@/lib/review";
import StarRow from "@/components/ui/StarRow";
import StickerButton from "@/components/ui/StickerButton";
import { useSpeak } from "@/hooks/useSpeak";
import { cn } from "@/lib/utils";

const STATUS_TAG: Record<string, { label: string; cls: string }> = {
  mastered: { label: "已掌握", cls: "bg-basil text-white" },
  practicing: { label: "练习中", cls: "bg-cheese text-ink" },
  untouched: { label: "未接触", cls: "bg-dough/20 text-inkSoft" },
};

export default function Rewards() {
  const progress = useGameStore((s) => s.progress);
  const speak = useSpeak();
  const stars = totalStars(progress);
  const unlockedBadges = BADGES.filter((b) => progress.badges[b.id]?.unlocked).length;
  const topErrors = reviewTopErrorTypes(progress.errors, 3);
  const hasErrors = topErrors.length > 0;

  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl px-4 py-5 sm:px-6">
      <header className="mb-6 flex items-center justify-between gap-3">
        <Link to="/" className="sticker-btn bg-cream px-4 py-2 text-sm shadow-stickerSm hover:-translate-y-0.5">
          <ArrowLeft size={18} /> 地图
        </Link>
        <h1 className="font-kid text-2xl text-ink">🏅 奖励收藏册</h1>
        <div className="w-20" />
      </header>

      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card-paper flex items-center gap-4 p-5">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-cheese text-3xl shadow-stickerSm">⭐</div>
          <div>
            <div className="font-display text-4xl font-bold text-ink">{stars}</div>
            <div className="text-xs text-inkSoft">累计星星</div>
          </div>
        </motion.div>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.08 }} className="card-paper flex items-center gap-4 p-5">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-plum text-3xl text-white shadow-stickerSm">🏅</div>
          <div>
            <div className="font-display text-4xl font-bold text-ink">{unlockedBadges}/{BADGES.length}</div>
            <div className="text-xs text-inkSoft">已解锁徽章</div>
          </div>
        </motion.div>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.16 }} className="card-paper flex items-center gap-4 p-5">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-basil text-3xl text-white shadow-stickerSm">🎓</div>
          <div>
            <div className="font-display text-4xl font-bold text-ink">
              {Object.values(progress.concepts).filter((c) => c.status === "mastered").length}
            </div>
            <div className="text-xs text-inkSoft">已掌握知识点</div>
          </div>
        </motion.div>
      </section>

      <section className="mb-6">
        <div className="card-paper overflow-hidden">
          <div className="flex items-center gap-3 bg-gradient-to-r from-tomato/10 to-cheese/10 p-4">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-tomato/15 text-2xl">📝</div>
            <div className="flex-1">
              <h2 className="font-kid text-lg text-ink">错题小练习</h2>
              <p className="text-xs text-inkSoft">针对常错题型练一练，把错误变进步</p>
            </div>
            <Link to="/rewards/review">
              <StickerButton variant="tomato" size="sm">
                <BookOpen size={16} /> 开始复习
              </StickerButton>
            </Link>
          </div>
          <div className="p-4">
            {!hasErrors ? (
              <div className="py-2 text-center text-sm text-inkSoft">
                🎉 还没有错题记录，继续保持哦～
              </div>
            ) : (
              <div className="space-y-2">
                {topErrors.map(({ type, label, count }) => (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <TrendingDown size={14} className="text-tomato" />
                      <span className="text-ink">{label}</span>
                    </div>
                    <span className="text-tomato">错 {count} 次</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 font-kid text-xl text-ink">徽章贴纸</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {BADGES.map((b, i) => {
            const unlocked = progress.badges[b.id]?.unlocked;
            return (
              <motion.div
                key={b.id}
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-blob p-5 text-center shadow-stickerSm",
                  unlocked ? "bg-paper" : "bg-dough/10",
                )}
              >
                <motion.div
                  className={cn("grid h-16 w-16 place-items-center rounded-full text-3xl shadow-stickerSm", unlocked ? "bg-white" : "bg-dough/20 grayscale")}
                  animate={unlocked ? { rotate: [0, -6, 6, 0] } : {}}
                  transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1 }}
                >
                  {b.emoji}
                </motion.div>
                <div className="font-kid text-base text-ink">{b.name}</div>
                <div className="text-xs leading-tight text-inkSoft">{unlocked ? b.desc : `未解锁：${b.desc}`}</div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 font-kid text-xl text-ink">星星进度</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {(["kitchen", "numberline", "puzzle"] as const).map((t) => {
            const meta = THEMES[t];
            const levels = LEVELS.filter((l) => l.theme === t);
            return (
              <div key={t} className="card-paper p-4">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-2xl">{meta.emoji}</span>
                  <span className="font-kid text-lg text-ink">{meta.name}</span>
                </div>
                <div className="space-y-2">
                  {levels.map((l) => (
                    <div key={l.id} className="flex items-center justify-between">
                      <span className="text-sm text-ink">{l.title}</span>
                      <StarRow value={progress.levels[l.id]?.stars ?? 0} size={16} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-kid text-xl text-ink">知识点图鉴</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CONCEPT_LIST.map((c) => {
            const m = progress.concepts[c.id];
            const status = m?.status ?? "untouched";
            const tag = STATUS_TAG[status];
            return (
              <button
                key={c.id}
                onClick={() => speak(c.definition)}
                className={cn(
                  "flex flex-col items-start gap-2 rounded-blob p-4 text-left shadow-stickerSm transition hover:-translate-y-0.5",
                  status === "mastered" ? "bg-basil/15" : "bg-paper",
                )}
              >
                <span className="text-3xl">{c.emoji}</span>
                <span className="font-kid text-base text-ink">{c.name}</span>
                <span className={cn("tag", tag.cls)}>{tag.label}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-center text-xs text-inkSoft">点击知识点卡片可以听一听它的解释～</p>
      </section>

      <div className="mt-8 flex justify-center">
        <Link to="/">
          <StickerButton variant="tomato" size="lg">继续闯关去！</StickerButton>
        </Link>
      </div>
    </div>
  );
}
