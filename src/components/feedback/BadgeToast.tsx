import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useGameStore } from "@/lib/store";
import { BADGE_MAP } from "@/lib/badges";

export default function BadgeToast() {
  const lastBadge = useGameStore((s) => s.lastUnlockedBadge);
  const clear = useGameStore((s) => s.clearLastBadge);
  const badge = lastBadge ? BADGE_MAP[lastBadge] : null;

  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          className="fixed left-1/2 top-6 z-[60] -translate-x-1/2"
          initial={{ y: -80, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 20 } }}
          exit={{ y: -80, opacity: 0 }}
        >
          <div className="flex items-center gap-3 rounded-full bg-plum px-5 py-3 text-white shadow-sticker">
            <motion.span
              className="text-3xl"
              animate={{ rotate: [0, -15, 15, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.7, repeat: 2 }}
            >
              {badge.emoji}
            </motion.span>
            <div className="leading-tight">
              <div className="text-xs/none opacity-80">解锁新徽章</div>
              <div className="font-kid text-lg">{badge.name}</div>
            </div>
            <button
              onClick={clear}
              className="ml-1 rounded-full bg-white/20 p-1 transition hover:bg-white/30"
              aria-label="关闭"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
