import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type FeedbackType = "correct" | "incorrect" | null;

interface Props {
  type: FeedbackType;
  message?: string;
  onDone?: () => void;
}

const CORRECT_MSGS = ["答对啦！", "太棒了！", "真厉害！", "完全正确！"];
const WRONG_MSGS = ["再想想看～", "差一点点哦～", "没关系，再试一次！", "别着急，慢慢来～"];

export default function Feedback({ type, message, onDone }: Props) {
  useEffect(() => {
    if (!type) return;
    const t = window.setTimeout(() => onDone?.(), type === "correct" ? 1100 : 1500);
    return () => window.clearTimeout(t);
  }, [type, onDone]);

  return (
    <AnimatePresence>
      {type && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-ink/15 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={
              "flex flex-col items-center gap-3 rounded-blob px-12 py-8 shadow-sticker " +
              (type === "correct"
                ? "bg-basil text-white"
                : "bg-paper text-ink")
            }
            initial={{ scale: 0.6, y: 30, rotate: -4 }}
            animate={{
              scale: 1,
              y: 0,
              rotate: 0,
              transition: { type: "spring", stiffness: 320, damping: 18 },
            }}
            exit={{ scale: 0.7, opacity: 0 }}
          >
            <motion.div
              className="text-6xl"
              animate={
                type === "correct"
                  ? { scale: [1, 1.25, 1], rotate: [0, 10, -10, 0] }
                  : { rotate: [0, -8, 8, -8, 0] }
              }
              transition={{ duration: 0.6 }}
            >
              {type === "correct" ? "🎉" : "🤔"}
            </motion.div>
            <div className="font-kid text-3xl">
              {message ?? (type === "correct" ? CORRECT_MSGS[Math.floor(Math.random() * CORRECT_MSGS.length)] : WRONG_MSGS[Math.floor(Math.random() * WRONG_MSGS.length)])}
            </div>
            {type === "incorrect" && (
              <div className="font-body text-sm text-inkSoft">答错不扣分，多试几次就学会啦</div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
