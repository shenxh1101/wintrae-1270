import { equal, type Fraction } from "@/lib/fraction";

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function fourOptions(answer: Fraction, distractors: Fraction[]): Fraction[] {
  const seen = new Set<string>();
  const picked: Fraction[] = [];
  for (const d of distractors) {
    if (equal(d, answer)) continue;
    const k = `${d.num}/${d.den}`;
    if (seen.has(k)) continue;
    seen.add(k);
    picked.push(d);
    if (picked.length === 3) break;
  }
  return shuffle([...picked, answer]);
}
