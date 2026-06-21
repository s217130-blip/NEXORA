import React from "react";
import { motion } from "motion/react";
import { Search, FileText, MessageSquare, CheckSquare, Settings, ArrowRight, Award, Brain, Shield, Database } from "lucide-react";

interface HomeViewProps {
  onNavigate: (view: string) => void;
}

export default function HomeView({ onNavigate }: HomeViewProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12"
      id="home-view-container"
    >
      {/* Target Naming & Introduction Hero Banner */}
      <motion.section variants={itemVariants} className="text-center py-8 space-y-6 max-w-4xl mx-auto" id="hero-banner">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cosmic-800/80 border border-emerald-accent/30 text-emerald-accent text-sm font-display font-medium shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-accent animate-pulse"></span>
          Nexora Study Engine 2.5
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight text-white leading-tight">
          Nexora <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-accent to-emerald-400">AI 多益學習系統</span>
        </h1>
        <p className="text-base md:text-lg text-slate-350 leading-relaxed font-light select-none">
          全新型域的商業英語學習助手。前端完全代理、安全隱匿 API 密鑰。藉由 Gemini 釋放自主學習動能，
          提供詞義 X 光多頻解析、Part 5 文法智能自適應出題以及 AI 一對一教學諮詢服務。
        </p>

        {/* Feature Stat Counter Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 text-center">
          {[
            { metric: "AI Core", label: "個人化助理中樞" },
            { metric: "Cloud Quiz", label: "考點動態生成" },
            { metric: "Taiwan Lexicon", label: "權威繁中詞庫" },
            { metric: "DB Tasks", label: "任務自動同步" }
          ].map((stat, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-cosmic-900 border border-cosmic-800 shadow-sm">
              <div className="text-emerald-accent font-display font-bold text-xl md:text-2xl">{stat.metric}</div>
              <div className="text-slate-400 text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Primary Navigation Cards */}
      <motion.section variants={itemVariants} className="space-y-6">
        <div className="flex items-center justify-between border-b border-cosmic-800 pb-3">
          <h2 className="text-xl font-display font-semibold text-slate-100 flex items-center gap-2">
            <span className="w-1.5 h-6 rounded bg-emerald-accent block"></span>
            多功能多頁學習終端
          </h2>
          <span className="text-xs text-slate-400 font-mono">4 core modules</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Word Scanner */}
          <div
            onClick={() => onNavigate("vocabulary")}
            className="group p-6 rounded-2xl bg-cosmic-900/60 border border-cosmic-800/80 hover:border-emerald-accent/40 cursor-pointer transition-all duration-300 shadow-md hover:bg-cosmic-900 glow-on-hover hover:-translate-y-1"
            id="nav-card-scanner"
          >
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                <Search className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300">Lexicon X-Ray</span>
            </div>
            <div className="mt-5 space-y-2">
              <h3 className="text-lg font-display font-medium text-slate-100 group-hover:text-emerald-accent transition-colors">
                單字字彙智慧掃描
              </h3>
              <p className="text-sm text-slate-400 font-light leading-relaxed">
                結合自建與雲端詞庫，全面診斷單字多益考頻、多重含義、台灣繁中解析、字根拆解與商務情境例句。
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs text-emerald-accent font-medium group-hover:underline">
              開啟工具
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Part 5 Quiz */}
          <div
            onClick={() => onNavigate("quiz")}
            className="group p-6 rounded-2xl bg-cosmic-900/60 border border-cosmic-800/80 hover:border-emerald-accent/40 cursor-pointer transition-all duration-300 shadow-md hover:bg-cosmic-900 glow-on-hover hover:-translate-y-1"
            id="nav-card-quiz"
          >
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300">Generator</span>
            </div>
            <div className="mt-5 space-y-2">
              <h3 className="text-lg font-display font-medium text-slate-100 group-hover:text-emerald-accent transition-colors">
                Part 5 智能自適應出題
              </h3>
              <p className="text-sm text-slate-400 font-light leading-relaxed">
                自選採購公事、商務會談、旅行通勤等多益情境，生成專屬文法題、詳盡考點校正、翻譯以及難度分讀。
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs text-emerald-accent font-medium group-hover:underline">
              展開練習
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: AI Assistant */}
          <div
            onClick={() => onNavigate("assistant")}
            className="group p-6 rounded-2xl bg-cosmic-900/60 border border-cosmic-800/80 hover:border-emerald-accent/40 cursor-pointer transition-all duration-300 shadow-md hover:bg-cosmic-900 glow-on-hover hover:-translate-y-1"
            id="nav-card-assistant"
          >
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 transition-colors">
                <MessageSquare className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300">TOEIC Coach</span>
            </div>
            <div className="mt-5 space-y-2">
              <h3 className="text-lg font-display font-medium text-slate-100 group-hover:text-emerald-accent transition-colors">
                Nexora AI 互動學習助理
              </h3>
              <p className="text-sm text-slate-400 font-light leading-relaxed">
                隨時貼錯題拆解、問辨析詞根、或客製多益衝刺計畫。陪伴式口吻教學，極速弭平多益文法與句型盲區。
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs text-emerald-accent font-medium group-hover:underline">
              諮詢助理
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Study Tasks */}
          <div
            onClick={() => onNavigate("tasks")}
            className="group p-6 rounded-2xl bg-cosmic-900/60 border border-cosmic-800/80 hover:border-emerald-accent/40 cursor-pointer transition-all duration-300 shadow-md hover:bg-cosmic-900 glow-on-hover hover:-translate-y-1"
            id="nav-card-tasks"
          >
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-xl bg-red-500/10 text-red-400 group-hover:bg-red-500/20 transition-colors">
                <CheckSquare className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-red-500/10 text-red-300">Syllabus Sync</span>
            </div>
            <div className="mt-5 space-y-2">
              <h3 className="text-lg font-display font-medium text-slate-100 group-hover:text-emerald-accent transition-colors">
                學習計畫與任務面板
              </h3>
              <p className="text-sm text-slate-400 font-light leading-relaxed">
                自設多益目標分數與倒數日程，結合 AI 一鍵式整合歷史診斷（綜合查詞與答題狀態），推斷明日複習規劃。
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs text-emerald-accent font-medium group-hover:underline">
              設定計畫
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Technology architecture & Core logic */}
      <motion.section variants={itemVariants} className="space-y-6">
        <div className="border-b border-cosmic-800 pb-3">
          <h2 className="text-xl font-display font-semibold text-slate-100 flex items-center gap-2">
            <span className="w-1.5 h-6 rounded bg-emerald-accent block"></span>
            系統研發架構
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-cosmic-900/40 border border-cosmic-800/60 space-y-3">
            <div className="flex items-center gap-2.5 text-emerald-accent">
              <Database className="w-5 h-5 animate-pulse" />
              <h4 className="font-display font-medium text-slate-200">雲端混合辭典層</h4>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed font-light">
              自建與授權兩段詞庫代理。本地 map 命中可立即在 10 毫秒內輸出，無快取則自動交由 API 後端，快取快放降耗。
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-cosmic-900/40 border border-cosmic-800/60 space-y-3">
            <div className="flex items-center gap-2.5 text-blue-400">
              <Brain className="w-5 h-5" />
              <h4 className="font-display font-medium text-slate-200">弱點自適應對焦</h4>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed font-light">
              後台透過記錄錯題種類、頻次以及完成日，自動回傳至 Prompt 的 weakness 欄位中，達成對抗性出題的核心成果。
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-cosmic-900/40 border border-cosmic-800/60 space-y-3">
            <div className="flex items-center gap-2.5 text-purple-400">
              <Shield className="w-5 h-5" />
              <h4 className="font-display font-medium text-slate-200">後台 API 保護傘</h4>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed font-light">
              前端完全沒有放置任何 API 金鑰，不造成任何瀏覽器漏洞。金鑰完全存放在 AI Studio 伺服器的安全環境變數中代理。
            </p>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
