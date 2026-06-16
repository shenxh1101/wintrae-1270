import { useEffect, useRef } from "react";
import { useGameStore } from "@/lib/store";
import type { ThemeId } from "@/lib/levels";

export function usePlayTimer(theme: ThemeId): void {
  const addTime = useGameStore((s) => s.addTime);
  const startRef = useRef<number>(Date.now());

  useEffect(() => {
    startRef.current = Date.now();
    const interval = window.setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startRef.current) / 1000);
      if (elapsed >= 5) {
        addTime(theme, elapsed);
        startRef.current = now;
      }
    }, 5000);
    return () => {
      window.clearInterval(interval);
      const elapsed = Math.floor((Date.now() - startRef.current) / 1000);
      if (elapsed > 0) addTime(theme, elapsed);
    };
  }, [theme, addTime]);
}
