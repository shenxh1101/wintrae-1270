import { AnimatePresence, motion } from "framer-motion";
import StickerButton from "@/components/ui/StickerButton";
import StarRow from "@/components/ui/StarRow";

interface Props {
  open: boolean;
  stars: number;
  levelTitle: string;
  hasNext: boolean;
  onNext: () => void;
  onRetry: () => void;
  onHome: () => void;
}

const PRAISE = ["这一关闯过啦！", "进步真快！", "分数小能手就是你！", "继续加油哦～"];

export default function LevelComplete({ open, stars, levelTitle, hasNext, onNext, onRetry, onHome }: Props) {
  const praise = PRAISE[stars >= 3 ? 0 : stars >= 2 ? 1 : stars >= 1 ? 2 : 3];
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/25 backdrop-blur-[3px] p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-md rounded-blob bg-paper p-8 text-center shadow-sticker"
            initial={{ scale: 0.7, y: 40 }}
            animate={{ scale: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 20 } }}
            exit={{ scale: 0.7, opacity: 0 }}
          >
            <div className="text-sm font-semibold text-inkSoft">{levelTitle} · 通关</div>
            <div className="mt-1 font-kid text-3xl text-ink">{praise}</div>

            <div className="my-6 flex justify-center">
              <StarRow value={stars} total={3} size={56} animate />
            </div>

            <div className="mb-6 font-body text-inkSoft">
              {stars >= 3 ? "三星满分，超棒！" : stars >= 1 ? `已获得 ${stars} 颗星，再来一次冲满分吧！` : "别灰心，多练习就能拿到星星啦！"}
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {hasNext && (
                <StickerButton variant="basil" size="lg" onClick={onNext}>
                  下一关 →
                </StickerButton>
              )}
              <StickerButton variant="cheese" size="lg" onClick={onRetry}>
                再玩一次
              </StickerButton>
              <StickerButton variant="cream" size="lg" onClick={onHome}>
                返回地图
              </StickerButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
