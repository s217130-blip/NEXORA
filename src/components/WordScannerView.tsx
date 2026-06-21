import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Loader2, Sparkles, BookOpen, AlertCircle, Plus, Check, ChevronRight, Share2 } from "lucide-react";
import { WordEntry } from "../types";

interface WordScannerViewProps {
  onAddTask: (title: string, category: string) => void;
}

export default function WordScannerView({ onAddTask }: WordScannerViewProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WordEntry | null>(null);
  const [addedTasks, setAddedTasks] = useState<Record<string, boolean>>({});

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = query.trim();
    if (!clean) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/dictionary/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: clean }),
      });

      let data: any = {};
      const text = await res.text();
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        console.error("Invalid JSON:", text);
      }

      if (!res.ok) {
        throw new Error(data?.error || `請求失敗 (Status: ${res.status})`);
      }

      if (data.entry) {
        setResult(data.entry);
      } else {
        throw new Error("無法解析該單字的數據結構");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "伺服器連線中斷，請確認您的 AI Studio 環境狀態。");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = (word: string) => {
    setQuery(word);
    setTimeout(() => {
      // Simulate button click to force prompt search
      const button = document.getElementById("trigger-scan-btn");
      if (button) button.click();
    }, 50);
  };

  const handleAddToTasks = (word: string) => {
    onAddTask(`複習單字及片語: "${word}"`, "單字複習");
    setAddedTasks(prev => ({ ...prev, [word]: true }));
    setTimeout(() => {
      // Auto-clear success state
      setAddedTasks(prev => ({ ...prev, [word]: false }));
    }, 3000);
  };

  return (
    <div className="space-y-6" id="word-scanner-view-container">
      {/* Title block */}
      <div className="border-b border-cosmic-800 pb-3">
        <h2 className="text-xl font-display font-semibold text-slate-100 flex items-center gap-2">
          <span className="w-1.5 h-6 rounded bg-blue-500 block"></span>
          單字智慧掃描 (Vocabulary Scanner)
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          利用 Gemini 進行多益高頻詞彙的多維度分析，包含字根、一字多義、台灣繁中與商務句型
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Control Board */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-2xl bg-cosmic-900 border border-cosmic-800 space-y-4">
            <form onSubmit={handleSearch} className="space-y-3">
              <label className="block text-xs font-mono font-medium text-slate-400 uppercase tracking-widest">
                英文單字 / 片語
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="如: delegate, agenda, postpone..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="w-full px-4 py-2.5 bg-cosmic-950 border border-cosmic-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-accent/60 text-sm"
                  disabled={loading}
                />
                <button
                  type="submit"
                  id="trigger-scan-btn"
                  className="absolute right-2.5 top-2 p-1.5 text-slate-400 hover:text-emerald-accent transition-colors"
                  disabled={loading}
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="w-full h-10 rounded-xl bg-gradient-to-r from-emerald-accent to-emerald-500 hover:from-emerald-hover hover:to-emerald-600 text-white text-sm font-medium transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    正在進行多維掃描...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    開始智慧分析
                  </>
                )}
              </button>
            </form>

            <button
              onClick={() => {
                setQuery("");
                setResult(null);
                setError(null);
              }}
              className="w-full py-2 rounded-xl text-xs hover:bg-cosmic-800 border border-cosmic-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              清除當前查詢
            </button>
          </div>

          {/* Quick recommendations */}
          <div className="p-5 rounded-2xl bg-cosmic-900/40 border border-cosmic-800 md:space-y-3 space-y-2">
            <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              多益高頻單字推薦
            </h4>
            <div className="flex flex-wrap gap-2">
              {["adjourn", "collaborate", "implementation", "innovative", "reimburse", "procurement", "fluctuation"].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickSearch(item)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-cosmic-800 bg-cosmic-900 text-slate-300 hover:border-emerald-accent/50 hover:bg-cosmic-950 transition-all cursor-pointer"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Result Display */}
        <section className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-72 rounded-2xl border border-cosmic-800 bg-cosmic-900/10 flex flex-col items-center justify-center space-y-4"
              >
                <Loader2 className="w-10 h-10 animate-spin text-emerald-accent" />
                <div className="text-center space-y-1">
                  <p className="text-slate-250 text-sm font-medium">Gemini 3.5 正在讀取多益詞庫...</p>
                  <p className="text-slate-450 text-xs">分析字根字義、產出最符合職場的商務句型與音標</p>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="p-5 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-200 space-y-3 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-medium text-sm text-red-300">掃描單字失敗</h4>
                  <p className="text-xs text-red-200/80 leading-relaxed font-light">{error}</p>
                </div>
              </motion.div>
            )}

            {!loading && !result && !error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-72 rounded-2xl border border-dashed border-cosmic-800 bg-cosmic-900/10 flex flex-col items-center justify-center space-y-2 text-slate-400"
              >
                <Search className="w-8 h-8 text-cosmic-700 animate-pulse-slow" />
                <p className="text-slate-400 text-sm font-light">請在左側輸入英文單字展開分析</p>
                <p className="text-slate-500 text-xs font-mono">e.g. implementation</p>
              </motion.div>
            )}

            {result && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
                id="search-result-pane"
              >
                {/* Header card with name & frequency */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-cosmic-900 to-cosmic-900/60 border border-cosmic-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl md:text-3xl font-display font-bold text-white capitalize">{result.word}</h3>
                      <span className="text-sm font-mono text-slate-400 font-light bg-cosmic-950/80 px-2 py-0.5 rounded-lg border border-cosmic-800">
                        {result.phonetic}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-450 uppercase font-mono">多益考頻標籤:</span>
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                          result.toeicFreq === "high" || result.toeicFreq === "高"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : result.toeicFreq === "medium" || result.toeicFreq === "中"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        }`}
                      >
                        {result.toeicFreq.toUpperCase()} FREQUENCY
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddToTasks(result.word)}
                      className={`px-4 py-2 rounded-xl text-xs font-medium cursor-pointer flex items-center gap-1.5 transition-all outline-none border ${
                        addedTasks[result.word]
                          ? "bg-emerald-accent/20 border-emerald-accent text-white"
                          : "bg-emerald-accent/10 border-emerald-accent/30 text-emerald-accent hover:bg-emerald-accent hover:text-white"
                      }`}
                    >
                      {addedTasks[result.word] ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          已加入任務
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          新加入複習任務
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Meanings Block */}
                <div className="p-6 rounded-2xl bg-cosmic-900 border border-cosmic-800 space-y-4">
                  <h4 className="text-sm font-display font-semibold text-slate-100 flex items-center gap-2 pb-2 border-b border-cosmic-800">
                    <span className="w-1 h-4 rounded bg-emerald-accent block"></span>
                    詞類定義分析 ({result.meanings.length} 個釋義)
                  </h4>
                  <div className="divide-y divide-cosmic-800/60 space-y-3">
                    {result.meanings.map((meaning, idx) => (
                      <div key={idx} className="pt-3 first:pt-0 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold bg-cosmic-950 px-2 py-0.5 rounded text-emerald-accent border border-cosmic-800">
                            {meaning.pos}
                          </span>
                          <span className="text-base font-semibold text-slate-100">{meaning.zhDef}</span>
                        </div>
                        <p className="text-xs text-slate-400 font-light font-mono pl-2 border-l border-cosmic-700">
                          English: {meaning.engDef}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Root, Suffix & Memory aids */}
                {result.rootAnalysis && (
                  <div className="p-6 rounded-2xl bg-cosmic-900 border border-cosmic-800 space-y-3">
                    <h4 className="text-sm font-display font-semibold text-slate-100 flex items-center gap-2">
                      <span className="w-1 h-4 rounded bg-purple-500 block"></span>
                      字根與記憶拆解 (X-Ray Memorizer)
                    </h4>
                    <p className="text-sm text-slate-350 leading-relaxed font-light bg-cosmic-950 p-4 rounded-xl border border-cosmic-800/80">
                      {result.rootAnalysis}
                    </p>
                  </div>
                )}

                {/* Collocations List */}
                {result.collocations && result.collocations.length > 0 && (
                  <div className="p-6 rounded-2xl bg-cosmic-900 border border-cosmic-800 space-y-3">
                    <h4 className="text-sm font-display font-semibold text-slate-100 flex items-center gap-2">
                      <span className="w-1 h-4 rounded bg-amber-500 block"></span>
                      多益常見搭配詞與短語 (Collocations)
                    </h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {result.collocations.map((col, idx) => (
                        <li key={idx} className="p-3 rounded-xl bg-cosmic-950 border border-cosmic-800/60 text-xs text-slate-200 font-mono flex items-center gap-2">
                          <ChevronRight className="w-3 text-emerald-accent shrink-0" />
                          {col}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Business Example Sentences */}
                <div className="p-6 rounded-2xl bg-cosmic-900 border border-cosmic-800 space-y-4">
                  <h4 className="text-sm font-display font-semibold text-slate-100 flex items-center gap-2 pb-2 border-b border-cosmic-800">
                    <span className="w-1 h-4 rounded bg-blue-500 block"></span>
                    多益職場情境仿真例句
                  </h4>
                  <div className="space-y-4">
                    {result.examples.map((ex, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-cosmic-950 border border-cosmic-850 space-y-2 shadow-inner">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cosmic-850 text-blue-300 uppercase select-none">
                            Ctx: {ex.tag || "TOEIC"}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">Example #{idx + 1}</span>
                        </div>
                        <p className="text-sm text-slate-150 font-medium leading-relaxed font-sans">{ex.eng}</p>
                        <p className="text-sm text-emerald-accent/90 font-light leading-relaxed pl-1">{ex.zht}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}
