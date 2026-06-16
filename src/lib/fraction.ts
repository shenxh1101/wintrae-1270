export interface Fraction {
  num: number;
  den: number;
}

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

export function simplify(f: Fraction): Fraction {
  const g = gcd(f.num, f.den);
  const num = f.num / g;
  const den = f.den / g;
  return { num: den < 0 ? -num : num, den: den < 0 ? -den : den };
}

export function equal(a: Fraction, b: Fraction): boolean {
  const sa = simplify(a);
  const sb = simplify(b);
  return sa.num * sb.den === sb.num * sa.den;
}

export function compare(a: Fraction, b: Fraction): number {
  const left = a.num * b.den;
  const right = b.num * a.den;
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

export function add(a: Fraction, b: Fraction): Fraction {
  return simplify({ num: a.num * b.den + b.num * a.den, den: a.den * b.den });
}

export function sub(a: Fraction, b: Fraction): Fraction {
  return simplify({ num: a.num * b.den - b.num * a.den, den: a.den * b.den });
}

export function toDecimal(f: Fraction): number {
  return f.num / f.den;
}

export function frac(num: number, den: number): Fraction {
  return { num, den };
}

export function fracLabel(f: Fraction): string {
  const s = simplify(f);
  if (s.den === 1) return `${s.num}`;
  return `${s.num}/${s.den}`;
}

export function isUnitFraction(f: Fraction): boolean {
  const s = simplify(f);
  return s.num === 1;
}

const CN_DIGIT = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

function toCnNum(n: number): string {
  if (n <= 10) return CN_DIGIT[n] ?? String(n);
  if (n < 20) return "十" + CN_DIGIT[n - 10];
  if (n < 100) {
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    return CN_DIGIT[tens] + "十" + (ones === 0 ? "" : CN_DIGIT[ones]);
  }
  return String(n);
}

export function fracToCn(f: Fraction, options?: { simplify?: boolean }): string {
  const base = options?.simplify ? simplify(f) : f;
  const { num, den } = base;
  if (den === 1) return toCnNum(num);
  return `${toCnNum(den)}分之${toCnNum(num)}`;
}

export function fracToCnQuestion(f: Omit<Fraction, "num"> & { num: number | "?" }): string {
  const den = toCnNum(f.den);
  const num = f.num === "?" ? "几" : toCnNum(f.num);
  return `${den}分之${num}`;
}
