import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckSquare, Square, Trash2, Calendar, Award, Clock, Plus, Sparkles, Loader2, ListTodo, AlertCircle, RefreshCw, BarChart, Trophy, Settings2 } from "lucide-react";
import { StudyTask, StudentProfile, DiagnosticSummary } from "../types";

interface TasksViewProps {
  tasks: StudyTask[];
  onAddTask: (title: string, category: string, dueDate?: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  profile: StudentProfile;
  onUpdateProfile: (profile: StudentProfile) => void;
  attemptCount: number;
}

export default function TasksView({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  profile,
  onUpdateProfile,
  attemptCount,
}: TasksViewProps) {
  // Local profile states
  const [localScore, setLocalScore] = useState(profile.targetScore);
  const [localMins, setLocalMins] = useState(profile.dailyMinutes);
  const [localDate, setLocalDate] = useState(profile.examDate);

  // New task form fields
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("一般學習");
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));

  // AI Diagnostic states
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);
  const [diagnosticError, setDiagnosticError] = useState<string | null>(null);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticSummary | null>(null);

  // Calculate task completions
  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.completedAt).length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Sync state if parent updates profile
  useEffect(() => {
    setLocalScore(profile.targetScore);
    setLocalMins(profile.dailyMinutes);
    setLocalDate(profile.examDate);
  }, [profile]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      targetScore: localScore,
      dailyMinutes: localMins,
      examDate: localDate,
    });
  };

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask(newTitle.trim(), newCategory, newDate);
    setNewTitle("");
  };

  // Triggers Gemini AI diagnostics in full context (profile, task lists, attempts counters)
  const handleGenerateDiagnostics = async () => {
    setDiagnosticLoading(true);
    setDiagnosticError(null);
    setDiagnosticResult(null);

    try {
      // Gather list of recent attempts of quiz (can query /api/quiz/stats or pass generic stats)
      const attemptsStatsRes = await fetch("/api/quiz/stats");
      let attemptStats: any = {};
      try {
        const text = await attemptsStatsRes.text();
        attemptStats = text ? JSON.parse(text) : {};
      } catch (e) {
        // ignore
      }

      const res = await fetch("/api/assistant/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: {
            targetScore: profile.targetScore,
            dailyMinutes: profile.dailyMinutes,
            examDate: profile.examDate
          },
          tasks: tasks.map(t => ({ title: t.title, category: t.category, completed: !!t.completedAt })),
          attempts: attemptStats.history || []
        }),
      });

      let data: any = {};
      const text = await res.text();
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        console.error("Invalid JSON:", text);
      }

      if (!res.ok) {
        throw new Error(data?.error || `AI 綜合診斷生成失敗 (Status: ${res.status})`);
      }

      setDiagnosticResult(data);
    } catch (err: any) {
      console.error(err);
      setDiagnosticError(err.message || "診斷伺服器連線超時，請檢查 GoogleGenAI 服務與環境變數。");
    } finally {
      setDiagnosticLoading(false);
    }
  };

  const handleQuickAddDiagnosticsTasks = () => {
    if (!diagnosticResult) return;
    diagnosticResult.nextTasks.forEach(recTask => {
      onAddTask(`AI 推薦複習: ${recTask}`, "AI 診斷推薦", profile.examDate);
    });
    setDiagnosticResult(null); // Reset diagnostic result so they can see new state of tasks!
  };

  return (
    <div className="space-y-8" id="tasks-view-container">
      {/* Title */}
      <div className="border-b border-cosmic-800 pb-3">
        <h2 className="text-xl font-display font-semibold text-slate-100 flex items-center gap-2">
          <span className="w-1.5 h-6 rounded bg-red-500 block"></span>
          日常學習目標與複習進度 (Study Tasks)
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          設定您的多益目標成績與每日時間，並由 Nexora AI 融合單字與錯題歷史引導您的每日練習節奏
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Profile details */}
        <div className="lg:col-span-4 space-y-6">
          {/* Profile settings Form */}
          <div className="p-6 rounded-2xl bg-cosmic-900 border border-cosmic-800 space-y-5">
            <h3 className="text-sm font-display font-bold text-slate-200 flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-emerald-accent" />
              個人多益備考計畫
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Target score slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">多益目標分數</span>
                  <span className="text-emerald-accent font-display font-bold text-sm">{localScore} 分</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="990"
                  step="5"
                  value={localScore}
                  onChange={(e) => setLocalScore(Number(e.target.value))}
                  className="w-full accent-emerald-accent bg-cosmic-950 h-2 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>100 (基礎)</span>
                  <span>550 (綠證)</span>
                  <span>730 (藍證)</span>
                  <span>860 (金證之門)</span>
                  <span>990 (滿分)</span>
                </div>
              </div>

              {/* Daily commitment slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">每日預期練習時數</span>
                  <span className="text-emerald-accent font-display font-bold text-sm">{localMins} 分鐘</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="180"
                  step="5"
                  value={localMins}
                  onChange={(e) => setLocalMins(Number(e.target.value))}
                  className="w-full accent-emerald-accent bg-cosmic-950 h-2 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>10 分</span>
                  <span>45 分 (黃金帶)</span>
                  <span>90 分 (密集)</span>
                  <span>180 分 (衝刺)</span>
                </div>
              </div>

              {/* Exam Date */}
              <div className="space-y-1.5">
                <label className="block text-xs text-slate-400">期望多益考季日程</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="date"
                    value={localDate}
                    onChange={(e) => setLocalDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-cosmic-950 border border-cosmic-750 focus:outline-none focus:border-emerald-accent rounded-xl text-xs text-white cursor-pointer"
                  />
                </div>
              </div>

              {/* Submit update state button */}
              <button
                type="submit"
                className="w-full h-9 rounded-xl border border-emerald-accent/40 bg-emerald-accent/5 text-emerald-accent text-xs font-semibold hover:bg-emerald-accent hover:text-white transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1"
              >
                儲存備考計畫設定
              </button>
            </form>
          </div>

          {/* Practice statistics brief */}
          <div className="p-6 rounded-2xl bg-cosmic-900 border border-cosmic-800 space-y-4">
            <h3 className="text-sm font-display font-bold text-slate-200 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-450" />
              累積練習成果
            </h3>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="py-3 px-2 rounded-xl bg-cosmic-950/80 border border-cosmic-850">
                <span className="block text-emerald-accent font-display font-bold text-lg">{attemptCount} 題</span>
                <span className="text-[10px] text-slate-500">已作答 Part 5 題</span>
              </div>
              <div className="py-3 px-2 rounded-xl bg-cosmic-950/80 border border-cosmic-850">
                <span className="block text-blue-400 font-display font-bold text-lg">{percent}%</span>
                <span className="text-[10px] text-slate-500">任務總完成率</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Active study task queue & diagnostics */}
        <section className="lg:col-span-8 space-y-6">
          {/* AI Diagnostics Summary Card Area */}
          <div className="p-6 rounded-2xl border border-amber-500/10 bg-gradient-to-br from-cosmic-900 to-cosmic-900/60 shadow-md space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1">
                <h3 className="font-display font-bold text-slate-100 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-450 animate-pulse" />
                  Nexora AI 整合備考學習診斷
                </h3>
                <p className="text-xs text-slate-400">
                  一鍵融會當前單字、學科與 Part 5 答題行為。利用 AI 提振弱點、生成明日排程建議。
                </p>
              </div>

              <button
                onClick={handleGenerateDiagnostics}
                disabled={diagnosticLoading}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-xs text-white font-medium rounded-xl transition-all shadow disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                {diagnosticLoading ? (
                  <>
                    <Loader2 className="w-3 animate-spin" />
                    診斷中...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3" />
                    產出 AI 學習診斷
                  </>
                )}
              </button>
            </div>

            {/* Diagnostic results render area */}
            <AnimatePresence mode="wait">
              {diagnosticLoading && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-4 border-t border-cosmic-800 space-y-3 flex flex-col items-center justify-center py-6"
                >
                  <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                  <p className="text-xs text-slate-400 font-mono">
                    Gemini 3.5 正在調閱您的文法偏誤與單字足跡...
                  </p>
                </motion.div>
              )}

              {diagnosticError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-4 border-t border-cosmic-800 flex gap-2 text-xs text-red-400"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{diagnosticError}</span>
                </motion.div>
              )}

              {diagnosticResult && !diagnosticLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="pt-4 border-t border-cosmic-800 space-y-4"
                  id="diagnostics-result-panel"
                >
                  {/* Summary paragraph */}
                  <div className="p-4 rounded-xl bg-cosmic-950 border border-cosmic-850 space-y-1.5">
                    <span className="text-[10px] font-mono text-amber-450 font-bold uppercase block">
                      AI 綜合學習評語
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed font-light font-sans">
                      {diagnosticResult.summary}
                    </p>
                  </div>

                  {/* Weaknesses and recommendations grids */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Weaknesses list */}
                    <div className="p-4 rounded-xl bg-cosmic-950 border border-cosmic-850 space-y-2">
                      <span className="text-[10px] font-mono text-red-400 font-bold uppercase block">
                        經評估您的目前弱點
                      </span>
                      <ul className="space-y-1.5">
                        {diagnosticResult.weaknesses.map((w, idx) => (
                          <li key={idx} className="text-xs text-slate-350 flex items-start gap-2 font-light">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1.5"></span>
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Next study tasks list with interactive action */}
                    <div className="p-4 rounded-xl bg-cosmic-950 border border-cosmic-850 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-emerald-accent font-bold uppercase block">
                          AI 推薦複習事項
                        </span>
                        <ul className="space-y-1.5">
                          {diagnosticResult.nextTasks.map((t, idx) => (
                            <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-accent shrink-0 mt-1.5"></span>
                              <span>{t}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        onClick={handleQuickAddDiagnosticsTasks}
                        className="w-full py-1.5 rounded-lg bg-emerald-accent/10 hover:bg-emerald-accent hover:text-white text-[10px] font-medium text-emerald-accent transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        一鍵匯入這些推薦為練習任務
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Active Tasks Queue block */}
          <div className="p-6 rounded-2xl bg-cosmic-900 border border-cosmic-800 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-display font-bold text-slate-200 flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-emerald-accent" />
                我的日常學習任務佇列
              </h3>

              {/* Progress counter */}
              <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                <span>{completedCount} / {totalCount} 已完成</span>
                <span className="font-bold text-emerald-accent">({percent}%)</span>
              </div>
            </div>

            {/* Custom progress bar */}
            <div className="w-full bg-cosmic-950 h-1.5 rounded-full overflow-hidden border border-cosmic-850 shadow-inner">
              <div
                className="bg-gradient-to-r from-emerald-accent to-emerald-400 h-full transition-all duration-300"
                style={{ width: `${percent}%` }}
              ></div>
            </div>

            {/* Form to insert custom study task */}
            <form onSubmit={handleAddNewTask} className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
              <input
                type="text"
                placeholder="在此新增您的複習小任務 (如: 多譯單字 20 個、整理形容詞詞尾)"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="md:col-span-6 px-3 py-2 bg-cosmic-950 border border-cosmic-750 focus:outline-none focus:border-emerald-accent/60 rounded-xl text-xs text-white"
              />

              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                className="md:col-span-3 px-3 py-2 bg-cosmic-950 border border-cosmic-750 focus:outline-none focus:border-emerald-accent/60 rounded-xl text-xs text-white cursor-pointer"
              >
                <option value="一般學習">一般學習</option>
                <option value="單字複習">單字複習</option>
                <option value="文法練習">文法練習</option>
                <option value="聽力特訓">聽力特訓</option>
                <option value="考前策略">考前策略</option>
              </select>

              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="md:col-span-3 h-9 rounded-xl bg-emerald-accent text-white hover:bg-emerald-hover text-xs font-semibold flex items-center justify-center gap-1 transition-all shadow disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                新加入任務
              </button>
            </form>

            {/* Task list render items */}
            <div className="space-y-2.5 pt-2 max-h-72 overflow-y-auto pr-1">
              <AnimatePresence>
                {tasks.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 font-light text-xs">
                    當前沒有安排學習任務，填寫上方表單可以新加入自主進度！
                  </div>
                ) : (
                  tasks.map(task => {
                    const isDone = !!task.completedAt;

                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                          isDone
                            ? "bg-cosmic-950/40 border-cosmic-850 text-slate-500"
                            : "bg-cosmic-950 border-cosmic-800 text-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Toggle complete button */}
                          <button
                            type="button"
                            onClick={() => onToggleTask(task.id)}
                            className="text-slate-400 hover:text-emerald-accent transition-colors shrink-0 outline-none cursor-pointer"
                          >
                            {isDone ? (
                              <CheckSquare className="w-4 h-4 text-emerald-accent" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>

                          <div className="min-w-0 space-y-1">
                            <span
                              className={`text-xs md:text-sm block truncate ${isDone ? "line-through font-light" : "font-normal"}`}
                            >
                              {task.title}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono uppercase">
                              <span className="bg-cosmic-900 border border-cosmic-800 px-1.5 py-0.5 rounded text-emerald-accent/80">
                                {task.category}
                              </span>
                              <span> due: {task.dueDate}</span>
                            </div>
                          </div>
                        </div>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => onDeleteTask(task.id)}
                          className="p-1 px-2 rounded hover:bg-red-500/10 text-slate-550 hover:text-red-400 transition-colors shrink-0 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
