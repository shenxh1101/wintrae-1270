import { Link } from "react-router-dom";
import { Award, Shield, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useGameStore, totalStars, levelsDone, masteredCount } from "@/lib/store";
import { THEMES } from "@/lib/levels";
import IslandCard from "@/components/layout/IslandCard";
import NicknameChip from "@/components/layout/NicknameChip";
import SoundToggle from "@/components/ui/SoundToggle";
import StickerButton from "@/components/ui/StickerButton";

export default function LevelSelect() {
  const progress = useGameStore((s) => s.progress);
  const stars = totalStars(progress);
  const done = levelsDone(progress);
  const mastered = masteredCount(progress);

  return (
    <div className="mx-auto min-h-screen w-full max-w-6xl px-4 py-5 sm:px-6">
      <header className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-tomato text-2xl text-white shadow-stickerSm">🍕</span>
          <div className="leading-tight">
            <div className="font-kid text-xl text-ink">分数大冒险</div>
            <div className="text-xs text-inkSoft">玩着玩着就学会分数啦</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <NicknameChip />
          <div className="flex items-center gap-1.5 rounded-full bg-cheese px-3 py-2 text-sm font-bold text-ink shadow-stickerSm">
            <Star size={16} className="fill-ink" /> {stars}
          </div>
          <SoundToggle />
        </div>
      </header>

      <section className="mb-7 grid gap-4 sm:grid-cols-[1.4fr_1fr]">
        <motion.div
          className="relative overflow-hidden rounded-blob bg-gradient-to-br from-tomato to-tomatoDark p-7 text-white shadow-sticker"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="absolute -right-6 -top-8 text-[7rem] opacity-20 rotate-12">🍕</div>
          <h1 className="font-kid text-4xl leading-tight">把分数<br />变成看得见的小块</h1>
          <p className="mt-2 max-w-md font-body text-sm text-white/90">
            切披萨、跳数轴、拼图合并……每个知识点都能"看见、摸到、做对"。慢慢来，不比快！
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">已通关 {done}/12 关</span>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">掌握 {mastered}/8 知识点</span>
          </div>
        </motion.div>

        <div className="flex flex-col gap-3">
          <Link to="/rewards" className="flex-1">
            <StickerButton variant="cheese" size="lg" className="w-full justify-between !rounded-blob">
              <span className="flex items-center gap-2"><Award size={22} /> 奖励收藏册</span>
              <span className="text-2xl">🏅</span>
            </StickerButton>
          </Link>
          <Link to="/parent" className="flex-1">
            <StickerButton variant="cream" size="lg" className="w-full justify-between !rounded-blob">
              <span className="flex items-center gap-2"><Shield size={20} /> 家长面板</span>
              <span className="text-2xl">📊</span>
            </StickerButton>
          </Link>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {(["kitchen", "numberline", "puzzle"] as const).map((t) => (
          <IslandCard key={t} theme={t} progress={progress} />
        ))}
      </section>

      <footer className="mt-8 flex items-center justify-center gap-2 text-xs text-inkSoft">
        <span>{THEMES.kitchen.emoji} 厨房切分</span>
        <span>·</span>
        <span>{THEMES.numberline.emoji} 数轴跳跃</span>
        <span>·</span>
        <span>{THEMES.puzzle.emoji} 拼图挑战</span>
        <span>·</span>
        <span>进度自动保存</span>
      </footer>
    </div>
  );
}
