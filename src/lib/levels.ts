import type { Fraction } from "./fraction";
import { frac } from "./fraction";
import type { ConceptId } from "./concepts";

export type ThemeId = "kitchen" | "numberline" | "puzzle";

export interface Theme {
  id: ThemeId;
  name: string;
  subtitle: string;
  emoji: string;
  color: string;
  accent: string;
}

export const THEMES: Record<ThemeId, Theme> = {
  kitchen: {
    id: "kitchen",
    name: "厨房切分",
    subtitle: "把披萨切成一样大的小块",
    emoji: "🍕",
    color: "tomato",
    accent: "cheese",
  },
  numberline: {
    id: "numberline",
    name: "数轴跳跃",
    subtitle: "帮分数找到数轴上的家",
    emoji: "📏",
    color: "sky",
    accent: "basil",
  },
  puzzle: {
    id: "puzzle",
    name: "拼图挑战",
    subtitle: "约分、比较与加减小闯关",
    emoji: "🧩",
    color: "basil",
    accent: "plum",
  },
};

export type Task =
  | { kind: "kitchen"; parts: number; shaded: number; answer: Fraction; concept: ConceptId; voice: string; prompt: string }
  | { kind: "numberline"; fractions: Fraction[]; rangeMax: number; concept: ConceptId; voice: string; prompt: string }
  | { kind: "reduce"; from: Fraction; to: Fraction; concept: ConceptId; voice: string; prompt: string }
  | { kind: "compare"; a: Fraction; b: Fraction; pick: "larger" | "smaller"; answer: Fraction; concept: ConceptId; voice: string; prompt: string }
  | { kind: "fill-numerator"; a: Fraction; b: Fraction; value: number; concept: ConceptId; voice: string; prompt: string }
  | { kind: "addsub"; op: "+" | "-"; a: Fraction; b: Fraction; answer: Fraction; concept: ConceptId; voice: string; prompt: string };

export interface Level {
  id: string;
  theme: ThemeId;
  order: number;
  title: string;
  subtitle: string;
  difficulty: 1 | 2 | 3 | 4;
  tasks: Task[];
}

