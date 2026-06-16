export type ConceptId =
  | "equal-parts"
  | "unit-fraction"
  | "fraction-of-whole"
  | "numberline"
  | "equivalent"
  | "reduction"
  | "comparison"
  | "add-sub";

export interface Concept {
  id: ConceptId;
  name: string;
  shortName: string;
  definition: string;
  emoji: string;
  color: string;
}

export const CONCEPTS: Record<ConceptId, Concept> = {
  "equal-parts": {
    id: "equal-parts",
    name: "平均分",
    shortName: "等分",
    definition: "把一个整体分成大小一样的几份，每一份才叫平均分。",
    emoji: "🔪",
    color: "tomato",
  },
  "unit-fraction": {
    id: "unit-fraction",
    name: "几分之一",
    shortName: "单位分数",
    definition: "把整体平均分成几份，其中 1 份就是几分之一。",
    emoji: "🍕",
    color: "cheese",
  },
  "fraction-of-whole": {
    id: "fraction-of-whole",
    name: "几分之几",
    shortName: "部分量",
    definition: "取了其中的几份，就是几分之几，分子表示取的份数。",
    emoji: "🧩",
    color: "basil",
  },
  numberline: {
    id: "numberline",
    name: "数轴定位",
    shortName: "数轴",
    definition: "分数也是一个数，可以放在数轴上找到它的位置。",
    emoji: "📏",
    color: "sky",
  },
  equivalent: {
    id: "equivalent",
    name: "等值分数",
    shortName: "等值",
    definition: "分母分子同时乘或除以同一个数，分数大小不变。",
    emoji: "🪞",
    color: "plum",
  },
  reduction: {
    id: "reduction",
    name: "约分",
    shortName: "约分",
    definition: "把分数的分子分母同时除以一个数，变成最简分数。",
    emoji: "✨",
    color: "cheese",
  },
  comparison: {
    id: "comparison",
    name: "比较大小",
    shortName: "比较",
    definition: "分母相同比分子，分子相同比分母，谁大谁就大。",
    emoji: "⚖️",
    color: "tomato",
  },
  "add-sub": {
    id: "add-sub",
    name: "分数加减",
    shortName: "加减",
    definition: "同分母分数相加减，分母不变，分子相加减。",
    emoji: "➕",
    color: "basil",
  },
};

export const CONCEPT_LIST = Object.values(CONCEPTS);
