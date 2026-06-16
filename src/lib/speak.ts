let cachedVoice: SpeechSynthesisVoice | null = null;

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  cachedVoice =
    voices.find((v) => v.lang === "zh-CN") ??
    voices.find((v) => v.lang?.startsWith("zh")) ??
    null;
  return cachedVoice;
}

if (typeof window !== "undefined" && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = null;
    pickVoice();
  };
}

export function speak(text: string, soundOn: boolean): void {
  if (!soundOn) return;
  const synth = window.speechSynthesis;
  if (!synth) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "zh-CN";
  u.rate = 0.92;
  u.pitch = 1.15;
  u.volume = 1;
  const v = pickVoice();
  if (v) u.voice = v;
  synth.speak(u);
}

export function cancelSpeech(): void {
  window.speechSynthesis?.cancel();
}
