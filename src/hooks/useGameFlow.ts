import { useCallback, useMemo, useState } from "react";
import { getLevel, LEVELS } from "@/lib/levels";
import type { Task } from "@/lib/levels";

function rateToStars(rate: number): number {
  if (rate >= 0.85) return 3;
  if (rate >= 0.6) return 2;
  if (rate >= 0.3) return 1;
  return 0;
}

export function useGameFlow(levelId: string) {
  const level = useMemo(() => getLevel(levelId), [levelId]);
  const total = level?.tasks.length ?? 0;
  const [taskIndex, setTaskIndex] = useState(0);
  const [mistakeTasks, setMistakeTasks] = useState(0);
  const [committed, setCommitted] = useState(false);

  const task: Task | undefined = level?.tasks[taskIndex];
  const finished = taskIndex >= total;
  const firstTryCount = Math.max(0, total - mistakeTasks);
  const correctRate = total ? firstTryCount / total : 0;
  const stars = rateToStars(correctRate);

  const nextLevel = useMemo(() => {
    if (!level) return undefined;
    return LEVELS.find((l) => l.theme === level.theme && l.order === level.order + 1);
  }, [level]);

  const markMistake = useCallback(() => setMistakeTasks((m) => m + 1), []);
  const advance = useCallback(() => setTaskIndex((i) => i + 1), []);
  const reset = useCallback(() => {
    setTaskIndex(0);
    setMistakeTasks(0);
    setCommitted(false);
  }, []);
  const commit = useCallback(() => setCommitted(true), []);

  return {
    level,
    task,
    taskIndex,
    total,
    finished,
    stars,
    correctRate,
    committed,
    nextLevel,
    markMistake,
    advance,
    reset,
    commit,
  };
}
