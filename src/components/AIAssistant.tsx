import { Bot, Send, Sparkles, UserRound } from "lucide-react";
import { assistantMessages } from "../data/mockData";

export function AIAssistant() {
  return (
    <aside className="glass-panel flex h-full min-h-[560px] flex-col rounded-2xl">
      <div className="border-b border-white/10 p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-blue-500 text-slate-950 shadow-glow">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-semibold text-white">AI RCA Assistant</h2>
            <p className="text-xs text-slate-400">Simulated analysis conversation</p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-auto p-5">
        {assistantMessages.map((message, index) => {
          const isAssistant = message.role === "assistant";
          return (
            <div key={`${message.role}-${index}`} className={`flex gap-3 ${isAssistant ? "" : "justify-end"}`}>
              {isAssistant ? (
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cyan-400/15 text-cyan-100">
                  <Sparkles className="h-4 w-4" />
                </div>
              ) : null}
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                  isAssistant ? "border border-cyan-300/15 bg-cyan-400/10 text-slate-100" : "bg-white text-slate-950"
                }`}
              >
                {message.text}
              </div>
              {!isAssistant ? (
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-700 text-slate-100">
                  <UserRound className="h-4 w-4" />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-2">
          <input
            className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500"
            placeholder="Ask about RCA result..."
            aria-label="Ask assistant"
          />
          <button className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-300 text-slate-950 transition hover:bg-cyan-200" aria-label="Send message">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
