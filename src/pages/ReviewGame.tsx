import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/store";
import { generateReviewTasks, reviewTopErrorTypes, type ReviewTask } from "@/lib/review";
import { ERROR_TYPE_LABELS } from "@/lib/levels";
import { useSpeak } from "@/hooks/useSpeak";
import ReduceGame from "@/components/puzzle/ReduceGame";
import CompareGame from "@/components/puzzle/CompareGame";
import FillNumeratorGame from "@/components/puzzle/FillNumeratorGame";
import AddSubGame from "@/components/puzzle/AddSubGame";
import MergeGame from "@/components/puzzle/MergeGame";
import Feedback, { type FeedbackType } from "@/components/feedback/Feedback";
import StickerButton from "@/components/ui/StickerButton";
import StarRow from "@/components/ui/StarRow";
import { cn } from "@/lib/utils";
import type { ErrorStat } from "@/lib/storage";
import type { ErrorType } from "@/lib/levels";

export default function ReviewGame() {
  const navigate = useNavigate();
  const speak = useSpeak();
  const progress = useGameStore((s) => s.progress);
  const recordAnswer = useGameStore((s) => s.recordAnswer);

  const [beforeErrors, setBeforeErrors] = useState<Record<string, ErrorStat> | null>(null);
  const [tasks, setTasks] = useState<ReviewTask[]>([]);
  const [taskIndex, setTaskIndex] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackType | null>(null);
  const [locked, setLocked] = useState(false);
  const [finished, setFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const spokeRef = useRef(false);

  useEffect(() => {
    const snapshot: Record<string, ErrorStat> = {};
    for (const [k, v] of Object.entries(progress.errors)) {
      snapshot[k] = { ...v };
    }
    setBeforeErrors(snapshot);
    const reviewTasks = generateReviewTasks(progress.errors, 5);
    setTasks(reviewTasks);
  }, []);

  const task = tasks[taskIndex];

  useEffect(() => {
    if (task && !spokeRef.current) {
      spokeRef.current = true;
      speak(task.voice);
    }
  }, [task, speak]);

  const replayVoice = () => {
    if (task) speak(task.voice);
  };

  const handleAnswer = (correct: boolean) => {
    if (locked) return;
    setLocked(true);
    setFeedback(correct ? "correct" : "incorrect");

    if (task) {
      recordAnswer(task.concept, task.errorType, correct);
    }
    if (correct) {
      setCorrectCount((c) => c + 1);
    }
  };

  const handleFeedbackDone = () => {
    setFeedback(null);
    if (taskIndex + 1 >= tasks.length) {
      setFinished(true);
    } else {
      setTaskIndex((i) => i + 1);
      setLocked(false);
      spokeRef.current = false;
    }
  };

  const topErrorsBefore = useMemo(() => {
    if (!beforeErrors) return [];
    return reviewTopErrorTypes(beforeErrors, 4);
  }, [beforeErrors]);

  const topErrorsAfter = useMemo(() => {
    return reviewTopErrorTypes(progress.errors, 4);
  }, [progress.errors]);

  const errorDelta = useMemo(() => {
    if (!beforeErrors) return [] as { type: ErrorType; label: string; before: number; after: number; delta: number }[];
    const types = new Set<ErrorType>([
      ...(Object.keys(beforeErrors) as ErrorType[]),
      ...(Object.keys(progress.errors) as ErrorType[]),
    ]);
    return Array.from(types)
      .map((t) => ({
        type: t,
        label: ERROR_TYPE_LABELS[t],
        before: beforeErrors[t]?.errorCount ?? 0,
        after: progress.errors[t]?.errorCount ?? 0,
        delta: (progress.errors[t]?.errorCount ?? 0) - (beforeErrors[t]?.errorCount ?? 0),
      }))
      .filter((r) => r.before > 0 || r.after > 0)
      .sort((a, b) => b.before - a.before);
  }, [beforeErrors, progress.errors]);

  if (tasks.length === 0 || !beforeErrors) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="font-kid text-xl text-inkSoft">加载中...</div>
      </div>
    );
  }

  if (finished) {
    const total = tasks.length;
    const rate = Math.round((correctCount / total) * 100);

    return (
      <div className="mx-auto min-h-screen w-full max-w-3xl px-4 py-5 sm:px-6">
        <header className="mb-6 flex items-center justify-between gap-3">
          <button onClick={() => navigate(-1)} className="sticker-btn bg-cream px-4 py-2 text-sm shadow-stickerSm hover:-translate-y-0.5">
            <ArrowLeft size={18} /> 返回
          </button>
          <h1 className="font-kid text-2xl text-ink">🎯 复习完成</h1>
          <div className="w-20" />
        </header>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card-paper mb-6 p-6 text-center"
        >
          <div className="mb-3 text-6xl">{rate >= 80 ? "🎉" : rate >= 50 ? "👍" : "💪"}</div>
          <div className="mb-2 font-kid text-2xl text-ink">
            {rate >= 80 ? "太棒了！" : rate >= 50 ? "继续加油！" : "再接再厉！"}
          </div>
          <div className="mb-4 text-inkSoft">
            这次复习答对了 <span className="font-bold text-basil">{correctCount}</span> / {total} 题
          </div>
          <div className="flex justify-center">
            <StarRow value={rate >= 80 ? 3 : rate >= 50 ? 2 : rate >= 30 ? 1 : 0} animate size={36} />
          </div>
        </motion.div>

        <section className="mb-6">
          <h2 className="mb-3 font-kid text-xl text-ink">📊 错题变化</h2>
          <div className="card-paper space-y-3 p-4">
            {errorDelta.length === 0 ? (
              <div className="py-4 text-center text-inkSoft">暂无错题记录</div>
            ) : (
              errorDelta.map(({ type, label, before, after, delta }) => (
                <div key={type} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-ink">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-inkSoft">{before} 次 →</span>
                    <span className={cn("font-bold", delta > 0 ? "text-tomato" : delta < 0 ? "text-basil" : "text-ink")}>
                      {after} 次
                    </span>
                    {delta < 0 && <span className="text-basil">↓ 进步啦</span>}
                    {delta > 0 && <span className="text-tomato">↑</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <div className="flex flex-col items-center gap-3">
          <StickerButton variant="tomato" size="lg" onClick={() => navigate("/rewards")}>
            🏅 回到收藏册
          </StickerButton>
          <StickerButton variant="ghost" size="sm" onClick={() => window.location.reload()}>
            <RotateCcw size={16} /> 再来一轮
          </StickerButton>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-3xl px-4 py-5 sm:px-6">
      <header className="mb-4 flex items-center justify-between gap-3">
        <button onClick={() => navigate(-1)} className="sticker-btn bg-cream px-4 py-2 text-sm shadow-stickerSm hover:-translate-y-0.5">
          <ArrowLeft size={18} /> 退出
        </button>
        <div className="font-kid text-lg text-ink">
          错题复习 · {taskIndex + 1}/{tasks.length}
        </div>
        <button
          onClick={replayVoice}
          className="sticker-btn bg-cream px-3 py-2 text-sm shadow-stickerSm hover:-translate-y-0.5"
          aria-label="重播语音"
        >
          🔊
        </button>
      </header>

      <div className="mb-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-dough/15">
          <motion.div
            className="h-full bg-gradient-to-r from-tomato to-cheese"
            initial={{ width: 0 }}
            animate={{ width: `${((taskIndex + 1) / tasks.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="mb-3 text-center">
        <span className="tag bg-dough/15 text-inkSoft">
          题型：{ERROR_TYPE_LABELS[task.errorType]}
        </span>
      </div>

      <div className="mb-3 text-center font-kid text-xl text-ink">{task.prompt}</div>

      <div className="card-paper p-4 sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={taskIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {task.kind === "reduce" && (
              <ReduceGame task={task} locked={locked} onAnswer={handleAnswer} />
            )}
            {task.kind === "compare" && (
              <CompareGame task={task} locked={locked} onAnswer={handleAnswer} />
            )}
            {task.kind === "fill-numerator" && (
              <FillNumeratorGame task={task} locked={locked} onAnswer={handleAnswer} />
            )}
            {task.kind === "addsub" && (
              <AddSubGame task={task} locked={locked} onAnswer={handleAnswer} />
            )}
            {task.kind === "merge" && (
              <MergeGame task={task} locked={locked} onAnswer={handleAnswer} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <Feedback type={feedback} onDone={handleFeedbackDone} />
    </div>
  );
}
