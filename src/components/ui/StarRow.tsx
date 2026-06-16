import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  total?: number;
  size?: number;
  animate?: boolean;
  className?: string;
}

export default function StarRow({ value, total = 3, size = 28, animate = false, className }: Props) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: total }).map((_, i) => {
        const filled = i < value;
        return (
          <motion.svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            initial={false}
            animate={animate && filled ? { scale: [0.4, 1.25, 1], rotate: [0, -12, 0] } : { scale: 1 }}
            transition={{ duration: 0.45, delay: animate ? i * 0.18 : 0, ease: "easeOut" }}
            className="drop-shadow-sm"
          >
            <path
              d="M12 2.5l2.95 5.98 6.6.96-4.77 4.65 1.13 6.57L12 17.98 6.09 21.1l1.13-6.57L2.45 9.44l6.6-.96L12 2.5z"
              fill={filled ? "#F6B73C" : "rgba(139,111,71,0.16)"}
              stroke={filled ? "#C8443B" : "rgba(139,111,71,0.3)"}
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </motion.svg>
        );
      })}
    </div>
  );
}
