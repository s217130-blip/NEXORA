import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileText, Loader2, Play, Sparkles, Check, X, Info, HelpCircle, Plus, AlertCircle, BookOpen } from "lucide-react";
import { QuizQuestion } from "../types";

interface QuizViewProps {
  onAddTask: (title: string, category: string) => void;
  onAttemptSubmitted: () => void;
}

export default function QuizView({ onAddTask, onAttemptSubmitted }: QuizViewProps) {
  const [category, setCategory] = useState("商務會議 (Meetings)");
  const [difficulty, setDifficulty] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState<QuizQuestion | null>(null);

  // Answering states
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [addedVocabs, setAddedVocabs] = useState<Record<string, boolean>>({});

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setQuestion(null);
    setSelectedOption(null);
    setChecked(false);

    try {
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, difficulty }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "生成考題時發生錯誤");
      }

      setQuestion(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "出題伺服器連線超時，請檢查伺服器狀態。");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAnswer = async () => {
    if (!question || !selectedOption || checked) return;

    setChecked(true);
    const correct = selectedOption === question.answer;

    try {
      // Save result logging to backend so Console stats stay updated dynamically
      await fetch("/api/quiz/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: "dynamic",
          questionText: question.question,
          chosenAnswer: selectedOption,
          correctAnswer: question.answer,
          correct,
          skill: question.skill,
        }),
      });

      // Raise trigger so parent component triggers stats refresh
      onAttemptSubmitted();
    } catch (err) {
      console.error("Failed to commit quiz attempt state:", err);
    }
  };

  const handleAddVocabToTasks = (wordWithTranslation: string) => {
    onAddTask(`記誦考題生字: "${wordWithTranslation}"`, "生字背誦");
    setAddedVocabs(prev => ({ ...prev, [wordWithTranslation]: true }));
    setTimeout(() => {
      setAddedVocabs(prev => ({ ...prev, [wordWithTranslation]: false }));
    }, 3000);
  };

  return (
    <div className="space-y-6" id="quiz-view-container">
      {/* View Header */}
      <div className="border-b border-cosmic-800 pb-3">
        <h2 className="text-xl font-display font-semibold text-slate-100 flex items-center gap-2">
          <span className="w-1.5 h-6 rounded bg-emerald-accent block"></span>
          Part 5 智能對抗出題 (Part 5 Generator)
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          指定商業場景與難易度，由雲端 AI 針對文法弱點量身定制單句填空（簡短名詞、詞性辨析、語態時態、連词介系词）門檻考題
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side Controller */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-2xl bg-cosmic-900 border border-cosmic-800 space-y-4">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">出題配置面版</h4>

            {/* Topic dropdown */}
            <div className="space-y-2">
              <label className="block text-xs text-slate-400">仿真多益商務情境</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 bg-cosmic-950 border border-cosmic-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-accent cursor-pointer"
              >
                <option value="商務會議與會商 (Meetings & Discussions)">商務會議與會商</option>
                <option value="人事招募與就職 (Personnel & Recruitment)">人事招募與就職</option>
                <option value="辦公環境與內部通訊 (Office Communication)">辦公環境與內部通訊</option>
                <option value="採購合約與外包商議 (Purchasing & Contracts)">採購合約與外包商議</option>
                <option value="財務財報與投融審計 (Finance & Accounting)">財務財報與投融審計</option>
                <option value="旅遊物流與交通票務 (Travel & Logistics)">旅遊物流與交通票務</option>
              </select>
            </div>

            {/* Difficulty selectors */}
            <div className="space-y-2">
              <label className="block text-xs text-slate-400">期望難易度深度</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "easy", label: "基礎 (Easy)" },
                  { value: "medium", label: "核心 (Medium)" },
                  { value: "hard", label: "高分 (Hard)" }
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDifficulty(opt.value)}
                    disabled={loading}
                    className={`py-1.5 rounded-lg text-[10px] font-medium border transition-all cursor-pointer ${
                      difficulty === opt.value
                        ? "bg-emerald-accent/20 border-emerald-accent text-white"
                        : "bg-cosmic-950 border-cosmic-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {opt.label.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full h-10 rounded-xl bg-gradient-to-r from-emerald-accent to-emerald-500 hover:from-emerald-hover hover:to-emerald-600 text-white text-sm font-medium transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  智能出題中...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  生成單字/文法題
                </>
              )}
            </button>
          </div>

          <div className="p-4 rounded-xl bg-cosmic-900/30 border border-cosmic-800/80 text-xs text-slate-400 space-y-2 leading-relaxed">
            <div className="flex gap-2 text-slate-350 font-medium">
              <Info className="w-4 h-4 text-emerald-accent shrink-0" />
              <span>作答提示</span>
            </div>
            <p className="font-light">
              多益 Part 5 著重詞性辨析（字尾結尾如 -ment, -tive）、動詞時態與被動態，以及常考商業介系詞用法。本工具會隨時提供完整詳盡的文法解析。
            </p>
          </div>
        </aside>

        {/* Right Side Work Panel */}
        <section className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-80 rounded-2xl border border-cosmic-800 bg-cosmic-900/10 flex flex-col items-center justify-center space-y-4"
              >
                <Loader2 className="w-10 h-10 animate-spin text-emerald-accent" />
                <div className="text-center space-y-1">
                  <p className="text-slate-250 text-sm font-medium">正在為您進行智能出題...</p>
                  <p className="text-slate-450 text-xs font-light">
                    Gemini 3.5 正在校審題目，確保語調符合新制多益題型規範
                  </p>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="p-5 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-250 space-y-3 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-medium text-sm text-red-400">考題生成錯誤</h4>
                  <p className="text-xs text-red-350 leading-relaxed font-light">{error}</p>
                </div>
              </motion.div>
            )}

            {!loading && !question && !error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-80 rounded-2xl border border-dashed border-cosmic-800 bg-cosmic-900/10 flex flex-col items-center justify-center space-y-2 text-slate-400"
              >
                <HelpCircle className="w-8 h-8 text-cosmic-700 animate-pulse-slow" />
                <p className="text-slate-400 text-sm font-light">請在左側選定考點並按下生成考題</p>
                <p className="text-slate-500 text-xs font-mono">Dynamic TOEIC Part 5 Generator</p>
              </motion.div>
            )}

            {question && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
                id="active-question-board"
              >
                {/* Question sentence main block */}
                <div className="p-6 rounded-2xl bg-cosmic-900 border border-cosmic-800 space-y-4 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono bg-cosmic-950 font-bold px-2 py-0.5 rounded text-emerald-accent border border-cosmic-805 uppercase tracking-wide">
                      Test Point: {question.skill}
                    </span>
                    <span className="text-xs text-slate-450 font-mono capitalize">
                      難度: {question.difficulty}
                    </span>
                  </div>

                  <p className="text-base md:text-lg text-slate-100 font-medium font-sans leading-relaxed pt-2">
                    {question.question}
                  </p>
                </div>

                {/* Multiple choice options grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="active-choices-grid">
                  {(Object.keys(question.options) as Array<"A" | "B" | "C" | "D">).map(choiceKey => {
                    const isSelected = selectedOption === choiceKey;
                    const isCorrect = checked && question.answer === choiceKey;
                    const isWrongChoice = checked && isSelected && selectedOption !== question.answer;

                    return (
                      <button
                        key={choiceKey}
                        onClick={() => {
                          if (!checked) setSelectedOption(choiceKey);
                        }}
                        disabled={checked}
                        className={`p-4 rounded-xl text-left border flex items-center justify-between transition-all outline-none ${
                          isCorrect
                            ? "bg-emerald-accent/20 border-emerald-accent text-white"
                            : isWrongChoice
                            ? "bg-red-500/20 border-red-500 text-white"
                            : isSelected
                            ? "bg-blue-500/20 border-blue-500 text-white shadow"
                            : "bg-cosmic-900 border-cosmic-800 text-slate-300 hover:border-cosmic-600 hover:bg-cosmic-850 cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-lg text-xs font-bold font-mono flex items-center justify-center shrink-0 border ${
                              isCorrect
                                ? "bg-emerald-accent/30 border-emerald-accent text-white"
                                : isWrongChoice
                                ? "bg-red-500/30 border-red-500 text-white"
                                : isSelected
                                ? "bg-blue-500/30 border-blue-500 text-blue-300"
                                : "bg-cosmic-950 border-cosmic-800 text-slate-400"
                            }`}
                          >
                            {choiceKey}
                          </span>
                          <span className="text-sm font-sans">{question.options[choiceKey]}</span>
                        </div>

                        {/* Interactive suffix state badge */}
                        {isCorrect && <Check className="w-4 h-4 text-emerald-accent shrink-0" />}
                        {isWrongChoice && <X className="w-4 h-4 text-red-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Confirm answering row */}
                {!checked && (
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleCheckAnswer}
                      disabled={!selectedOption}
                      className="px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-xs text-white font-medium transition-all shadow disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      核對答案
                    </button>
                  </div>
                )}

                {/* Score panel & Explanation display details */}
                <AnimatePresence>
                  {checked && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-5 overflow-hidden"
                      id="quiz-explanation-card"
                    >
                      {/* Accurate block indicator banner */}
                      <div
                        className={`p-4 rounded-xl border flex items-center gap-3 ${
                          selectedOption === question.answer
                            ? "bg-emerald-accent/10 border-emerald-accent/20 text-emerald-accent"
                            : "bg-red-500/10 border-red-500/20 text-red-400"
                        }`}
                      >
                        {selectedOption === question.answer ? (
                          <>
                            <Check className="w-5 h-5 shrink-0" />
                            <div>
                              <p className="font-semibold text-sm">恭喜！作答正確</p>
                              <p className="text-xs text-slate-300 mt-0.5">順利解開該多益文法考點題</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <X className="w-5 h-5 shrink-0" />
                            <div>
                              <p className="font-semibold text-sm">作答錯誤，再接再厲！</p>
                              <p className="text-xs text-slate-350 mt-0.5">
                                正確答案為 <span className="font-bold underline">{question.answer}</span>。請詳閱下方文法解析。
                              </p>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Traditional Chinese Translation */}
                      <div className="p-5 rounded-2xl bg-cosmic-900 border border-cosmic-800 space-y-2">
                        <h4 className="text-xs font-display font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wide">
                          <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                          中文句意翻譯 (Translation)
                        </h4>
                        <p className="text-sm text-slate-100 font-light leading-relaxed pl-1">
                          {question.translation}
                        </p>
                      </div>

                      {/* Academic grammar layout logic */}
                      <div className="p-5 rounded-2xl bg-cosmic-900 border border-cosmic-800 space-y-2">
                        <h4 className="text-xs font-display font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wide">
                          <Info className="w-3.5 h-3.5 text-purple-400" />
                          解題文法詳解 (Analysis)
                        </h4>
                        <p className="text-sm text-slate-350 leading-relaxed font-light pl-1">
                          {question.explanation}
                        </p>
                      </div>

                      {/* Vocabulary list assistance */}
                      {question.vocabTips && question.vocabTips.length > 0 && (
                        <div className="p-5 rounded-2xl bg-cosmic-900 border border-cosmic-800 space-y-3">
                          <h4 className="text-xs font-display font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wide">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            考題核心生字延伸 (Vocabulary Notes)
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {question.vocabTips.map((v, i) => (
                              <div
                                key={i}
                                className="p-2.5 rounded-xl bg-cosmic-950 border border-cosmic-850/60 flex items-center justify-between text-xs gap-3"
                              >
                                <span className="font-mono text-slate-200 font-medium truncate select-all">{v}</span>
                                <button
                                  onClick={() => handleAddVocabToTasks(v)}
                                  className={`px-2 py-1 rounded text-[10px] font-medium transition-all shrink-0 cursor-pointer ${
                                    addedVocabs[v]
                                      ? "bg-emerald-accent/20 text-white"
                                      : "bg-cosmic-850 hover:bg-emerald-accent/10 hover:text-emerald-accent text-slate-400"
                                  }`}
                                >
                                  {addedVocabs[v] ? "已加" : "新加字"}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action block for next round */}
                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          onClick={handleGenerate}
                          className="px-5 h-9 bg-gradient-to-r from-emerald-accent to-emerald-500 hover:from-emerald-hover hover:to-emerald-600 text-xs text-white font-medium rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                        >
                          <Play className="w-3 h-3" />
                          再練一題 (Next Round)
                        </button>
                      </div>

                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}
