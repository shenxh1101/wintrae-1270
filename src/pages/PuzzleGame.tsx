import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import GameShell from "@/components/layout/GameShell";
import Feedback, { type FeedbackType } from "@/components/feedback/Feedback";
import LevelComplete from "@/components/feedback/LevelComplete";
import StickerButton from "@/components/ui/StickerButton";
import ReduceGame from "@/components/puzzle/ReduceGame";
import CompareGame from "@/components/puzzle/CompareGame";
import FillNumeratorGame from "@/components/puzzle/FillNumeratorGame";
import AddSubGame from "@/components/puzzle/AddSubGame";
import { useGameFlow } from "@/hooks/useGameFlow";
import { useSpeak } from "@/hooks/useSpeak";
import { useGameStore } from "@/lib/store";
import { taskErrorType } from "@/lib/levels";

export default function PuzzleGame() {
  const { levelId = "" } = useParams();
  const navigate = useNavigate();
  const flow = useGameFlow(levelId);
  const speak = useSpeak();
  const recordAnswer = useGameStore((s) => s.recordAnswer);
  const completeLevel = useGameStore((s) => s.completeLevel);

  const [feedback, setFeedback] = useState<FeedbackType>(null);
  const [pendingAdvance, setPendingAdvance] = useState(false);
  const [locked, setLocked] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const mistakeRef = useRef(false);

  const level = flow.level;
  const task = flow.task;

  useEffect(() => {
    if (!level) return;
    mistakeRef.current = false;
    setLocked(false);
    setFeedback(null);
    setAttempt(0);
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

  const handleAnswer = (correct: boolean) => {
    if (!task) return;
    recordAnswer(task.concept, taskErrorType(task), correct);
    setLocked(true);
    if (correct) {
      setPendingAdvance(true);
      setFeedback("correct");
    } else {
      if (!mistakeRef.current) {
        mistakeRef.current = true;
        flow.markMistake();
      }
      setFeedback("incorrect");
    }
  };

  const handleFeedbackDone = () => {
    setFeedback(null);
    setLocked(false);
    if (pendingAdvance) {
      setPendingAdvance(false);
      flow.advance();
    } else {
      setAttempt((a) => a + 1);
    }
  };

  const subKey = `${flow.taskIndex}-${attempt}`;

  return (
    <GameShell
      theme="puzzle"
      title={level.title}
      subtitle={level.subtitle}
      prompt={task ? task.prompt : ""}
      voice={task ? task.voice : ""}
      progressLabel={`第 ${Math.min(flow.taskIndex + 1, flow.total)} / ${flow.total} 题`}
    >
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-6 pb-20">
        {task?.kind === "reduce" && (
          <ReduceGame key={subKey} task={task} locked={locked} onAnswer={handleAnswer} />
        )}
        {task?.kind === "compare" && (
          <CompareGame key={subKey} task={task} locked={locked} onAnswer={handleAnswer} />
        )}
        {task?.kind === "fill-numerator" && (
          <FillNumeratorGame key={subKey} task={task} locked={locked} onAnswer={handleAnswer} />
        )}
        {task?.kind === "addsub" && (
          <AddSubGame key={subKey} task={task} locked={locked} onAnswer={handleAnswer} />
        )}
      </div>

      <Feedback type={feedback} onDone={handleFeedbackDone} />
      <LevelComplete
        open={flow.finished}
        stars={flow.stars}
        levelTitle={level.title}
        hasNext={!!flow.nextLevel}
        onNext={() => flow.nextLevel && navigate(`/play/puzzle/${flow.nextLevel.id}`)}
        onRetry={() => flow.reset()}
        onHome={() => navigate("/")}
      />
    </GameShell>
  );
}
