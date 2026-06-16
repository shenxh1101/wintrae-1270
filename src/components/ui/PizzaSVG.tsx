import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  parts: number;
  shaded: number;
  size?: number;
  className?: string;
  highlightFirstShaded?: boolean;
}

function wedgePath(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const x0 = cx + r * Math.cos(a0);
  const y0 = cy + r * Math.sin(a0);
  const x1 = cx + r * Math.cos(a1);
  const y1 = cy + r * Math.sin(a1);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`;
}

const PEPPERONI: { dx: number; dy: number }[] = [
  { dx: 0.62, dy: 0.4 },
  { dx: 0.45, dy: 0.7 },
  { dx: 0.78, dy: 0.62 },
  { dx: 0.55, dy: 0.5 },
];

export default function PizzaSVG({
  parts,
  shaded,
  size = 320,
  className,
  highlightFirstShaded = false,
}: Props) {
  const cx = 50;
  const cy = 50;
  const rOuter = 47;
  const rInner = 41;
  const sliceCount = Math.max(1, parts);

  const slices = Array.from({ length: sliceCount }).map((_, i) => {
    const start = -Math.PI / 2 + (i * 2 * Math.PI) / sliceCount;
    const end = -Math.PI / 2 + ((i + 1) * 2 * Math.PI) / sliceCount;
    return { i, start, end, isShaded: i < shaded };
  });

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={cn("drop-shadow-[0_10px_18px_rgba(139,111,71,0.28)]", className)}
      animate={{ rotate: [0, 0] }}
    >
      <defs>
        <radialGradient id="crust" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#C99B6A" />
          <stop offset="100%" stopColor="#8B6F47" />
        </radialGradient>
        <radialGradient id="cheese" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#FFE08A" />
          <stop offset="70%" stopColor="#F6B73C" />
          <stop offset="100%" stopColor="#E89A2A" />
        </radialGradient>
        <radialGradient id="topping" cx="50%" cy="42%" r="65%">
          <stop offset="0%" stopColor="#F4796E" />
          <stop offset="100%" stopColor="#E85A4F" />
        </radialGradient>
      </defs>

      <circle cx={cx} cy={cy} r={rOuter} fill="url(#crust)" />
      <circle cx={cx} cy={cy} r={rInner} fill="url(#cheese)" />

      {slices.map((s) =>
        s.isShaded ? (
          <g key={`s-${s.i}`}>
            <path d={wedgePath(cx, cy, rInner, s.start, s.end)} fill="url(#topping)" opacity={0.92} />
            {PEPPERONI.map((p, j) => {
              const mid = (s.start + s.end) / 2;
              const rr = (rInner * 0.55);
              const px = cx + Math.cos(mid) * (rr * p.dy) + (Math.cos(mid + Math.PI / 2) * (rr * (p.dx - 0.6)));
              const py = cy + Math.sin(mid) * (rr * p.dy) + (Math.sin(mid + Math.PI / 2) * (rr * (p.dx - 0.6)));
              return <circle key={j} cx={px} cy={py} r={2.4} fill="#C8443B" />;
            })}
          </g>
        ) : (
          <g key={`s-${s.i}`}>
            {[0.55, 0.78].map((rr, j) => {
              const mid = (s.start + s.end) / 2;
              const px = cx + Math.cos(mid) * rInner * rr;
              const py = cy + Math.sin(mid) * rInner * rr;
              return <circle key={j} cx={px} cy={py} r={1.6} fill="#7CB342" opacity={0.8} />;
            })}
          </g>
        ),
      )}

      {sliceCount > 1 &&
        slices.map((s) => {
          const x = cx + rInner * Math.cos(s.start);
          const y = cy + rInner * Math.sin(s.start);
          return (
            <line
              key={`l-${s.i}`}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="#8B6F47"
              strokeWidth={0.9}
              strokeLinecap="round"
            />
          );
        })}

      <circle
        cx={cx}
        cy={cy}
        r={rOuter}
        fill="none"
        stroke="#6B5236"
        strokeWidth={1.2}
        opacity={0.5}
      />
      {highlightFirstShaded && shaded > 0 && (
        <motion.path
          d={wedgePath(cx, cy, rInner, slices[0].start, slices[0].end)}
          fill="none"
          stroke="#FFD984"
          strokeWidth={1.6}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        />
      )}
    </motion.svg>
  );
}
