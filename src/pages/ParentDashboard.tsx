import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useGameStore } from "@/lib/store";
import { CONCEPT_LIST } from "@/lib/concepts";
import { ERROR_TYPE_LABELS } from "@/lib/levels";
import { formatDuration } from "@/lib/storage";
import { THEMES } from "@/lib/levels";
import PinPad from "@/components/parent/PinPad";
import StickerButton from "@/components/ui/StickerButton";
import { cn } from "@/lib/utils";
import type { ConceptId } from "@/lib/concepts";
import type { ErrorType } from "@/lib/levels";

const STATUS_CLS: Record<string, string> = {
  mastered: "bg-basil text-white",
  practicing: "bg-cheese text-ink",
  untouched: "bg-dough/20 text-inkSoft",
};
const STATUS_LABEL: Record<string, string> = {
  mastered: "已掌握",
  practicing: "练习中",
  untouched: "未接触",
};

function last7Days(): { key: string; label: string }[] {
  const out: { key: string; label: string }[] = [];
  const names = ["日", "一", "二", "三", "四", "五", "六"];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    out.push({ key: d.toISOString().slice(0, 10), label: names[d.getDay()] });
  }
  return out;
}

export default function ParentDashboard() {
  const progress = useGameStore((s) => s.progress);
  const resetProgress = useGameStore((s) => s.resetProgress);
  const [authed, setAuthed] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const week = useMemo(() => last7Days(), []);
  const weekMax = Math.max(60, ...week.map((d) => progress.time.weekly[d.key] ?? 0));

  const errorRows = useMemo(() => {
    return (Object.keys(progress.errors) as ErrorType[])
      .map((k) => ({ type: k, stat: progress.errors[k] }))
      .filter((r) => r.stat.totalCount > 0)
      .sort((a, b) => b.stat.errorCount - a.stat.errorCount);
  }, [progress.errors]);

  const conceptRows = useMemo(() => {
    return CONCEPT_LIST.map((c) => ({
      concept: c,
      stat: progress.concepts[c.id as ConceptId],
    }));
  }, [progress.concepts]);

  if (!authed) {
    return <PinPad expected={progress.parentPin} onSuccess={() => setAuthed(true)} onBack={() => history.back()} />;
  }

  const totalMin = Math.round(progress.time.totalSeconds / 60);
  const masteredCount = conceptRows.filter((r) => r.stat?.status === "mastered").length;

  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl px-4 py-5 sm:px-6">
      <header className="mb-6 flex items-center justify-between gap-3">
        <Link to="/" className="sticker-btn bg-cream px-4 py-2 text-sm shadow-stickerSm hover:-translate-y-0.5">
          <ArrowLeft size={18} /> 返回
        </Link>
        <h1 className="font-kid text-2xl text-ink">📊 家长面板</h1>
        <div className="w-20" />
      </header>

      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="card-paper p-5">
          <div className="text-xs text-inkSoft">游戏总时长</div>
          <div className="mt-1 font-display text-3xl font-bold text-ink">{formatDuration(progress.time.totalSeconds)}</div>
        </div>
        <div className="card-paper p-5">
          <div className="text-xs text-inkSoft">已掌握知识点</div>
          <div className="mt-1 font-display text-3xl font-bold text-basil">{masteredCount}/{CONCEPT_LIST.length}</div>
        </div>
        <div className="card-paper p-5">
          <div className="text-xs text-inkSoft">昵称</div>
          <div className="mt-1 font-display text-3xl font-bold text-ink">{progress.nickname || "小朋友"}</div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 font-kid text-xl text-ink">知识掌握情况</h2>
        <div className="card-paper overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-dough/10 text-inkSoft">
              <tr>
                <th className="px-4 py-2 font-medium">知识点</th>
                <th className="px-4 py-2 font-medium">状态</th>
                <th className="px-4 py-2 text-center font-medium">练习次数</th>
                <th className="px-4 py-2 text-center font-medium">正确率</th>
              </tr>
            </thead>
            <tbody>
              {conceptRows.map(({ concept, stat }) => {
                const total = stat?.practiceCount ?? 0;
                const correct = stat?.correctCount ?? 0;
                const rate = total > 0 ? Math.round((correct / total) * 100) : 0;
                return (
                  <tr key={concept.id} className="border-t border-dough/10">
                    <td className="px-4 py-3">
                      <span className="mr-2">{concept.emoji}</span>
                      <span className="font-medium text-ink">{concept.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("tag", STATUS_CLS[stat?.status ?? "untouched"])}>{STATUS_LABEL[stat?.status ?? "untouched"]}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-inkSoft">{total}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={rate >= 80 ? "font-bold text-basil" : rate >= 50 ? "font-bold text-cheese" : "font-bold text-tomato"}>
                        {total > 0 ? `${rate}%` : "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 font-kid text-xl text-ink">常错题型</h2>
        {errorRows.length === 0 ? (
          <div className="card-paper p-6 text-center text-inkSoft">还没有错题记录，继续练习吧～</div>
        ) : (
          <div className="card-paper space-y-3 p-4">
            {errorRows.map(({ type, stat }) => {
              const rate = stat.totalCount > 0 ? Math.round(((stat.totalCount - stat.errorCount) / stat.totalCount) * 100) : 0;
              const widthPct = Math.min(100, (stat.errorCount / Math.max(1, errorRows[0].stat.errorCount)) * 100);
              return (
                <div key={type}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-ink">{ERROR_TYPE_LABELS[type]}</span>
                    <span className="text-inkSoft">
                      错 {stat.errorCount} 次 · 正确率 {rate}%
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-dough/15">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPct}%` }}
                      transition={{ duration: 0.6 }}
                      className="h-full rounded-full bg-tomato"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mb-6">
        <h2 className="mb-3 font-kid text-xl text-ink">近 7 天游戏时长</h2>
        <div className="card-paper p-5">
          <div className="flex h-40 items-end justify-between gap-2">
            {week.map((d) => {
              const secs = progress.time.weekly[d.key] ?? 0;
              const h = Math.round((secs / weekMax) * 100);
              return (
                <div key={d.key} className="flex flex-1 flex-col items-center gap-1">
                  <div className="text-[10px] text-inkSoft">{secs > 0 ? `${Math.round(secs / 60)}分` : ""}</div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.5 }}
                    className="w-full rounded-t-lg bg-gradient-to-t from-sky to-cheese"
                  />
                  <div className="text-xs text-inkSoft">{d.label}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
            {([
              { label: `${THEMES.kitchen.emoji} ${THEMES.kitchen.name}`, secs: progress.time.kitchenSeconds },
              { label: `${THEMES.numberline.emoji} ${THEMES.numberline.name}`, secs: progress.time.numberlineSeconds },
              { label: `${THEMES.puzzle.emoji} ${THEMES.puzzle.name}`, secs: progress.time.puzzleSeconds },
            ]).map((row) => (
              <div key={row.label} className="rounded-xl bg-cream/60 p-2">
                <div className="text-inkSoft">{row.label}</div>
                <div className="font-bold text-ink">{formatDuration(row.secs)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-10 flex flex-col items-center gap-3">
        {confirmReset ? (
          <div className="card-paper flex flex-col items-center gap-3 p-5">
            <p className="font-kid text-lg text-ink">确定要清空所有进度吗？</p>
            <div className="flex gap-3">
              <StickerButton variant="ghost" onClick={() => setConfirmReset(false)}>再想想</StickerButton>
              <StickerButton
                variant="tomato"
                onClick={() => {
                  resetProgress();
                  setConfirmReset(false);
                }}
              >
                确认清空
              </StickerButton>
            </div>
          </div>
        ) : (
          <StickerButton variant="ghost" size="sm" onClick={() => setConfirmReset(true)}>
            <RefreshCw size={16} /> 重置进度
          </StickerButton>
        )}
      </section>
    </div>
  );
}
