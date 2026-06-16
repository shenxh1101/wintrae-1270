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
    definition: "把一张披萨切成几块，每一块都一样大，这就叫平均分。只有平均分，每一块才能说它是几分之一。",
    emoji: "🔪",
    color: "tomato",
  },
  "unit-fraction": {
    id: "unit-fraction",
    name: "几分之一",
    shortName: "单位分数",
    definition: "把整体平均分成几份，取其中的一份，就是几分之一。比如平均分成四份，一份就是四分之一。",
    emoji: "🍕",
    color: "cheese",
  },
  "fraction-of-whole": {
    id: "fraction-of-whole",
    name: "几分之几",
    shortName: "部分量",
    definition: "平均分成几份以后，取了其中的几份，就是几分之几。上面的数叫分子，表示取了几份，下面的数叫分母，表示一共分了几份。",
    emoji: "🧩",
    color: "basil",
  },
  numberline: {
    id: "numberline",
    name: "数轴定位",
    shortName: "数轴",
    definition: "分数也是一个数，可以放在数轴上找到它的位置。零到一之间能放好多分数，比如二分之一在中间。",
    emoji: "📏",
    color: "sky",
  },
  equivalent: {
    id: "equivalent",
    name: "等值分数",
    shortName: "等值",
    definition: "大小一样、写法不同的分数，叫等值分数。比如四分之二和二分之一，在数轴上是同一个点。",
    emoji: "🪞",
    color: "plum",
  },
  reduction: {
    id: "reduction",
    name: "约分",
    shortName: "约分",
    definition: "把分数的分子和分母同时除以一个相同的数，让它变得更简单，叫约分。比如四分之二约成二分之一。",
    emoji: "✨",
    color: "cheese",
  },
  comparison: {
    id: "comparison",
    name: "比较大小",
    shortName: "比较",
    definition: "分母相同比分子，分子大的分数大；分子相同比分母，分母小的分数大。",
    emoji: "⚖️",
    color: "tomato",
  },
  "add-sub": {
    id: "add-sub",
    name: "分数加减",
    shortName: "加减",
    definition: "同分母的分数相加或相减，分母不变，只把分子加起来或减起来。比如四分之一加四分之一等于四分之二，也就是二分之一。",
    emoji: "➕",
    color: "basil",
  },
};

export const CONCEPT_LIST = Object.values(CONCEPTS);
