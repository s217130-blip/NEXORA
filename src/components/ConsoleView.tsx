import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Settings, BarChart2, Radio, Check, RefreshCcw, Database, Brain, Activity, Terminal } from "lucide-react";

interface ConsoleViewProps {
  statsStamp: number;
}

export default function ConsoleView({ statsStamp }: ConsoleViewProps) {
  const [stats, setStats] = useState<any>({
    total: 0,
    correctCount: 0,
    correctRate: 100,
    history: [],
    skillBreakdown: []
  });
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/quiz/stats");
      if (res.ok) {
        const text = await res.text();
        if (text) {
          const data = JSON.parse(text);
          setStats(data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger stats reload whenever user submits answers
  useEffect(() => {
    fetchStats();
  }, [statsStamp]);

  return (
    <div className="space-y-8" id="console-view-container">
      {/* View Title */}
      <div className="border-b border-cosmic-800 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-semibold text-slate-100 flex items-center gap-2">
            <span className="w-1.5 h-6 rounded bg-purple-500 block"></span>
            後台雲端監控主機 (Backend Console)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            視覺化探查代理中樞。查看 D1 同步端、DQL 分流以及來自作答紀錄的反饋統計
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={loading}
          className="p-2 rounded-xl bg-cosmic-900 border border-cosmic-800 hover:border-emerald-accent/50 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-xs"
        >
          <RefreshCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-accent" : ""}`} />
          <span>重新整理</span>
        </button>
      </div>

      {/* Grid of microservices status */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { name: "雲端辭典系統", status: "Cloud Ready", desc: "優先命中 Map 快取，無快取自動走 API 雙向生成詞目。", routes: ["POST /api/dictionary/search", "GET /api/dictionary/cache/:word"], active: true },
          { name: "雲端出題系統", status: "Cloud Ready", desc: "自選多益對焦情境與文法，每次答題均能立即累進其結果。", routes: ["POST /api/quiz/generate", "POST /api/quiz/attempt"], active: true },
          { name: "Nexora AI 助理", status: "Active System", desc: "安全環境變數保護。託管在 AI Studio 核心，提供 24h 語義解題。", routes: ["POST /api/assistant", "POST /api/assistant/summary"], active: true },
          { name: "日常任務同步", status: "D1 Ready", desc: "支援設定目標分數、倒數進度、自增任務或 AI 快刷匯入。", routes: ["GET /api/tasks", "POST /api/tasks/toggle"], active: true }
        ].map((service, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-cosmic-900 border border-cosmic-800 space-y-3 flex flex-col justify-between hover:border-cosmic-700 transition-colors shadow-sm">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-150">{service.name}</span>
                <span className="text-[10px] font-mono font-bold bg-emerald-accent/10 text-emerald-accent border border-emerald-accent/20 px-2 py-0.5 rounded-full select-none flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-accent animate-ping"></span>
                  {service.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-light leading-relaxed">
                {service.desc}
              </p>
            </div>

            <div className="pt-2 border-t border-cosmic-950 space-y-1">
              <span className="text-[9px] text-slate-500 font-mono uppercase block">路由網關暫託:</span>
              {service.routes.map((route, rIdx) => (
                <code key={rIdx} className="block text-[10px] font-mono text-purple-300 bg-cosmic-950 px-1.5 py-0.5 rounded leading-tight select-all">
                  {route}
                </code>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Analytics logs display row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Answers telemetry stats */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-cosmic-900 border border-cosmic-800 space-y-6">
          <h3 className="text-sm font-display font-bold text-slate-200 flex items-center gap-2 pb-2 border-b border-cosmic-800">
            <BarChart2 className="w-4 h-4 text-emerald-accent" />
            答題統計監控
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center bg-cosmic-950 p-4 rounded-xl border border-cosmic-850">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase font-mono">Part 5 答題次數</span>
                <span className="block text-2xl font-display font-bold text-white">{stats.total} 題</span>
              </div>
              <Radio className="w-6 h-6 text-emerald-accent/40 animate-pulse-slow shrink-0" />
            </div>

            <div className="flex justify-between items-center bg-cosmic-950 p-4 rounded-xl border border-cosmic-850">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase font-mono">綜合答對準確率</span>
                <span className="block text-2xl font-display font-bold text-white">{stats.correctRate}%</span>
              </div>
              <Check className="w-6 h-6 text-blue-500/40 shrink-0" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-cosmic-950 border border-cosmic-850 text-[11px] text-slate-450 leading-relaxed font-light">
            <Terminal className="w-4 h-4 text-slate-500 mb-1 inline-block mr-1.5 align-middle" />
            多益統計大腦每當學生在出題介面按下「核對答案」後，便會立刻更新。AI 整合診斷大腦即是在讀取此處的分布，產出您的極速弱點，具有動態串接的多頁式精妙架構。
          </div>
        </div>

        {/* Skill Category Breakdown & real logs */}
        <section className="lg:col-span-8 space-y-6">
          <div className="p-6 rounded-2xl bg-cosmic-900 border border-cosmic-800 space-y-4">
            <h3 className="text-sm font-display font-bold text-slate-200 flex items-center gap-2 pb-2 border-b border-cosmic-800">
              <Activity className="w-4 h-4 text-purple-400" />
              語法考點技能分布 (Learner Skill Matrix)
            </h3>

            {stats.skillBreakdown.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500 font-light">
                當前沒有作答紀錄，請到「Part 5 出題」答題後，便能看見答對率隨考題考點之精細分布！
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.skillBreakdown.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-cosmic-950 border border-cosmic-850 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-slate-200 font-display">{item.skill}</span>
                      <span className="text-[11px] text-slate-450 font-mono">
                        {item.correct} / {item.total} 題 ({item.rate}%)
                      </span>
                    </div>

                    <div className="w-full bg-cosmic-900 h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-400 h-full transition-all duration-300"
                        style={{ width: `${item.rate}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Real logs detail */}
          <div className="p-6 rounded-2xl bg-cosmic-900 border border-cosmic-800 space-y-3">
            <h3 className="text-sm font-display font-bold text-slate-200 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-accent" />
              實時作答流水日誌
            </h3>

            <div className="p-4 rounded-xl bg-cosmic-950 border border-cosmic-850 h-36 overflow-y-auto space-y-2 font-mono scroll-smooth text-[11px]">
              {stats.history.length === 0 ? (
                <div className="text-slate-600 font-light text-center py-6">
                  System state: [Listening on loop... No attempts logged]
                </div>
              ) : (
                stats.history.map((h: any, idx: number) => (
                  <div key={idx} className="text-slate-350 select-text hover:text-white transition-colors py-1 pl-2 border-l border-cosmic-800 hover:border-emerald-accent">
                    <span className="text-slate-500">[{new Date(h.createdAt).toLocaleTimeString()}]</span>{" "}
                    User submitted: answer <strong className={h.correct ? "text-emerald-accent" : "text-red-400"}>{h.chosenAnswer}</strong> (Accuracy: {h.correct ? "PASSED" : "FAILED"}). Topic skill: {h.skill}.
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
