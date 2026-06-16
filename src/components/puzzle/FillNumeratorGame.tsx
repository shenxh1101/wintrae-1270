import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useDrag } from "@/hooks/useDrag";
import FractionCard from "@/components/ui/FractionCard";
import type { Task } from "@/lib/levels";

interface Props {
  task: Extract<Task, { kind: "fill-numerator" }>;
  locked: boolean;
  onAnswer: (correct: boolean) => void;
}

const TILES = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function Tile({ n, disabled, onDrop }: { n: number; disabled: boolean; onDrop: (n: number, x: number, y: number) => void }) {
  const { state, onPointerDown } = useDrag((x, y) => onDrop(n, x, y));
  return (
    <motion.div
      onPointerDown={disabled ? undefined : onPointerDown}
      style={{ touchAction: "none" }}
      animate={{ x: state.isDragging ? state.dx : 0, y: state.isDragging ? state.dy : 0, scale: state.isDragging ? 1.15 : 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      className={disabled ? "cursor-default" : "cursor-grab active:cursor-grabbing"}
    >
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-plum font-display text-2xl font-bold text-white shadow-stickerSm">
        {n}
      </div>
    </motion.div>
  );
}

export default function FillNumeratorGame({ task, locked, onAnswer }: Props) {
  const [filled, setFilled] = useState<number | null>(null);
  const slotRef = useRef<HTMLDivElement>(null);

  const handleDrop = (n: number, x: number, y: number) => {
    if (locked) return;
    const rect = slotRef.current?.getBoundingClientRect();
    if (!rect) return;
    const inside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    if (!inside) return;
    setFilled(n);
    onAnswer(n === task.value);
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="font-body text-inkSoft">把正确的数字拖到问号的位置</div>
      <div className="flex items-center gap-5">
        <div className="flex flex-col items-center">
          <div
            ref={slotRef}
            className="grid h-14 w-14 place-items-center rounded-2xl border-2 border-dashed border-plum/60 bg-cream/60 font-display text-3xl font-bold text-plum"
          >
            {filled ?? "?"}
          </div>
          <div className="mt-1 h-1 w-12 rounded-full bg-ink/70" />
          <div className="mt-1 font-display text-3xl">{task.a.den}</div>
        </div>
        <div className="font-display text-4xl text-ink">=</div>
        <FractionCard fraction={task.b} color="sky" size="lg" />
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {TILES.map((n) => (
          <Tile key={n} n={n} disabled={locked} onDrop={handleDrop} />
        ))}
      </div>
    </div>
  );
}
