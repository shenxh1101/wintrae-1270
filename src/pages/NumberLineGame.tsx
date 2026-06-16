import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import GameShell from "@/components/layout/GameShell";
import FractionCard from "@/components/ui/FractionCard";
import Feedback, { type FeedbackType } from "@/components/feedback/Feedback";
import LevelComplete from "@/components/feedback/LevelComplete";
import StickerButton from "@/components/ui/StickerButton";
import { useGameFlow } from "@/hooks/useGameFlow";
import { useSpeak } from "@/hooks/useSpeak";
import { useDrag } from "@/hooks/useDrag";
import { useGameStore } from "@/lib/store";
import { toDecimal, type Fraction } from "@/lib/fraction";

const SNAP = 0.09;

function NumberLineCard({
  fraction,
  index,
  placed,
  disabled,
  onDrop,
}: {
  fraction: Fraction;
  index: number;
  placed: boolean;
  disabled: boolean;
  onDrop: (i: number, x: number, y: number) => void;
}) {
  const { state, onPointerDown } = useDrag((x, y) => onDrop(index, x, y));
  return (
    <motion.div
      onPointerDown={placed || disabled ? undefined : onPointerDown}
      style={{ touchAction: "none" }}
      animate={{
        x: state.isDragging ? state.dx : 0,
        y: state.isDragging ? state.dy : 0,
        scale: state.isDragging ? 1.12 : 1,
        opacity: placed ? 0 : 1,
      }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      className={placed ? "pointer-events-none" : "cursor-grab active:cursor-grabbing"}
    >
      <FractionCard fraction={fraction} color="sky" size="md" />
    </motion.div>
  );
}

export default function NumberLineGame() {
  const { levelId = "" } = useParams();
  const navigate = useNavigate();
  const flow = useGameFlow(levelId);
  const speak = useSpeak();
  const recordAnswer = useGameStore((s) => s.recordAnswer);
  const completeLevel = useGameStore((s) => s.completeLevel);

  const [placed, setPlaced] = useState<boolean[]>([]);
  const [feedback, setFeedback] = useState<FeedbackType>(null);
  const [pendingAdvance, setPendingAdvance] = useState(false);
  const [locked, setLocked] = useState(false);
  const mistakeRef = useRef(false);
  const lineRef = useRef<HTMLDivElement>(null);

  const level = flow.level;
  const task = flow.task;
  const fractions = task && task.kind === "numberline" ? task.fractions : [];
  const rangeMax = task && task.kind === "numberline" ? task.rangeMax : 1;

  useEffect(() => {
    if (!level) return;
    mistakeRef.current = false;
    setPlaced(new Array(task && task.kind === "numberline" ? task.fractions.length : 0).fill(false));
    setLocked(false);
    if (task) speak(task.voice);
  }, [level, task, speak]);

  useEffect(() => {
    if (flow.finished && !flow.committed && level) {
      completeLevel(level.id, flow.stars, Math.round(flow.correctRate * 100));
      flow.commit();
    }
  }, [flow.finished, flow.committed, flow, level, completeLevel]);

  if (!level) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="card-paper p-8 text-center">
          <p className="font-kid text-2xl">关卡不存在</p>
          <StickerButton className="mt-4" onClick={() => navigate("/")}>返回地图</StickerButton>
        </div>
      </div>
    );
  }

  const handleDrop = (i: number, clientX: number) => {
    if (task.kind !== "numberline") return;
    const rect = lineRef.current?.getBoundingClientRect();
    if (!rect) return;
    const ratio = (clientX - rect.left) / rect.width;
    const value = Math.max(0, Math.min(rangeMax, ratio * rangeMax));
    const target = toDecimal(fractions[i]);
    if (Math.abs(value - target) <= SNAP) {
      recordAnswer(task.concept, "numberline-place", true);
      const next = [...placed];
      next[i] = true;
      setPlaced(next);
      const done = next.every(Boolean);
      if (done) setPendingAdvance(true);
      setFeedback("correct");
    } else {
      recordAnswer(task.concept, "numberline-place", false);
      if (!mistakeRef.current) {
        mistakeRef.current = true;
        flow.markMistake();
      }
      setLocked(true);
      setFeedback("incorrect");
    }
  };

  const handleFeedbackDone = () => {
    setFeedback(null);
    setLocked(false);
    if (pendingAdvance) {
      setPendingAdvance(false);
      flow.advance();
    }
  };

  const stackCount = (idx: number): number => {
    const v = toDecimal(fractions[idx]);
    let c = 0;
    for (let j = 0; j < idx; j++) {
      if (placed[j] && Math.abs(toDecimal(fractions[j]) - v) < 0.001) c++;
    }
    return c;
  };

  const ticks: number[] = [];
  for (let i = 0; i <= rangeMax; i++) ticks.push(i);
  const halfTicks: number[] = [];
  for (let i = 0; i < rangeMax; i++) halfTicks.push(i + 0.5);

  return (
    <GameShell
      theme="numberline"
      title={level.title}
      subtitle={level.subtitle}
      prompt={task && task.kind === "numberline" ? task.prompt : ""}
      voice={task && task.kind === "numberline" ? task.voice : ""}
      progressLabel={`第 ${Math.min(flow.taskIndex + 1, flow.total)} / ${flow.total} 题`}
    >
      <div className="flex flex-col items-center gap-10 pb-20">
        <div className="w-full max-w-4xl">
          <div className="relative mb-3 h-24" ref={lineRef}>
            <div className="absolute left-0 right-0 top-1/2 h-3 -translate-y-1/2 rounded-full bg-dough shadow-insetSoft" />
            {halfTicks.map((t) => (
              <div
                key={t}
                className="absolute top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-dough/40"
                style={{ left: `${(t / rangeMax) * 100}%` }}
              />
            ))}
            {ticks.map((t) => (
              <div
                key={t}
                className="absolute top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                style={{ left: `${(t / rangeMax) * 100}%` }}
              >
                <div className="h-8 w-1 rounded-full bg-doughDark" />
                <span className="mt-1 font-display text-sm font-bold text-ink">{t}</span>
              </div>
            ))}
            {fractions.map((f, i) =>
              placed[i] ? (
                <motion.div
                  key={`m-${i}`}
                  className="absolute -translate-x-1/2"
                  style={{ left: `${(toDecimal(f) / rangeMax) * 100}%` }}
                  initial={{ y: 10, opacity: 0, scale: 0.6 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                >
                  <div style={{ transform: `translateY(${-44 - stackCount(i) * 54}px)` }}>
                    <div className="relative">
                      <div className="absolute left-1/2 top-full h-4 w-0.5 -translate-x-1/2 bg-cheese" />
                      <div className="animate-pop rounded-2xl bg-cheese px-2 py-1 font-display text-sm font-bold text-ink shadow-stickerSm">
                        {f.num}/{f.den}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : null,
            )}
          </div>
        </div>

        <div className="flex min-h-[80px] flex-wrap items-center justify-center gap-3">
          {fractions.length === 0 || fractions.every((_, i) => placed[i]) ? (
            <div className="font-body text-inkSoft">全部放好啦！</div>
          ) : (
            fractions.map((f, i) => (
              <NumberLineCard
                key={`c-${i}`}
                fraction={f}
                index={i}
                placed={placed[i]}
                disabled={locked}
                onDrop={handleDrop}
              />
            ))
          )}
        </div>
      </div>

      <Feedback type={feedback} onDone={handleFeedbackDone} />
      <LevelComplete
        open={flow.finished}
        stars={flow.stars}
        levelTitle={level.title}
        hasNext={!!flow.nextLevel}
        onNext={() => flow.nextLevel && navigate(`/play/numberline/${flow.nextLevel.id}`)}
        onRetry={() => flow.reset()}
        onHome={() => navigate("/")}
      />
    </GameShell>
  );
}
