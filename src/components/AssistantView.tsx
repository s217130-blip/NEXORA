import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Send, Sparkles, User, Loader2, ArrowRight, Zap, HelpCircle } from "lucide-react";
import { ChatMessage } from "../types";

// Clean, lightweight Custom Markdown-like text formatter to keep design gorgeous without raw markdown overhead
function ChatContentFormatter({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-2 text-sm leading-relaxed font-light text-slate-100 font-sans select-text">
      {lines.map((line, idx) => {
        let cleanLine = line.trim();

        // Check if Bullet point
        const isBullet = cleanLine.startsWith("-") || cleanLine.startsWith("*");
        if (isBullet) {
          cleanLine = cleanLine.substring(1).trim();
        }

        // Format bold text **text** => <strong>text</strong>
        // Simple regex replace for bold
        const boldRegex = /\*\*(.*?)\*\*/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = boldRegex.exec(cleanLine)) !== null) {
          if (match.index > lastIndex) {
            parts.push(cleanLine.substring(lastIndex, match.index));
          }
          parts.push(<strong key={match.index} className="font-semibold text-emerald-accent">{match[1]}</strong>);
          lastIndex = boldRegex.lastIndex;
        }
        if (lastIndex < cleanLine.length) {
          parts.push(cleanLine.substring(lastIndex));
        }

        const finalContent = parts.length > 0 ? parts : cleanLine;

        if (isBullet) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-3 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-accent shrink-0 mt-2"></span>
              <span className="text-sm font-light text-slate-200">{finalContent}</span>
            </div>
          );
        }

        if (cleanLine === "") {
          return <div key={idx} className="h-2"></div>;
        }

        return <p key={idx} className="pl-1 text-slate-150">{finalContent}</p>;
      })}
    </div>
  );
}

export default function AssistantView() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      content: "你好！我是你的 Nexora 多益學習 AI 教練。你可以直接貼多益錯題讓我為你分析文法、查詢一字多義、提供高頻词組，或者請我幫你量身定制 14 天的讀書衝刺計畫。請隨時在下方提問！",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || inputValue).trim();
    if (!textToSend || loading) return;

    if (!customText) setInputValue("");

    const userMessageDetail: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessageDetail]);
    setLoading(true);

    try {
      // Map history to server-side standard [{role: "user" | "model", content: "..."}]
      const historyPayload = messages.map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        content: msg.content
      }));

      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload
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
        throw new Error(data?.error || `學習助理連線失敗 (Status: ${res.status})`);
      }

      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-m`,
        role: "model",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-err`,
        role: "model",
        content: `⚠️ 出錯啦：${err.message || "伺服器超載。請重置對話，並檢查 Settings 中的 API Secrets。"}`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickChip = (text: string) => {
    handleSend(text);
  };

  return (
    <div className="space-y-6" id="assistant-view-container">
      {/* Title block */}
      <div className="border-b border-cosmic-800 pb-3">
        <h2 className="text-xl font-display font-semibold text-slate-100 flex items-center gap-2">
          <span className="w-1.5 h-6 rounded bg-amber-500 block"></span>
          Nexora AI 多益教練端 (TOEIC Coach Chat)
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          全天候搭載 Gemini 多益神經元。善用陪伴式學習口吻，協助您系統性突破文法偏誤與考前恐慌
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Suggestions Sidepanel */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-2xl bg-cosmic-900 border border-cosmic-800 space-y-4">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              高頻備考諮詢推薦
            </h4>

            <div className="space-y-2.5 flex flex-col">
              {[
                "幫我安排 14 天多益 Part 5 複習計畫",
                "我常錯介系詞題，要怎麼練？",
                "請用多益情境解釋 conference 和 convention 的差異",
                "新制多益 Part 5 的四大常規考點是什麼？"
              ].map((rec, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickChip(rec)}
                  disabled={loading}
                  className="p-3 text-left rounded-xl bg-cosmic-950 border border-cosmic-800 hover:border-emerald-accent/40 hover:bg-cosmic-900 text-xs text-slate-300 font-light hover:text-white transition-all cursor-pointer flex items-center justify-between group disabled:opacity-50"
                >
                  <span className="truncate pr-2">{rec}</span>
                  <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-accent group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-cosmic-900/30 border border-cosmic-800/80 text-xs text-slate-400 space-y-2">
            <div className="flex gap-2 text-slate-350 font-medium">
              <HelpCircle className="w-4 h-4 text-amber-450 shrink-0" />
              <span>為什麼是 Nexora AI？</span>
            </div>
            <p className="font-light leading-relaxed">
              與普通的通用聊天機器人不同，Nexora AI 固定了專屬的多益語意指引（Traditional Chinese system directives），避免生硬翻譯或偏離商業職場脈絡，能提供最精確的台灣備考建議。
            </p>
          </div>
        </aside>

        {/* Right Active Chat Pane */}
        <section className="lg:col-span-8 flex flex-col h-[520px] rounded-2xl bg-cosmic-900 border border-cosmic-800 overflow-hidden shadow-md">
          {/* Chat log body */}
          <div
            ref={scrollRef}
            className="flex-1 p-6 overflow-y-auto space-y-4 bg-cosmic-950/20"
            id="chat-message-log"
          >
            {messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id || idx}
                  className={`flex items-start gap-3.5 max-w-4xl ${isUser ? "flex-row-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-sm ${
                      isUser
                        ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                        : "bg-emerald-accent/10 border-emerald-accent/20 text-emerald-accent"
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  </div>

                  {/* Message bubble */}
                  <div className="space-y-1 max-w-[85%]">
                    <div className={`text-[10px] text-slate-500 font-mono ${isUser ? "text-right" : ""}`}>
                      {isUser ? "You" : "Nexora Coach"} · {msg.timestamp}
                    </div>

                    <div
                      className={`p-4 rounded-2xl border shadow-sm ${
                        isUser
                          ? "bg-cosmic-800 border-cosmic-700 rounded-tr-none text-slate-100"
                          : "bg-cosmic-900 border-cosmic-800 rounded-tl-none text-slate-100"
                      }`}
                    >
                      {isUser ? (
                        <p className="text-sm font-light select-text">{msg.content}</p>
                      ) : (
                        <ChatContentFormatter text={msg.content} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-emerald-accent/10 border border-emerald-accent/20 text-emerald-accent flex items-center justify-center shrink-0 animate-pulse">
                  <Sparkles className="w-4 h-4 text-emerald-accent" />
                </div>
                <div className="space-y-1.5 py-1">
                  <span className="text-[10px] text-slate-500 font-mono">Nexora Coach is thinking...</span>
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-accent" />
                    <span>多益教練大腦聯想中...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat user input bar */}
          <div className="p-4 bg-cosmic-900 border-t border-cosmic-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-3.5"
            >
              <input
                type="text"
                placeholder="在此輸入問題（如：比較 postpone 語意、文法解析、背字技巧）..."
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-cosmic-950 border border-cosmic-750 focus:outline-none focus:border-emerald-accent/70 rounded-xl text-sm text-slate-100 placeholder-slate-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !inputValue.trim()}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-accent text-white hover:bg-emerald-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
