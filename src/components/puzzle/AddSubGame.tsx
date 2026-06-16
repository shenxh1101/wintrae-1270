import { useState } from "react";
import { motion } from "framer-motion";
import FractionCard from "@/components/ui/FractionCard";
import PizzaSVG from "@/components/ui/PizzaSVG";
import { equal, frac, type Fraction } from "@/lib/fraction";
import type { Task } from "@/lib/levels";
import { fourOptions } from "./options";

interface Props {
  task: Extract<Task, { kind: "addsub" }>;
  locked: boolean;
  onAnswer: (correct: boolean) => void;
}

function makeOptions(task: Extract<Task, { kind: "addsub" }>): Fraction[] {
  const { op, a, b, answer } = task;
  const unsimplified = op === "+" ? frac(a.num + b.num, a.den) : frac(a.num - b.num, a.den);
  return fourOptions(answer, [
    unsimplified,
    frac(answer.num + 1, answer.den),
    frac(Math.max(answer.num - 1, 0), answer.den),
    frac(1, a.den),
    frac(answer.num, answer.den * 2),
  ]);
}

export default function AddSubGame({ task, locked, onAnswer }: Props) {
  const [opts] = useState(() => makeOptions(task));
  const [picked, setPicked] = useState<Fraction | null>(null);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-wrap items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-1">
          <PizzaSVG parts={task.a.den} shaded={task.a.num} size={120} />
          <FractionCard fraction={task.a} color="tomato" size="sm" />
        </div>
        <div className="font-display text-5xl text-basil">{task.op}</div>
        <div className="flex flex-col items-center gap-1">
          <PizzaSVG parts={task.b.den} shaded={task.b.num} size={120} />
          <FractionCard fraction={task.b} color="sky" size="sm" />
        </div>
        <div className="font-display text-5xl text-ink">=</div>
        <div className="grid h-[88px] w-[76px] place-items-center rounded-2xl border-2 border-dashed border-dough/50 bg-cream/50 font-display text-3xl text-dough">
          ?
        </div>
      </div>

      <div className="font-body text-inkSoft">算一算，结果是几分之几？</div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {opts.map((f, i) => (
          <motion.div key={`${f.num}/${f.den}-${i}`} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.06 }}>
            <FractionCard
              fraction={f}
              color="basil"
              size="lg"
              selected={picked !== null && equal(picked, f)}
              disabled={locked}
              onClick={() => {
                if (locked) return;
                setPicked(f);
                onAnswer(equal(f, task.answer));
              }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
