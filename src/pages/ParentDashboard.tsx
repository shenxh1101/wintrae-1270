import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useGameStore } from "@/lib/store";
import { CONCEPT_LIST, CONCEPTS } from "@/lib/concepts";
import { ERROR_TYPE_LABELS, LEVELS, THEMES } from "@/lib/levels";
import { formatDuration } from "@/lib/storage";
import PinPad from "@/components/parent/PinPad";
import StickerButton from "@/components/ui/StickerButton";
import StarRow from "@/components/ui/StarRow";
import { cn } from "@/lib/utils";
import type { ConceptId } from "@/lib/concepts";
import type { ErrorType, ThemeId } from "@/lib/levels";

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

const THEME_CONCEPTS: Record<ThemeId, ConceptId[]> = {
  kitchen: ["equal-parts", "unit-fraction", "fraction-of-whole"],
  numberline: ["numberline", "equivalent"],
  puzzle: ["reduction", "comparison", "equivalent", "add-sub"],
};

const THEME_ERRORS: Record<ThemeId, ErrorType[]> = {
  kitchen: ["equal-division"],
  numberline: ["numberline-place"],
  puzzle: ["reduction", "comparison", "fill-numerator", "add-sub", "fraction-merge"],
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
  const [copied, setCopied] = useState(false);

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

  const themeLevels = useMemo(() => {
    const byTheme: Record<ThemeId, typeof LEVELS> = { kitchen: [], numberline: [], puzzle: [] };
    for (const lv of LEVELS) {
      byTheme[lv.theme].push(lv);
    }
    return byTheme;
  }, []);

  const generateReportText = (): string => {
    const name = progress.nickname || "小朋友";
    const totalTime = formatDuration(progress.time.totalSeconds);
    const levelsDone = Object.values(progress.levels).filter((l) => l.stars > 0).length;
    const totalLevels = LEVELS.length;
    const masteredNames = conceptRows
      .filter((r) => r.stat?.status === "mastered")
      .map((r) => r.concept.name);
    const practicingNames = conceptRows
      .filter((r) => r.stat?.status === "practicing")
      .map((r) => r.concept.name);

    const lines: string[] = [];
    lines.push("【分数大冒险 · 学习报告】");
    lines.push(`${name} 累计游戏 ${totalTime}，通关 ${levelsDone}/${totalLevels} 关，`);
    lines.push(`已掌握 ${masteredCount} 个知识点，还有 ${practicingNames.length} 个正在练习中。`);
    lines.push("");

    for (const themeId of ["kitchen", "numberline", "puzzle"] as ThemeId[]) {
      const theme = THEMES[themeId];
      const tLevels = themeLevels[themeId];
      const tStars = tLevels.reduce((s, lv) => s + (progress.levels[lv.id]?.stars ?? 0), 0);
      const tMaxStars = tLevels.length * 3;
      const tTime = formatDuration(
        themeId === "kitchen"
          ? progress.time.kitchenSeconds
          : themeId === "numberline"
          ? progress.time.numberlineSeconds
          : progress.time.puzzleSeconds
      );
      const tConcepts = THEME_CONCEPTS[themeId]
        .map((cid) => CONCEPTS[cid])
        .filter((c) => progress.concepts[c.id]?.status === "mastered")
        .map((c) => c.name);
      const tErrors = THEME_ERRORS[themeId]
        .map((eid) => ({ type: eid, stat: progress.errors[eid] }))
        .filter((e) => e.stat.errorCount > 0)
        .sort((a, b) => b.stat.errorCount - a.stat.errorCount);

      lines.push(`${theme.emoji} ${theme.name}主题：`);
      lines.push(`  · 获得 ${tStars}/${tMaxStars} 颗星，游戏时长 ${tTime}`);
      if (tConcepts.length > 0) {
        lines.push(`  · 已掌握：${tConcepts.join("、")}`);
      }
      if (tErrors.length > 0) {
        const topErr = tErrors[0];
        lines.push(`  · 还需要加强：${ERROR_TYPE_LABELS[topErr.type]}（错 ${topErr.stat.errorCount} 次）`);
      }
      lines.push("");
    }

    if (masteredNames.length > 0) {
      lines.push(`🌟 已掌握的知识点：${masteredNames.join("、")}`);
    }
    if (practicingNames.length > 0) {
      lines.push(`💪 正在努力攻克：${practicingNames.join("、")}`);
    }
    lines.push("");
    lines.push("继续加油，分数小冒险家！🎯");

    return lines.join("\n");
  };

  const copyReport = async () => {
    const text = generateReportText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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

      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-kid text-xl text-ink">📋 学习报告</h2>
          <StickerButton variant="basil" size="sm" onClick={copyReport}>
            {copied ? <><Check size={16} /> 已复制</> : <><Copy size={16} /> 复制总结</>}
          </StickerButton>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {(["kitchen", "numberline", "puzzle"] as ThemeId[]).map((themeId) => {
            const theme = THEMES[themeId];
            const tLevels = themeLevels[themeId];
            const tStars = tLevels.reduce((s, lv) => s + (progress.levels[lv.id]?.stars ?? 0), 0);
            const tMaxStars = tLevels.length * 3;
            const tTime = formatDuration(
              themeId === "kitchen"
                ? progress.time.kitchenSeconds
                : themeId === "numberline"
                ? progress.time.numberlineSeconds
                : progress.time.puzzleSeconds
            );
            const tConcepts = THEME_CONCEPTS[themeId].map((cid) => ({
              concept: CONCEPTS[cid],
              stat: progress.concepts[cid],
            }));
            const tMastered = tConcepts.filter((c) => c.stat?.status === "mastered");
            const tErrors = THEME_ERRORS[themeId]
              .map((eid) => ({ type: eid, stat: progress.errors[eid] }))
              .filter((e) => e.stat.errorCount > 0)
              .sort((a, b) => b.stat.errorCount - a.stat.errorCount);
            const levelsPlayed = tLevels.filter((lv) => (progress.levels[lv.id]?.stars ?? 0) > 0);

            return (
              <div key={themeId} className="card-paper flex flex-col gap-3 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{theme.emoji}</span>
                    <span className="font-kid text-lg text-ink">{theme.name}</span>
                  </div>
                  <span className="text-xs text-inkSoft">{tTime}</span>
                </div>

                <div>
                  <div className="mb-1 text-xs text-inkSoft">通关进度</div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink">{levelsPlayed.length}/{tLevels.length} 关</span>
                    <StarRow value={tStars} total={tMaxStars} size={14} />
                  </div>
                </div>

                <div>
                  <div className="mb-1 text-xs text-inkSoft">知识点</div>
                  <div className="flex flex-wrap gap-1">
                    {tConcepts.map(({ concept, stat }) => (
                      <span
                        key={concept.id}
                        className={cn(
                          "tag text-xs",
                          stat?.status === "mastered"
                            ? "bg-basil/15 text-basil"
                            : stat?.status === "practicing"
                            ? "bg-cheese/20 text-cheeseDeep"
                            : "bg-dough/15 text-inkSoft"
                        )}
                      >
                        {concept.name}
                        {stat?.status === "mastered" && " ✓"}
                      </span>
                    ))}
                  </div>
                </div>

                {tErrors.length > 0 && (
                  <div>
                    <div className="mb-1 text-xs text-inkSoft">常错题型</div>
                    <div className="space-y-1">
                      {tErrors.slice(0, 2).map(({ type, stat }) => (
                        <div key={type} className="flex items-center justify-between text-xs">
                          <span className="text-ink">{ERROR_TYPE_LABELS[type]}</span>
                          <span className="text-tomato">错 {stat.errorCount} 次</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tMastered.length > 0 && (
                  <div className="rounded-lg bg-basil/10 p-2 text-xs text-basil">
                    🎉 已掌握 {tMastered.length} 个知识点
                  </div>
                )}
              </div>
            );
          })}
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
