import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RotateCw } from "lucide-react";
import type { ThemeId } from "@/lib/levels";
import { THEMES } from "@/lib/levels";
import { usePlayTimer } from "@/hooks/usePlayTimer";
import { useSpeak } from "@/hooks/useSpeak";
import SoundToggle from "@/components/ui/SoundToggle";
import { cn } from "@/lib/utils";

interface Props {
  theme: ThemeId;
  title: string;
  subtitle: string;
  prompt: string;
  voice: string;
  progressLabel?: string;
  children: ReactNode;
}

export default function GameShell({ theme, title, subtitle, prompt, voice, progressLabel, children }: Props) {
  usePlayTimer(theme);
  const speak = useSpeak();
  const meta = THEMES[theme];

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6">
      <header className="mb-4 flex items-center justify-between gap-3">
        <Link
          to="/"
          className="sticker-btn bg-cream px-4 py-2 text-sm shadow-stickerSm hover:-translate-y-0.5"
        >
          <ArrowLeft size={18} /> 地图
        </Link>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              "grid h-11 w-11 place-items-center rounded-full text-2xl shadow-stickerSm",
              meta.color === "tomato" && "bg-tomato/15",
              meta.color === "sky" && "bg-sky/15",
              meta.color === "basil" && "bg-basil/15",
            )}
          >
            {meta.emoji}
          </span>
          <div className="leading-tight">
            <div className="font-kid text-lg text-ink">{title}</div>
            <div className="text-xs text-inkSoft">{subtitle}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {progressLabel && (
            <span className="rounded-full bg-paper px-3 py-1.5 text-sm font-semibold text-inkSoft shadow-stickerSm">
              {progressLabel}
            </span>
          )}
          <SoundToggle />
        </div>
      </header>

      <div className="mb-5 flex items-start gap-3 rounded-blob bg-paper/85 p-4 shadow-stickerSm backdrop-blur-sm">
        <button
          onClick={() => speak(voice)}
          className="no-select mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-cheese text-ink shadow-stickerSm transition hover:-translate-y-0.5"
          aria-label="再听一遍"
          title="再听一遍"
        >
          <RotateCw size={20} />
        </button>
        <p className="font-body text-lg text-ink">{prompt}</p>
      </div>

      <div className="flex-1">{children}</div>
    </div>
  );
}
