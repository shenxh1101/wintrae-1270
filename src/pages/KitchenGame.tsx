import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import GameShell from "@/components/layout/GameShell";
import PizzaSVG from "@/components/ui/PizzaSVG";
import StickerButton from "@/components/ui/StickerButton";
import FractionCard from "@/components/ui/FractionCard";
import Feedback, { type FeedbackType } from "@/components/feedback/Feedback";
import LevelComplete from "@/components/feedback/LevelComplete";
import { useGameFlow } from "@/hooks/useGameFlow";
import { useSpeak } from "@/hooks/useSpeak";
import { useGameStore } from "@/lib/store";
import { equal, frac, type Fraction } from "@/lib/fraction";

const CUT_CHOICES = [2, 3, 4, 5, 6, 8];
type Phase = "divide" | "identify";
type Pending = "identify" | "advance" | null;

function makeOptions(answer: Fraction, parts: number, shaded: number): Fraction[] {
  const raw: Fraction[] = [
    frac(1, parts),
    frac(parts - shaded, parts),
    frac(shaded, parts * 2),
    frac(parts, parts),
    frac(shaded + 1, parts),
  ];
  const seen = new Set<string>();
  const distractors: Fraction[] = [];
  for (const d of raw) {
    if (equal(d, answer)) continue;
    const k = `${d.num}/${d.den}`;
    if (seen.has(k)) continue;
    seen.add(k);
    distractors.push(d);
    if (distractors.length === 3) break;
  }
  const opts = [...distractors, answer];
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  return opts;
}

export default function KitchenGame() {
  const { levelId = "" } = useParams();
  const navigate = useNavigate();
  const flow = useGameFlow(levelId);
  const speak = useSpeak();
  const recordAnswer = useGameStore((s) => s.recordAnswer);
  const completeLevel = useGameStore((s) => s.completeLevel);

  const [phase, setPhase] = useState<Phase>("divide");
  const [cutParts, setCutParts] = useState(1);
  const [options, setOptions] = useState<Fraction[]>([]);
  const [selected, setSelected] = useState<Fraction | null>(null);
  const [feedback, setFeedback] = useState<FeedbackType>(null);
  const [pending, setPending] = useState<Pending>(null);
  const mistakeRef = useRef(false);

  const level = flow.level;
  const task = flow.task;

  useEffect(() => {
    if (!level) return;
    mistakeRef.current = false;
    setPhase("divide");
    setCutParts(1);
    setSelected(null);
    setOptions([]);
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

  const handleConfirmCut = () => {
    if (task.kind !== "kitchen") return;
    if (cutParts === task.parts) {
      recordAnswer("equal-parts", "equal-division", true);
      setOptions(makeOptions(task.answer, task.parts, task.shaded));
      setPending("identify");
      setFeedback("correct");
    } else {
      recordAnswer("equal-parts", "equal-division", false);
      if (!mistakeRef.current) {
        mistakeRef.current = true;
        flow.markMistake();
      }
      setFeedback("incorrect");
    }
  };

  const handlePick = (f: Fraction) => {
    if (task.kind !== "kitchen" || phase !== "identify") return;
    setSelected(f);
    if (equal(f, task.answer)) {
      recordAnswer(task.concept, "equal-division", true);
      setPending("advance");
      setFeedback("correct");
    } else {
      recordAnswer(task.concept, "equal-division", false);
      if (!mistakeRef.current) {
        mistakeRef.current = true;
        flow.markMistake();
      }
      setFeedback("incorrect");
    }
  };

  const handleFeedbackDone = () => {
    setFeedback(null);
    const act = pending;
    setPending(null);
    if (act === "identify") {
      setPhase("identify");
    } else if (act === "advance") {
      mistakeRef.current = false;
      setSelected(null);
      flow.advance();
    }
  };

  const showPizza =
    task && task.kind === "kitchen"
      ? phase === "divide"
        ? { parts: cutParts, shaded: 0 }
        : { parts: task.parts, shaded: task.shaded }
      : { parts: 1, shaded: 0 };

  return (
    <GameShell
      theme="kitchen"
      title={level.title}
      subtitle={level.subtitle}
      prompt={task && task.kind === "kitchen" ? task.prompt : ""}
      voice={task && task.kind === "kitchen" ? task.voice : ""}
      progressLabel={`第 ${Math.min(flow.taskIndex + 1, flow.total)} / ${flow.total} 题`}
    >
      <div className="flex flex-col items-center gap-6 pb-28">
        <motion.div
          key={`pizza-${flow.taskIndex}-${phase}`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="grid place-items-center rounded-blob bg-creamdeep/40 p-6 shadow-insetSoft"
        >
          <PizzaSVG parts={showPizza.parts} shaded={showPizza.shaded} size={300} highlightFirstShaded />
        </motion.div>

        {phase === "divide" && task && task.kind === "kitchen" ? (
          <div className="flex flex-col items-center gap-4">
            <div className="font-body text-inkSoft">点一点，把披萨切成 <span className="font-display text-xl font-bold text-tomato">{task.parts}</span> 等份</div>
            <div className="flex flex-wrap justify-center gap-2">
              {CUT_CHOICES.map((n) => (
                <button
                  key={n}
                  onClick={() => setCutParts(n)}
                  className={
                    "no-select grid h-12 w-12 place-items-center rounded-2xl font-display text-xl font-bold shadow-stickerSm transition " +
                    (cutParts === n ? "bg-tomato text-white scale-105" : "bg-paper text-ink hover:-translate-y-0.5")
                  }
                >
                  {n}
                </button>
              ))}
            </div>
            <StickerButton variant="basil" size="lg" onClick={handleConfirmCut}>
              切好啦！
            </StickerButton>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="font-body text-inkSoft">涂色的一块是几分之几？点选正确答案</div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {options.map((f, i) => (
                <motion.div key={`${f.num}/${f.den}-${i}`} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.06 }}>
                  <FractionCard
                    fraction={f}
                    color="cheese"
                    size="lg"
                    selected={selected !== null && equal(selected, f)}
                    onClick={() => handlePick(f)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <Feedback type={feedback} onDone={handleFeedbackDone} />

        <LevelComplete
          open={flow.finished}
          stars={flow.stars}
          levelTitle={level.title}
          hasNext={!!flow.nextLevel}
          onNext={() => flow.nextLevel && navigate(`/play/kitchen/${flow.nextLevel.id}`)}
          onRetry={() => flow.reset()}
          onHome={() => navigate("/")}
        />
      </div>
    </GameShell>
  );
}