export const LEVELS: Level[] = [
  {
    id: "k1",
    theme: "kitchen",
    order: 1,
    title: "二等分披萨",
    subtitle: "认识一半",
    difficulty: 1,
    tasks: [
      { kind: "kitchen", parts: 2, shaded: 1, answer: frac(1, 2), concept: "equal-parts", voice: "把披萨平均分成两份，再说说涂色的一块是几分之几。", prompt: "把披萨平均分成 2 份，涂色的 1 份是几分之几？" },
      { kind: "kitchen", parts: 4, shaded: 1, answer: frac(1, 4), concept: "unit-fraction", voice: "这次分成四份，涂色的一块是几分之几？", prompt: "把披萨平均分成 4 份，涂色的 1 份是几分之几？" },
      { kind: "kitchen", parts: 4, shaded: 3, answer: frac(3, 4), concept: "fraction-of-whole", voice: "涂了三块，是几分之几呢？", prompt: "把披萨平均分成 4 份，涂色的 3 份是几分之几？" },
    ],
  },
  {
    id: "k2",
    theme: "kitchen",
    order: 2,
    title: "三等分与六等分",
    subtitle: "认识三分之一",
    difficulty: 2,
    tasks: [
      { kind: "kitchen", parts: 3, shaded: 1, answer: frac(1, 3), concept: "unit-fraction", voice: "分成三份，一块是三分之一。", prompt: "把披萨平均分成 3 份，涂色的 1 份是几分之几？" },
      { kind: "kitchen", parts: 3, shaded: 2, answer: frac(2, 3), concept: "fraction-of-whole", voice: "涂了两块，是三分之二。", prompt: "把披萨平均分成 3 份，涂色的 2 份是几分之几？" },
      { kind: "kitchen", parts: 6, shaded: 1, answer: frac(1, 6), concept: "unit-fraction", voice: "分成六份，一块是六分之一。", prompt: "把披萨平均分成 6 份，涂色的 1 份是几分之几？" },
    ],
  },
  {
    id: "k3",
    theme: "kitchen",
    order: 3,
    title: "六等分进阶",
    subtitle: "几分之几练习",
    difficulty: 3,
    tasks: [
      { kind: "kitchen", parts: 6, shaded: 5, answer: frac(5, 6), concept: "fraction-of-whole", voice: "涂了五块，是六分之五。", prompt: "把披萨平均分成 6 份，涂色的 5 份是几分之几？" },
      { kind: "kitchen", parts: 8, shaded: 3, answer: frac(3, 8), concept: "fraction-of-whole", voice: "分成八份，涂了三块。", prompt: "把披萨平均分成 8 份，涂色的 3 份是几分之几？" },
      { kind: "kitchen", parts: 5, shaded: 2, answer: frac(2, 5), concept: "fraction-of-whole", voice: "分成五份，涂了两块。", prompt: "把披萨平均分成 5 份，涂色的 2 份是几分之几？" },
    ],
  },
  {
    id: "k4",
    theme: "kitchen",
    order: 4,
    title: "八等分挑战",
    subtitle: "巩固等分概念",
    difficulty: 4,
    tasks: [
      { kind: "kitchen", parts: 8, shaded: 5, answer: frac(5, 8), concept: "fraction-of-whole", voice: "分成八份，涂了五块。", prompt: "把披萨平均分成 8 份，涂色的 5 份是几分之几？" },
      { kind: "kitchen", parts: 8, shaded: 7, answer: frac(7, 8), concept: "fraction-of-whole", voice: "涂了七块，差一块就吃完整张啦。", prompt: "把披萨平均分成 8 份，涂色的 7 份是几分之几？" },
      { kind: "kitchen", parts: 6, shaded: 4, answer: frac(4, 6), concept: "fraction-of-whole", voice: "涂了四块，是六分之四，还能约分哦。", prompt: "把披萨平均分成 6 份，涂色的 4 份是几分之几？" },
    ],
  },
  {
    id: "n1",
    theme: "numberline",
    order: 1,
    title: "数轴初体验",
    subtitle: "0 到 1 的分数",
    difficulty: 1,
    tasks: [
      { kind: "numberline", fractions: [frac(1, 2)], rangeMax: 1, concept: "numberline", voice: "把二分之一拖到数轴中间的位置。", prompt: "把 1/2 拖到数轴上的正确位置。" },
      { kind: "numberline", fractions: [frac(1, 4), frac(3, 4)], rangeMax: 1, concept: "numberline", voice: "把四分之一和四分之三放回它们的家。", prompt: "把 1/4 和 3/4 拖到正确位置。" },
      { kind: "numberline", fractions: [frac(1, 2), frac(1, 4), frac(3, 4)], rangeMax: 1, concept: "numberline", voice: "三个分数一起找家。", prompt: "把三个分数都拖到正确位置。" },
    ],
  },
  {
    id: "n2",
    theme: "numberline",
    order: 2,
    title: "三分与六分",
    subtitle: "更密的刻度",
    difficulty: 2,
    tasks: [
      { kind: "numberline", fractions: [frac(1, 3), frac(2, 3)], rangeMax: 1, concept: "numberline", voice: "把三分之一和三分之二放好。", prompt: "把 1/3 和 2/3 拖到正确位置。" },
      { kind: "numberline", fractions: [frac(1, 6), frac(5, 6)], rangeMax: 1, concept: "numberline", voice: "六分之一和六分之五。", prompt: "把 1/6 和 5/6 拖到正确位置。" },
      { kind: "numberline", fractions: [frac(1, 3), frac(1, 2), frac(5, 6)], rangeMax: 1, concept: "numberline", voice: "混在一起找家，仔细看好刻度。", prompt: "把 1/3、1/2、5/6 都拖到正确位置。" },
    ],
  },
  {
    id: "n3",
    theme: "numberline",
    order: 3,
    title: "等值小伙伴",
    subtitle: "一样的数不同写法",
    difficulty: 3,
    tasks: [
      { kind: "numberline", fractions: [frac(2, 4), frac(1, 2)], rangeMax: 1, concept: "equivalent", voice: "二分之四其实就是二分之一，它们会叠在一起。", prompt: "把 2/4 和 1/2 拖到数轴上，看看它们叠在一起了吗？" },
      { kind: "numberline", fractions: [frac(3, 6), frac(4, 8)], rangeMax: 1, concept: "equivalent", voice: "它们都等于二分之一。", prompt: "把 3/6 和 4/8 拖到正确位置。" },
      { kind: "numberline", fractions: [frac(2, 4), frac(3, 6), frac(4, 8)], rangeMax: 1, concept: "equivalent", voice: "三个分数都住在同一个家。", prompt: "把三个等值分数都拖到正确位置。" },
    ],
  },
  {
    id: "n4",
    theme: "numberline",
    order: 4,
    title: "大于 1 的分数",
    subtitle: "跳出 0 到 1",
    difficulty: 4,
    tasks: [
      { kind: "numberline", fractions: [frac(3, 2)], rangeMax: 2, concept: "numberline", voice: "二分之三比 1 大，要放到 1 和 2 之间。", prompt: "把 3/2 拖到正确位置。" },
      { kind: "numberline", fractions: [frac(5, 4), frac(7, 4)], rangeMax: 2, concept: "numberline", voice: "四分之五和四分之七。", prompt: "把 5/4 和 7/4 拖到正确位置。" },
      { kind: "numberline", fractions: [frac(3, 2), frac(5, 4), frac(7, 4)], rangeMax: 2, concept: "numberline", voice: "三个大分数一起找家。", prompt: "把 3/2、5/4、7/4 都拖到正确位置。" },
    ],
  },
  {
    id: "p1",
    theme: "puzzle",
    order: 1,
    title: "约分小课堂",
    subtitle: "变成最简分数",
    difficulty: 1,
    tasks: [
      { kind: "reduce", from: frac(2, 4), to: frac(1, 2), concept: "reduction", voice: "二分之四约分后是二分之一。", prompt: "把 2/4 约分，结果是多少？" },
      { kind: "reduce", from: frac(3, 6), to: frac(1, 2), concept: "reduction", voice: "三分之六约分后也是二分之一。", prompt: "把 3/6 约分，结果是多少？" },
      { kind: "reduce", from: frac(6, 8), to: frac(3, 4), concept: "reduction", voice: "六分之八约分后是四分之三。", prompt: "把 6/8 约分，结果是多少？" },
    ],
  },
  {
    id: "p2",
    theme: "puzzle",
    order: 2,
    title: "谁大谁小",
    subtitle: "比较分数大小",
    difficulty: 2,
    tasks: [
      { kind: "compare", a: frac(1, 2), b: frac(1, 4), pick: "larger", answer: frac(1, 2), concept: "comparison", voice: "二分之一和四分之一，谁更大？", prompt: "点选更大的分数。" },
      { kind: "compare", a: frac(2, 3), b: frac(2, 5), pick: "larger", answer: frac(2, 3), concept: "comparison", voice: "分子相同，比分母，谁大？", prompt: "点选更大的分数。" },
      { kind: "compare", a: frac(1, 3), b: frac(1, 6), pick: "smaller", answer: frac(1, 6), concept: "comparison", voice: "谁更小呢？", prompt: "点选更小的分数。" },
    ],
  },
  {
    id: "p3",
    theme: "puzzle",
    order: 3,
    title: "补全小分子",
    subtitle: "等值填空",
    difficulty: 3,
    tasks: [
      { kind: "fill-numerator", a: frac(0, 4), b: frac(1, 2), value: 2, concept: "equivalent", voice: "几分之四等于二分之一？填填看。", prompt: "?/4 = 1/2，问号填几？" },
      { kind: "fill-numerator", a: frac(0, 6), b: frac(1, 3), value: 2, concept: "equivalent", voice: "几分之六等于三分之一？", prompt: "?/6 = 1/3，问号填几？" },
      { kind: "fill-numerator", a: frac(0, 8), b: frac(3, 4), value: 6, concept: "equivalent", voice: "几分之八等于四分之三？", prompt: "?/8 = 3/4，问号填几？" },
    ],
  },
  {
    id: "p4",
    theme: "puzzle",
    order: 4,
    title: "加减大冒险",
    subtitle: "同分母加减",
    difficulty: 4,
    tasks: [
      { kind: "addsub", op: "+", a: frac(1, 4), b: frac(1, 4), answer: frac(1, 2), concept: "add-sub", voice: "四分之一加四分之一，等于多少？", prompt: "1/4 + 1/4 = ?" },
      { kind: "addsub", op: "+", a: frac(1, 3), b: frac(1, 3), answer: frac(2, 3), concept: "add-sub", voice: "三分之一加三分之一。", prompt: "1/3 + 1/3 = ?" },
      { kind: "addsub", op: "-", a: frac(3, 4), b: frac(1, 4), answer: frac(1, 2), concept: "add-sub", voice: "四分之三减四分之一。", prompt: "3/4 - 1/4 = ?" },
    ],
  },
];

export function getLevel(id: string): Level | undefined {
  return LEVELS.find((l) => l.id === id);
}

export function levelsByTheme(theme: ThemeId): Level[] {
  return LEVELS.filter((l) => l.theme === theme).sort((a, b) => a.order - b.order);
}

export type ErrorType =
  | "equal-division"
  | "numberline-place"
  | "reduction"
  | "comparison"
  | "fill-numerator"
  | "add-sub";

export const ERROR_TYPE_LABELS: Record<ErrorType, string> = {
  "equal-division": "等分识别",
  "numberline-place": "数轴定位",
  reduction: "约分",
  comparison: "比较大小",
  "fill-numerator": "补全分子",
  "add-sub": "分数加减",
};

export function taskErrorType(task: Task): ErrorType {
  switch (task.kind) {
    case "kitchen":
      return "equal-division";
    case "numberline":
      return "numberline-place";
    case "reduce":
      return "reduction";
    case "compare":
      return "comparison";
    case "fill-numerator":
      return "fill-numerator";
    case "addsub":
      return "add-sub";
  }
}
