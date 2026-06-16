import { Volume2, VolumeX } from "lucide-react";
import { useGameStore } from "@/lib/store";
import { cancelSpeech } from "@/lib/speak";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

export default function SoundToggle({ className }: Props) {
  const soundOn = useGameStore((s) => s.progress.soundOn);
  const toggleSound = useGameStore((s) => s.toggleSound);

  return (
    <button
      onClick={() => {
        toggleSound();
        if (soundOn) cancelSpeech();
      }}
      className={cn(
        "no-select grid h-11 w-11 place-items-center rounded-full bg-paper text-ink shadow-stickerSm transition hover:-translate-y-0.5",
        className,
      )}
      aria-label={soundOn ? "关闭声音" : "打开声音"}
      title={soundOn ? "关闭声音" : "打开声音"}
    >
      {soundOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
    </button>
  );
}
