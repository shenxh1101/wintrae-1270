export interface Badge {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  color: string;
  condition: (stats: { totalStars: number; kitchenStars: number; numberlineStars: number; puzzleStars: number; masteredCount: number; levelsDone: number }) => boolean;
}

export const BADGES: Badge[] = [
  {
    id: "first-step",
    name: "初出茅庐",
    emoji: "🌱",
    desc: "完成你的第一个关卡",
    color: "basil",
    condition: (s) => s.levelsDone >= 1,
  },
  {
    id: "pizza-chef",
    name: "披萨小厨师",
    emoji: "👨‍🍳",
    desc: "在厨房切分集满 6 颗星",
    color: "tomato",
    condition: (s) => s.kitchenStars >= 6,
  },
  {
    id: "number-jumper",
    name: "数轴小跳蛙",
    emoji: "🐸",
    desc: "在数轴跳跃集满 6 颗星",
    color: "sky",
    condition: (s) => s.numberlineStars >= 6,
  },
  {
    id: "puzzle-master",
    name: "拼图小达人",
    emoji: "🧩",
    desc: "在拼图挑战集满 6 颗星",
    color: "plum",
    condition: (s) => s.puzzleStars >= 6,
  },
  {
    id: "star-collector",
    name: "满星收割机",
    emoji: "⭐",
    desc: "累计获得 18 颗星星",
    color: "cheese",
    condition: (s) => s.totalStars >= 18,
  },
  {
    id: "fraction-sage",
    name: "分数小学者",
    emoji: "🎓",
    desc: "掌握 5 个以上知识点",
    color: "basil",
    condition: (s) => s.masteredCount >= 5,
  },
  {
    id: "world-tour",
    name: "环岛旅行家",
    emoji: "🏝️",
    desc: "完成全部 12 个关卡",
    color: "dough",
    condition: (s) => s.levelsDone >= 12,
  },
];

export const BADGE_MAP: Record<string, Badge> = Object.fromEntries(
  BADGES.map((b) => [b.id, b]),
);
