import { useCallback } from "react";
import { useGameStore } from "@/lib/store";
import { speak } from "@/lib/speak";

export function useSpeak() {
  const soundOn = useGameStore((s) => s.progress.soundOn);
  return useCallback(
    (text: string) => {
      speak(text, soundOn);
    },
    [soundOn],
  );
}
