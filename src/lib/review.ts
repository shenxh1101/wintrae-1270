import { frac, simplify, add, sub, compare, type Fraction } from "./fraction";
import { CONCEPTS, type ConceptId } from "./concepts";
import { ERROR_TYPE_LABELS, type ErrorType, type Task } from "./levels";
import type { ErrorStat } from "./storage";

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function genReduceTask(): Task {
  const den = pick([4, 6, 8, 10, 12]);
  const factor = pick([2, 3]);
  const num = factor * randInt(1, Math.floor(den / factor) - 1);
  const from = frac(num, den);
  const to = simplify(from);
  const concept: ConceptId = "reduction";
  const voice = `把${den}分之${num}约成最简分数`;
  const prompt = `把 ${num}/${den} 约成最简分数`;
  return { kind: "reduce", from, to, concept, voice, prompt };
}

function genCompareTask(): Task {
  const sameDen = Math.random() > 0.5;
  let a: Fraction, b: Fraction;
  if (sameDen) {
    const den = pick([3, 4, 5, 6, 8]);
    const na = randInt(1, den - 2);
    const nb = na + randInt(1, den - na - 1);
    a = frac(na, den);
    b = frac(nb, den);
  } else {
    const den1 = pick([2, 3, 4, 6]);
    const den2 = pick([3, 4, 6, 8]);
    a = frac(randInt(1, den1 - 1), den1);
    b = frac(randInt(1, den2 - 1), den2);
    while (compare(a, b) === 0) {
      b = frac(randInt(1, den2 - 1), den2);
    }
  }
  const pickLarger = Math.random() > 0.5;
  const answer = pickLarger ? (compare(a, b) > 0 ? a : b) : compare(a, b) < 0 ? a : b;
  const concept: ConceptId = "comparison";
  const voice = pickLarger
    ? `比一比，${a.den}分之${a.num}和${b.den}分之${b.num}，哪个大？`
    : `比一比，${a.den}分之${a.num}和${b.den}分之${b.num}，哪个小？`;
  const prompt = pickLarger ? "哪个分数更大？" : "哪个分数更小？";
  return { kind: "compare", a, b, pick: pickLarger ? "larger" : "smaller", answer, concept, voice, prompt };
}

function genFillNumeratorTask(): Task {
  const den = pick([4, 6, 8, 12]);
  const factor = pick([2, 3]);
  const value = randInt(1, Math.floor(den / factor) - 1);
  const a = frac(value, Math.floor(den / factor));
  const b = frac(value * factor, den);
  const concept: ConceptId = "equivalent";
  const voice = `想一想，${Math.floor(den / factor)}分之${value} 等于 ${den}分之几？`;
  const prompt = `填上合适的数：${a.num}/${a.den} = ?/${b.den}`;
  return { kind: "fill-numerator", a, b, value: b.num, concept, voice, prompt };
}

function genAddSubTask(): Task {
  const isAdd = Math.random() > 0.4;
  const den = pick([4, 5, 6, 8, 10]);
  const na = randInt(1, den - 1);
  let nb: number;
  if (isAdd) {
    nb = randInt(1, den - na - 1);
  } else {
    nb = randInt(1, na - 1);
  }
  const a = frac(na, den);
  const b = frac(nb, den);
  const answer = isAdd ? add(a, b) : sub(a, b);
  const concept: ConceptId = "add-sub";
  const opLabel = isAdd ? "加" : "减";
  const voice = `${den}分之${na} ${opLabel} ${den}分之${nb} 等于多少？`;
  const prompt = `${a.num}/${a.den} ${isAdd ? "+" : "-"} ${b.num}/${b.den} = ?`;
  return { kind: "addsub", op: isAdd ? "+" : "-", a, b, answer, concept, voice, prompt };
}

function genMergeTask(): Task {
  const den = pick([4, 5, 6, 8]);
  const na = randInt(1, Math.floor(den / 2));
  const nb = randInt(1, den - na - 1);
  const a = frac(na, den);
  const b = frac(nb, den);
  const answer = simplify(add(a, b));

  const distractors: Fraction[] = [];
  while (distractors.length < 2) {
    const wrongDen = pick([den, den * 2, Math.floor(den / 2)]);
    const wrongNum = randInt(1, wrongDen - 1);
    const wf = frac(wrongNum, wrongDen);
    if (compare(wf, answer) !== 0 && !distractors.some((d) => compare(d, wf) === 0)) {
      distractors.push(wf);
    }
  }

  const concept: ConceptId = "add-sub";
  const voice = `把${den}分之${na}和${den}分之${nb}合在一起，是多少呢？`;
  const prompt = `把两张卡片拖进盘子里，看看合起来是多少`;
  return { kind: "merge", a, b, answer, distractors, concept, voice, prompt };
}

const GEN_MAP: Record<ErrorType, () => Task> = {
  "equal-division": () => {
    const t = genFillNumeratorTask();
    return { ...t, concept: "fraction-of-whole" as ConceptId };
  },
  "numberline-place": () => {
    const t = genFillNumeratorTask();
    return { ...t, concept: "numberline" as ConceptId };
  },
  reduction: genReduceTask,
  comparison: genCompareTask,
  "fill-numerator": genFillNumeratorTask,
  "add-sub": genAddSubTask,
  "fraction-merge": genMergeTask,
};

export type ReviewTask = Task & { errorType: ErrorType };

export function generateReviewTasks(errors: Record<string, ErrorStat>, count = 5): ReviewTask[] {
  const errorList = (Object.keys(errors) as ErrorType[])
    .map((k) => ({ type: k, stat: errors[k] }))
    .filter((r) => r.stat.errorCount > 0)
    .sort((a, b) => b.stat.errorCount - a.stat.errorCount);

  if (errorList.length === 0) {
    const fallback: ErrorType[] = ["reduction", "comparison", "add-sub", "fill-numerator", "fraction-merge"];
    return shuffle(fallback).slice(0, count).map((t) => ({
      ...GEN_MAP[t](),
      errorType: t,
    }));
  }

  const tasks: ReviewTask[] = [];
  const topTypes = errorList.slice(0, Math.min(3, errorList.length)).map((e) => e.type);

  for (let i = 0; i < count; i++) {
    const et = topTypes[i % topTypes.length];
    const gen = GEN_MAP[et];
    tasks.push({ ...gen(), errorType: et });
  }

  return shuffle(tasks);
}

export function reviewTopErrorTypes(errors: Record<string, ErrorStat>, limit = 3): { type: ErrorType; label: string; count: number }[] {
  return (Object.keys(errors) as ErrorType[])
    .map((k) => ({ type: k, stat: errors[k] }))
    .filter((r) => r.stat.errorCount > 0)
    .sort((a, b) => b.stat.errorCount - a.stat.errorCount)
    .slice(0, limit)
    .map((r) => ({ type: r.type, label: ERROR_TYPE_LABELS[r.type], count: r.stat.errorCount }));
}
