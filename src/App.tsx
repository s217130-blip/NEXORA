import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, FileText, MessageSquare, CheckSquare, Settings, Menu, X, Brain, Activity, Clock, Award, ChevronRight, HelpCircle } from "lucide-react";

// Import custom views
import HomeView from "./components/HomeView";
import WordScannerView from "./components/WordScannerView";
import QuizView from "./components/QuizView";
import AssistantView from "./components/AssistantView";
import TasksView from "./components/TasksView";
import ConsoleView from "./components/ConsoleView";

// Import types
import { StudyTask, StudentProfile } from "./types";

export default function App() {
  const [activeView, setActiveView] = useState<string>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Stats and state synchronization trigger
  const [statsStamp, setStatsStamp] = useState<number>(0);
  const [attemptCount, setAttemptCount] = useState<number>(0);

  // Global user profile state (In-memory & synchronized to localStorage)
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem("NEXORA_PROFILE");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {
      targetScore: 730,
      dailyMinutes: 45,
      examDate: "2026-06-30"
    };
  });

  // Global tasks lists (Toggling items communicates with backend AND local state synchronously)
  const [tasks, setTasks] = useState<StudyTask[]>([]);

  // Fetch initial tasks database from server Express backend
  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const text = await res.text();
        if (text) {
          const data = JSON.parse(text);
          setTasks(data.tasks);
        }
      }
    } catch (err) {
      console.error("Failed to fetch initial tasks from backend:", err);
    }
  };

  // Sync tasks on mount
  useEffect(() => {
    fetchTasks();
    // Query initial attempt total count to display in badges
    fetchAttemptCount();
  }, []);

  const fetchAttemptCount = async () => {
    try {
      const res = await fetch("/api/quiz/stats");
      if (res.ok) {
        const text = await res.text();
        if (text) {
          const data = JSON.parse(text);
          setAttemptCount(data.total);
        }
      }
    } catch (err) {
      /* ignore */
    }
  };

  // Handle saving profile changes
  const handleUpdateProfile = (newProfile: StudentProfile) => {
    setProfile(newProfile);
    localStorage.setItem("NEXORA_PROFILE", JSON.stringify(newProfile));
  };

  // Create a new task in the Express backend
  const handleAddTask = async (title: string, category: string, dueDate?: string) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, dueDate }),
      });
      if (res.ok) {
        // Reload tasks lists from backend for authoritative data consistency
        fetchTasks();
      }
    } catch (err) {
      console.error("Failed to commit task insertion:", err);
    }
  };

  // Toggle completed status in backend
  const handleToggleTask = async (id: string) => {
    try {
      const res = await fetch("/api/tasks/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        fetchTasks();
      }
    } catch (err) {
      console.error("Failed to toggle task completeness:", err);
    }
  };

  // Delete task in backend
  const handleDeleteTask = async (id: string) => {
    try {
      const res = await fetch("/api/tasks/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        fetchTasks();
      }
    } catch (err) {
      console.error("Failed to remove task:", err);
    }
  };

  // Re-load statistics counts when answers are submitted
  const handleAttemptSubmitted = () => {
    setStatsStamp(prev => prev + 1);
    fetchAttemptCount();
  };

  // Navigation callbacks
  const handleNavigate = (view: string) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  // Render subview switches helper
  const renderView = () => {
    switch (activeView) {
      case "home":
        return <HomeView onNavigate={handleNavigate} />;
      case "vocabulary":
        return <WordScannerView onAddTask={handleAddTask} />;
      case "quiz":
        return <QuizView onAddTask={handleAddTask} onAttemptSubmitted={handleAttemptSubmitted} />;
      case "assistant":
        return <AssistantView />;
      case "tasks":
        return (
          <TasksView
            tasks={tasks}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            attemptCount={attemptCount}
          />
        );
      case "console":
        return <ConsoleView statsStamp={statsStamp} />;
      default:
        return <HomeView onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-cosmic-950 font-sans text-slate-100 selection:bg-emerald-accent/30 selection:text-white" id="main-application-frame">
      {/* Premium Gradient Top Border bar */}
      <div className="h-1 bg-gradient-to-r from-emerald-accent via-blue-500 to-purple-500 w-full shrink-0"></div>

      {/* Global Header Navigation bar */}
      <header className="sticky top-0 z-40 bg-cosmic-950/80 backdrop-blur-md border-b border-cosmic-900 px-4 py-3 shrink-0" id="global-header-navbar">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo and branding */}
          <div
            onClick={() => handleNavigate("home")}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 select-none group"
            id="brand-logo-trigger"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-accent to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10 group-hover:scale-105 transition-transform" id="brand-launcher">
              <Brain className="w-4 h-4 text-cosmic-950" />
            </div>
            <div>
              <span className="font-display font-bold tracking-tight text-lg text-white">Nexora</span>
              <span className="text-[10px] block text-emerald-accent leading-none font-mono tracking-widest font-medium uppercase mt-0.5">Study Pilot</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5" id="desktop-routing-nav">
            {[
              { id: "home", label: "首頁" },
              { id: "vocabulary", label: "單字智慧掃描" },
              { id: "quiz", label: "Part 5 智能出題" },
              { id: "assistant", label: "AI 學習助理" },
              { id: "tasks", label: "學習任務" },
              { id: "console", label: "後台主控台" }
            ].map(tab => {
              const active = activeView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleNavigate(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-250 cursor-pointer ${
                    active
                      ? "bg-cosmic-900 border border-cosmic-800 text-emerald-accent"
                      : "text-slate-400 hover:text-white hover:bg-cosmic-900/45 border border-transparent"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Right Area Settings status indicators */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cosmic-900 border border-cosmic-800 text-[10px] font-mono text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-accent animate-pulse"></span>
              雲端 AI 接管中
            </div>
          </div>

          {/* Touch Sized Responsive Mobile hamburger trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-cosmic-900 border border-cosmic-800 hover:text-white text-slate-450 h-11 w-11 flex items-center justify-center outline-none cursor-pointer"
            aria-label="選單導航"
            id="mobile-navigation-hamburger"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Floating Interactive Hamburger Drawer on mobile dimensions */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-cosmic-900 border-b border-cosmic-800 fixed top-[60px] left-0 w-full z-30 p-5 space-y-4"
            id="mobile-navigation-drawer"
          >
            <div className="flex flex-col gap-2">
              {[
                { id: "home", label: "首頁" },
                { id: "vocabulary", label: "單字智慧掃描" },
                { id: "quiz", label: "Part 5 智能出題" },
                { id: "assistant", label: "AI 學習助理" },
                { id: "tasks", label: "學習任務" },
                { id: "console", label: "後台控制台" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleNavigate(tab.id)}
                  className={`w-full py-2.5 px-4 rounded-xl text-left text-sm font-semibold transition-all ${
                    activeView === tab.id
                      ? "bg-cosmic-800 text-emerald-accent border-l-2 border-emerald-accent"
                      : "text-slate-400 hover:bg-cosmic-950 hover:text-slate-100"
                  }`}
                  style={{ minHeight: "44px" }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-cosmic-950 flex justify-between items-center text-[10px] font-mono text-slate-500">
              <span>Secure Fullstack Proxied</span>
              <span>v2.5.0</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container workspace with staggered animation entrances */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 select-none" id="main-content-layout">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            id="active-view-viewport"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer component standard */}
      <footer className="bg-cosmic-950 border-t border-cosmic-900 py-6 px-4 shrink-0 mt-12 text-slate-500 text-xs" id="footer-details">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-display">
            <span className="text-emerald-accent font-bold">●</span>
            <span className="text-slate-300 font-semibold uppercase tracking-wider">Nexora</span>
            <span>· 全方位多益 AI 學習大腦</span>
          </div>

          <div className="flex items-center bg-cosmic-900 border border-cosmic-850 px-3 py-1 rounded-full text-[10px] font-mono text-slate-400 gap-1.5 select-none shrink-0" id="footer-status-badge">
            <span>Server Proxy:</span>
            <span className="text-emerald-accent font-semibold uppercase">ONLINE</span>
            <span>·</span>
            <span>Vite Server Port:</span>
            <span className="text-blue-400">3000</span>
          </div>

          <div className="text-slate-600 font-light select-none text-center md:text-right">
            <span>© 2026 Nexora Study Engine. Crafted in Antigravity Fullstack Workspace</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
