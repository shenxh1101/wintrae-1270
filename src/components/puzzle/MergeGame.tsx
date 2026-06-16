import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import FractionCard from "@/components/ui/FractionCard";
import PizzaSVG from "@/components/ui/PizzaSVG";
import { useDrag } from "@/hooks/useDrag";
import { equal, add, type Fraction } from "@/lib/fraction";
import type { Task } from "@/lib/levels";
import { shuffle } from "./options";

interface Props {
  task: Extract<Task, { kind: "merge" }>;
  locked: boolean;
  onAnswer: (correct: boolean) => void;
}

interface CardItem {
  id: string;
  fraction: Fraction;
  isCorrect: boolean;
  placed: boolean;
  wrongShakeKey: number;
}

export default function MergeGame({ task, locked, onAnswer }: Props) {
  const zoneRef = useRef<HTMLDivElement>(null);
  const [merged, setMerged] = useState(false);

  const cards: CardItem[] = useMemo(() => {
    const correct: CardItem[] = [
      { id: "a", fraction: task.a, isCorrect: true, placed: false, wrongShakeKey: 0 },
      { id: "b", fraction: task.b, isCorrect: true, placed: false, wrongShakeKey: 0 },
    ];
    const wrong: CardItem[] = task.distractors.map((f, i) => ({
      id: `w${i}`,
      fraction: f,
      isCorrect: false,
      placed: false,
      wrongShakeKey: 0,
    }));
    return shuffle([...correct, ...wrong]) as CardItem[];
  }, [task]);

  const [cardStates, setCardStates] = useState<Record<string, CardItem>>(() => {
    const map: Record<string, CardItem> = {};
    cards.forEach((c) => (map[c.id] = c));
    return map;
  });

  const placedCorrect = Object.values(cardStates).filter((c) => c.isCorrect && c.placed).length;
  const allPlaced = placedCorrect >= 2;

  useEffect(() => {
    if (allPlaced && !merged) {
      const t = setTimeout(() => setMerged(true), 500);
      return () => clearTimeout(t);
    }
  }, [allPlaced, merged]);

  useEffect(() => {
    if (merged) {
      const t = setTimeout(() => onAnswer(true), 1400);
      return () => clearTimeout(t);
    }
  }, [merged, onAnswer]);

  const handleDrop = (cardId: string, clientX: number, clientY: number) => {
    if (locked || merged) return;
    const card = cardStates[cardId];
    if (!card || card.placed) return;

    const rect = zoneRef.current?.getBoundingClientRect();
    if (!rect) return;
    const inside =
      clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;

    if (!inside) return;

    if (card.isCorrect) {
      if (placedCorrect >= 2) return;
      setCardStates((prev) => ({
        ...prev,
        [cardId]: { ...prev[cardId], placed: true },
      }));
    } else {
      setCardStates((prev) => ({
        ...prev,
        [cardId]: { ...prev[cardId], wrongShakeKey: prev[cardId].wrongShakeKey + 1 },
      }));
      onAnswer(false);
    }
  };

  const sum = useMemo(() => add(task.a, task.b), [task.a, task.b]);

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div ref={zoneRef} className="relative mx-auto aspect-square w-[340px] sm:w-[420px]">
        <div className="absolute inset-0 rounded-full border-[3px] border-dashed border-basil/40 bg-cream/60 shadow-insetSoft" />
        <div className="absolute inset-6 rounded-full border border-dashed border-basil/25" />

        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {!merged && (
              <motion.div
                key="slots"
                className="flex w-full items-center justify-center gap-4 px-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.35 }}
              >
                <PlacedSlot card={cardStates.a?.placed ? cardStates.a : null} />
                <div className="font-display text-4xl text-basil">+</div>
                <PlacedSlot card={cardStates.b?.placed ? cardStates.b : null} />
                <div className="font-display text-4xl text-ink">=</div>
                <div className="h-[72px] w-[72px]" />
              </motion.div>
            )}

            {merged && (
              <motion.div
                key="result"
                className="flex flex-col items-center gap-2"
                initial={{ scale: 0.4, opacity: 0, rotate: -12 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.05 }}
              >
                <PizzaSVG parts={task.answer.den} shaded={task.answer.num} size={150} />
                <FractionCard fraction={task.answer} color="basil" size="md" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="absolute -bottom-2 left-1/2 h-3 w-48 -translate-x-1/2 rounded-full bg-dough/15" />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {cards.map((c) => {
          const state = cardStates[c.id];
          if (state?.placed) {
            return <div key={c.id} className="h-[88px] w-[100px] opacity-0" />;
          }
          return (
            <DraggableCard
              key={c.id}
              card={c}
              shakeKey={state?.wrongShakeKey ?? 0}
              disabled={locked || merged}
              onDrop={(x, y) => handleDrop(c.id, x, y)}
            />
          );
        })}
      </div>

      <div className="font-body text-sm text-inkSoft">
        提示：把两张同分母的卡片拖进盘子，看看它们合起来是多少～
      </div>
    </div>
  );
}

function PlacedSlot({ card }: { card: CardItem | null }) {
  if (!card) {
    return (
      <div className="grid h-[72px] w-[88px] place-items-center rounded-2xl border-2 border-dashed border-basil/30 bg-white/40 font-display text-2xl text-basil/50">
        ?
      </div>
    );
  }
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0, y: -16 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <FractionCard fraction={card.fraction} color="tomato" size="md" />
    </motion.div>
  );
}

function DraggableCard({
  card,
  shakeKey,
  disabled,
  onDrop,
}: {
  card: CardItem;
  shakeKey: number;
  disabled: boolean;
  onDrop: (x: number, y: number) => void;
}) {
  const { state, onPointerDown } = useDrag(onDrop);
  const wrapperRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={wrapperRef}
      key={`${card.id}-${shakeKey}`}
      onPointerDown={disabled ? undefined : onPointerDown}
      style={{ touchAction: "none" }}
      initial={{ scale: 1 }}
      animate={{
        x: state.isDragging ? state.dx : 0,
        y: state.isDragging ? state.dy : 0,
        scale: state.isDragging ? 1.15 : 1,
        rotate: state.isDragging ? -3 : 0,
      }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      className={disabled ? "cursor-default" : "cursor-grab active:cursor-grabbing"}
    >
      <FractionCard fraction={card.fraction} color="cheese" size="lg" />
    </motion.div>
  );
}
