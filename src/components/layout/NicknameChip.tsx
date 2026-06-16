import { useState } from "react";
import { Pencil, Check } from "lucide-react";
import { useGameStore } from "@/lib/store";

export default function NicknameChip() {
  const nickname = useGameStore((s) => s.progress.nickname);
  const setNickname = useGameStore((s) => s.setNickname);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(nickname);

  if (editing) {
    return (
      <div className="flex items-center gap-1 rounded-full bg-paper px-3 py-1.5 shadow-stickerSm">
        <input
          autoFocus
          value={value}
          maxLength={8}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setNickname(value);
              setEditing(false);
            }
          }}
          className="w-20 bg-transparent text-sm font-semibold text-ink outline-none"
        />
        <button
          onClick={() => {
            setNickname(value);
            setEditing(false);
          }}
          className="text-basil"
          aria-label="确认"
        >
          <Check size={16} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        setValue(nickname);
        setEditing(true);
      }}
      className="flex items-center gap-2 rounded-full bg-paper px-3 py-1.5 shadow-stickerSm transition hover:-translate-y-0.5"
    >
      <span className="grid h-7 w-7 place-items-center rounded-full bg-cheese text-sm">🐻</span>
      <span className="max-w-[7rem] truncate text-sm font-semibold text-ink">{nickname}</span>
      <Pencil size={13} className="text-inkSoft" />
    </button>
  );
}
