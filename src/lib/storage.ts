import type { ConceptId } from "./concepts";
import type { ErrorType } from "./levels";

export type MasteryStatus = "untouched" | "practicing" | "mastered";

export interface LevelRecord {
  levelId: string;
  stars: number;
  attempts: number;
  bestCorrectRate: number;
  firstCorrectRate: number;
}

export interface ConceptMastery {
  conceptId: ConceptId;
  status: MasteryStatus;
  practiceCount: number;
  correctCount: number;
}

export interface ErrorStat {
  errorType: ErrorType;
  errorCount: number;
  totalCount: number;
}

export interface TimeStat {
  totalSeconds: number;
  kitchenSeconds: number;
  numberlineSeconds: number;
  puzzleSeconds: number;
  weekly: Record<string, number>;
}

export interface BadgeRecord {
  badgeId: string;
  unlocked: boolean;
  unlockedDate?: string;
}

export interface PlayerProgress {
  nickname: string;
  soundOn: boolean;
  levels: Record<string, LevelRecord>;
  concepts: Record<string, ConceptMastery>;
  errors: Record<ErrorType, ErrorStat>;
  time: TimeStat;
  badges: Record<string, BadgeRecord>;
  parentPin: string;
}

const STORAGE_KEY = "fraction-adventure-progress";

export const ERROR_TYPES: ErrorType[] = [
  "equal-division",
  "numberline-place",
  "reduction",
  "comparison",
  "fill-numerator",
  "add-sub",
  "fraction-merge",
];

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function createDefaultProgress(): PlayerProgress {
  const errors = {} as Record<ErrorType, ErrorStat>;
  ERROR_TYPES.forEach((t) => {
    errors[t] = { errorType: t, errorCount: 0, totalCount: 0 };
  });
  return {
    nickname: "小玩家",
    soundOn: true,
    levels: {},
    concepts: {},
    errors,
    time: {
      totalSeconds: 0,
      kitchenSeconds: 0,
      numberlineSeconds: 0,
      puzzleSeconds: 0,
      weekly: {},
    },
    badges: {},
    parentPin: "0000",
  };
}

export function loadProgress(): PlayerProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultProgress();
    const parsed = JSON.parse(raw) as Partial<PlayerProgress>;
    const base = createDefaultProgress();
    return {
      ...base,
      ...parsed,
      levels: { ...base.levels, ...(parsed.levels ?? {}) },
      concepts: { ...base.concepts, ...(parsed.concepts ?? {}) },
      errors: { ...base.errors, ...(parsed.errors ?? {}) },
      time: { ...base.time, ...(parsed.time ?? {}) },
      badges: { ...base.badges, ...(parsed.badges ?? {}) },
    };
  } catch {
    return createDefaultProgress();
  }
}

export function saveProgress(progress: PlayerProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // ignore quota errors
  }
}

export function clearProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function todayKey(): string {
  return todayISO();
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h} 时 ${m} 分`;
  if (m > 0) return `${m} 分 ${sec} 秒`;
  return `${sec} 秒`;
}
