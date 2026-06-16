import { useState } from "react";
import { motion } from "framer-motion";
import FractionCard from "@/components/ui/FractionCard";
import { compare, equal, type Fraction } from "@/lib/fraction";
import type { Task } from "@/lib/levels";

interface Props {
  task: Extract<Task, { kind: "compare" }>;
  locked: boolean;
  onAnswer: (correct: boolean) => void;
}

export default function CompareGame({ task, locked, onAnswer }: Props) {
  const [picked, setPicked] = useState<Fraction | null>(null);
  const a = task.a;
  const b = task.b;
  const cmp = compare(a, b);
  const angle = picked ? (cmp > 0 ? -9 : cmp < 0 ? 9 : 0) : 0;
  const prompt = task.pick === "larger" ? "点选更大的分数" : "点选更小的分数";

  const choose = (f: Fraction) => {
    if (locked) return;
    setPicked(f);
    onAnswer(equal(f, task.answer));
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="font-kid text-xl text-ink">{prompt}</div>
      <div className="relative h-56 w-full max-w-xl">
        <motion.div
          className="absolute left-1/2 top-10 h-3 w-72 -translate-x-1/2 rounded-full bg-dough shadow-insetSoft"
          animate={{ rotate: angle }}
          transition={{ type: "spring", stiffness: 200, damping: 16 }}
          style={{ transformOrigin: "center" }}
        >
          <motion.div
            className="absolute -left-2 -translate-x-1/2"
            style={{ left: "8%" }}
            animate={{ rotate: -angle }}
          >
            <div className="flex flex-col items-center">
              <div className="h-6 w-0.5 bg-doughDark" />
              <button
                onClick={() => choose(a)}
                className={picked && equal(picked, a) ? "ring-4 ring-cheese rounded-3xl" : ""}
              >
                <FractionCard fraction={a} color="tomato" size="lg" />
              </button>
            </div>
          </motion.div>
          <motion.div
            className="absolute -right-2 translate-x-1/2"
            style={{ left: "92%" }}
            animate={{ rotate: -angle }}
          >
            <div className="flex flex-col items-center">
              <div className="h-6 w-0.5 bg-doughDark" />
              <button
                onClick={() => choose(b)}
                className={picked && equal(picked, b) ? "ring-4 ring-cheese rounded-3xl" : ""}
              >
                <FractionCard fraction={b} color="sky" size="lg" />
              </button>
            </div>
          </motion.div>
        </motion.div>
        <div className="absolute left-1/2 top-12 -translate-x-1/2">
          <div className="h-0 w-0 border-x-[18px] border-t-[26px] border-x-transparent border-t-doughDark" />
        </div>
        <div className="absolute bottom-2 left-1/2 h-3 w-32 -translate-x-1/2 rounded-full bg-dough/30" />
      </div>
    </div>
  );
}
