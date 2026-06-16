import { useState } from "react";
import { motion } from "framer-motion";
import { Delete, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  expected: string;
  onSuccess: () => void;
  onBack: () => void;
}

export default function PinPad({ expected, onSuccess, onBack }: Props) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  const press = (d: string) => {
    if (value.length >= 4) return;
    const next = value + d;
    setValue(next);
    setError(false);
    if (next.length === 4) {
      if (next === expected) {
        setTimeout(onSuccess, 150);
      } else {
        setTimeout(() => {
          setError(true);
          setValue("");
        }, 250);
      }
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-xs card-paper p-8 text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-dough text-white shadow-stickerSm">
          <Lock size={26} />
        </div>
        <h2 className="font-kid text-2xl text-ink">家长入口</h2>
        <p className="mb-5 text-xs text-inkSoft">默认口令 0000</p>

        <motion.div
          className="mb-5 flex justify-center gap-3"
          animate={error ? { x: [0, -8, 8, -8, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-4 w-4 rounded-full transition",
                error ? "bg-tomato" : i < value.length ? "bg-basil" : "bg-dough/30",
              )}
            />
          ))}
        </motion.div>

        <div className="grid grid-cols-3 gap-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <button
              key={d}
              onClick={() => press(d)}
              className="grid h-14 place-items-center rounded-2xl bg-cream font-display text-2xl font-bold text-ink shadow-stickerSm transition hover:-translate-y-0.5"
            >
              {d}
            </button>
          ))}
          <button
            onClick={onBack}
            className="grid h-14 place-items-center rounded-2xl bg-cream/60 text-sm font-semibold text-inkSoft shadow-stickerSm transition hover:-translate-y-0.5"
          >
            返回
          </button>
          <button
            onClick={() => press("0")}
            className="grid h-14 place-items-center rounded-2xl bg-cream font-display text-2xl font-bold text-ink shadow-stickerSm transition hover:-translate-y-0.5"
          >
            0
          </button>
          <button
            onClick={() => setValue((v) => v.slice(0, -1))}
            className="grid h-14 place-items-center rounded-2xl bg-cream/60 text-inkSoft shadow-stickerSm transition hover:-translate-y-0.5"
            aria-label="删除"
          >
            <Delete size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
