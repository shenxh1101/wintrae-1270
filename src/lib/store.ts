import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  type PlayerProgress,
  type ConceptMastery,
  type LevelRecord,
  createDefaultProgress,
  todayKey,
} from "./storage";
import type { ConceptId } from "./concepts";
import type { ErrorType, ThemeId } from "./levels";
import { LEVELS } from "./levels";
import { BADGES } from "./badges";

const MASTERED_MIN_PRACTICE = 3;
const MASTERED_MIN_RATE = 0.8;

export function starsByTheme(progress: PlayerProgress, theme: ThemeId): number {
  return LEVELS.filter((l) => l.theme === theme).reduce(
    (sum, l) => sum + (progress.levels[l.id]?.stars ?? 0),
    0,
  );
}

export function totalStars(progress: PlayerProgress): number {
  return LEVELS.reduce((sum, l) => sum + (progress.levels[l.id]?.stars ?? 0), 0);
}

export function masteredCount(progress: PlayerProgress): number {
  return Object.values(progress.concepts).filter((c) => c.status === "mastered").length;
}

export function levelsDone(progress: PlayerProgress): number {
  return LEVELS.filter((l) => (progress.levels[l.id]?.stars ?? 0) > 0).length;
}

export function isLevelUnlocked(progress: PlayerProgress, levelId: string): boolean {
  const level = LEVELS.find((l) => l.id === levelId);
  if (!level) return false;
  if (level.order === 1) return true;
  const prev = LEVELS.find((l) => l.theme === level.theme && l.order === level.order - 1);
  if (!prev) return true;
  return (progress.levels[prev.id]?.stars ?? 0) > 0;
}

function buildBadgeStats(progress: PlayerProgress) {
  return {
    totalStars: totalStars(progress),
    kitchenStars: starsByTheme(progress, "kitchen"),
    numberlineStars: starsByTheme(progress, "numberline"),
    puzzleStars: starsByTheme(progress, "puzzle"),
    masteredCount: masteredCount(progress),
    levelsDone: levelsDone(progress),
  };
}

function refreshBadges(progress: PlayerProgress): PlayerProgress {
  const stats = buildBadgeStats(progress);
  const badges = { ...progress.badges };
  for (const badge of BADGES) {
    const existing = badges[badge.id] ?? { badgeId: badge.id, unlocked: false };
    if (!existing.unlocked && badge.condition(stats)) {
      badges[badge.id] = {
        badgeId: badge.id,
        unlocked: true,
        unlockedDate: new Date().toISOString(),
      };
    } else if (!existing.unlocked) {
      badges[badge.id] = existing;
    }
  }
  return { ...progress, badges };
}

interface GameState {
  progress: PlayerProgress;
  lastUnlockedBadge: string | null;
  toggleSound: () => void;
  setNickname: (name: string) => void;
  recordAnswer: (concept: ConceptId, errorType: ErrorType, correct: boolean) => void;
  addTime: (theme: ThemeId, seconds: number) => void;
  completeLevel: (levelId: string, stars: number, correctRate: number) => void;
  setParentPin: (pin: string) => void;
  resetProgress: () => void;
  clearLastBadge: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      progress: createDefaultProgress(),
      lastUnlockedBadge: null,
      toggleSound: () =>
        set((s) => ({
          progress: { ...s.progress, soundOn: !s.progress.soundOn },
        })),
      setNickname: (name) =>
        set((s) => ({ progress: { ...s.progress, nickname: name || "小玩家" } })),
      recordAnswer: (concept, errorType, correct) =>
        set((s) => {
          const progress = { ...s.progress };
          const concepts = { ...progress.concepts };
          const prev: ConceptMastery =
            concepts[concept] ?? {
              conceptId: concept,
              status: "untouched",
              practiceCount: 0,
              correctCount: 0,
            };
          const practiceCount = prev.practiceCount + 1;
          const correctCount = prev.correctCount + (correct ? 1 : 0);
          const rate = correctCount / practiceCount;
          const status =
            practiceCount >= MASTERED_MIN_PRACTICE && rate >= MASTERED_MIN_RATE
              ? "mastered"
              : practiceCount >= 1
                ? "practicing"
                : "untouched";
          concepts[concept] = { ...prev, practiceCount, correctCount, status };

          const errors = { ...progress.errors };
          const ePrev = errors[errorType] ?? {
            errorType,
            errorCount: 0,
            totalCount: 0,
          };
          errors[errorType] = {
            ...ePrev,
            totalCount: ePrev.totalCount + 1,
            errorCount: ePrev.errorCount + (correct ? 0 : 1),
          };

          progress.concepts = concepts;
          progress.errors = errors;
          return { progress: refreshBadges(progress) };
        }),
      addTime: (theme, seconds) =>
        set((s) => {
          const time = { ...s.progress.time };
          const day = todayKey();
          time.totalSeconds += seconds;
          if (theme === "kitchen") time.kitchenSeconds += seconds;
          if (theme === "numberline") time.numberlineSeconds += seconds;
          if (theme === "puzzle") time.puzzleSeconds += seconds;
          time.weekly = { ...time.weekly, [day]: (time.weekly[day] ?? 0) + seconds };
          return { progress: { ...s.progress, time } };
        }),
      completeLevel: (levelId, stars, correctRate) =>
        set((s) => {
          const levels = { ...s.progress.levels };
          const prev: LevelRecord | undefined = levels[levelId];
          if (!prev) {
            levels[levelId] = {
              levelId,
              stars,
              attempts: 1,
              bestCorrectRate: correctRate,
              firstCorrectRate: correctRate,
            };
          } else {
            levels[levelId] = {
              ...prev,
              stars: Math.max(prev.stars, stars),
              attempts: prev.attempts + 1,
              bestCorrectRate: Math.max(prev.bestCorrectRate, correctRate),
            };
          }
          const progress: PlayerProgress = { ...s.progress, levels };
          const refreshed = refreshBadges(progress);
          const newlyUnlocked = BADGES.find(
            (b) =>
              refreshed.badges[b.id]?.unlocked && !s.progress.badges[b.id]?.unlocked,
          );
          return {
            progress: refreshed,
            lastUnlockedBadge: newlyUnlocked ? newlyUnlocked.id : null,
          };
        }),
      setParentPin: (pin) =>
        set((s) => ({ progress: { ...s.progress, parentPin: pin } })),
      resetProgress: () =>
        set(() => ({
          progress: createDefaultProgress(),
          lastUnlockedBadge: null,
        })),
      clearLastBadge: () => set({ lastUnlockedBadge: null }),
    }),
    {
      name: "fraction-adventure-progress",
      storage: createJSONStorage(() => localStorage),
      merge: (persisted, current) => {
        const base = createDefaultProgress();
        const p = (persisted as Partial<GameState>) ?? {};
        const loaded = p.progress ?? base;
        return {
          ...current,
          ...p,
          progress: {
            ...base,
            ...loaded,
            levels: { ...base.levels, ...(loaded.levels ?? {}) },
            concepts: { ...base.concepts, ...(loaded.concepts ?? {}) },
            errors: { ...base.errors, ...(loaded.errors ?? {}) },
            time: { ...base.time, ...(loaded.time ?? {}) },
            badges: { ...base.badges, ...(loaded.badges ?? {}) },
          },
        };
      },
    },
  ),
);
