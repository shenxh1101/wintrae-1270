import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import FractionCard from "@/components/ui/FractionCard";
import { equal, frac, type Fraction } from "@/lib/fraction";
import type { Task } from "@/lib/levels";
import { fourOptions } from "./options";

interface Props {
  task: Extract<Task, { kind: "reduce" }>;
  locked: boolean;
  onAnswer: (correct: boolean) => void;
}

function makeOptions(from: Fraction, to: Fraction): Fraction[] {
  return fourOptions(to, [
    from,
    frac(1, from.den),
    frac(from.num - 1, from.den),
    frac(from.num + 1, from.den),
    frac(to.num + 1, to.den),
    frac(to.num, to.den * 2),
  ]);
}

export default function ReduceGame({ task, locked, onAnswer }: Props) {
  const [opts] = useState(() => makeOptions(task.from, task.to));
  const [picked, setPicked] = useState<Fraction | null>(null);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-4">
        <FractionCard fraction={task.from} color="tomato" size="lg" />
        <motion.div animate={{ x: [0, 6, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
          <ArrowRight size={32} className="text-basil" />
        </motion.div>
        <div className="grid h-[88px] w-[76px] place-items-center rounded-2xl border-2 border-dashed border-dough/50 bg-cream/50 font-display text-3xl text-dough">
          ?
        </div>
      </div>
      <div className="font-body text-inkSoft">约分后是多少？点选正确答案</div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {opts.map((f, i) => (
          <motion.div key={`${f.num}/${f.den}-${i}`} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.06 }}>
            <FractionCard
              fraction={f}
              color="cheese"
              size="lg"
              selected={picked !== null && equal(picked, f)}
              disabled={locked}
              onClick={() => {
                if (locked) return;
                setPicked(f);
                onAnswer(equal(f, task.to));
              }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
