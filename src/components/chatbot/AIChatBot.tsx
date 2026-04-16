import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, Minimize2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const INITIAL_MESSAGE: Message = {
  id: '0',
  role: 'assistant',
  content: "Hi! I'm Orbi, your AI learning mentor. I can help you:\n\n• Find the right courses for your goals\n• Answer questions about our content\n• Guide your career path\n• Solve learning doubts\n\nWhat would you like to learn today?",
};

const QUICK_PROMPTS = [
  'Which course should I start with?',
  'How do I become a web developer?',
  'What are the best AI courses?',
  'Help me plan my career path',
];

const FALLBACK_RESPONSES: Record<string, string> = {
  default: "Great question! I'd recommend starting with our most popular courses. Head to the Courses page to explore what matches your goals. Is there a specific skill area you're interested in?",
  web: "For web development, I recommend starting with our 'Complete Web Development Bootcamp'. It covers HTML, CSS, JavaScript, React, and Node.js — everything you need to become a full-stack developer!",
  ai: "AI and ML are exciting fields! Our 'Machine Learning & AI Fundamentals' course is perfect for beginners. It uses Python, TensorFlow, and real-world projects to build solid foundations.",
  design: "For UI/UX Design, our 'UI/UX Design Masterclass' is excellent. You'll master Figma, design systems, and user research — all skills top companies are looking for.",
  career: "Career planning is all about skill stacking! Start with a foundational course in your area of interest, build projects, and earn certificates that showcase your abilities to employers. What field interests you most?",
  data: "Data science is one of the highest-paying fields! I'd suggest starting with 'Python for Data Science & Analytics' which covers pandas, visualization, and statistical analysis with real datasets.",
};

function getAIResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('web') || lower.includes('frontend') || lower.includes('html')) return FALLBACK_RESPONSES.web;
  if (lower.includes('ai') || lower.includes('machine learning') || lower.includes('ml')) return FALLBACK_RESPONSES.ai;
  if (lower.includes('design') || lower.includes('ui') || lower.includes('ux')) return FALLBACK_RESPONSES.design;
  if (lower.includes('career') || lower.includes('job') || lower.includes('path')) return FALLBACK_RESPONSES.career;
  if (lower.includes('data') || lower.includes('python') || lower.includes('analytics')) return FALLBACK_RESPONSES.data;
  return FALLBACK_RESPONSES.default;
}

export default function AIChatBot() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && !minimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, minimized]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return;
    setInput('');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    if (user) {
      await supabase.from('chat_messages').insert({ user_id: user.id, role: 'user', content });
    }

    await new Promise(r => setTimeout(r, 800 + Math.random() * 500));

    let aiContent: string;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ message: content, history: messages.slice(-6) }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        aiContent = data.reply || getAIResponse(content);
      } else {
        aiContent = getAIResponse(content);
      }
    } catch {
      aiContent = getAIResponse(content);
    }

    const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: aiContent };
    setMessages(prev => [...prev, aiMsg]);

    if (user) {
      await supabase.from('chat_messages').insert({ user_id: user.id, role: 'assistant', content: aiContent });
    }

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-2xl shadow-2xl shadow-teal-500/30 hover:shadow-teal-500/50 hover:scale-105 transition-all"
        >
          <div className="relative">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
          </div>
          <span className="font-medium text-sm">Ask Orbi AI</span>
        </button>
      )}

      {open && (
        <div className={`fixed bottom-6 right-6 z-50 flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300 ${
          minimized ? 'h-14 w-80' : 'h-[580px] w-96 max-w-[calc(100vw-2rem)]'
        }`}>
          <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Orbi AI Mentor</p>
                {!minimized && (
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse" />
                    <span className="text-xs text-teal-100">Online</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setMinimized(!minimized)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                <Minimize2 className="w-4 h-4 text-white" />
              </button>
              <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                      msg.role === 'assistant' ? 'bg-gradient-to-br from-teal-500 to-cyan-500' : 'bg-slate-200 dark:bg-slate-700'
                    }`}>
                      {msg.role === 'assistant' ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />}
                    </div>
                    <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === 'assistant'
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                        : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-tr-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-sm">
                      <div className="flex gap-1 items-center">
                        {[0, 1, 2].map(i => (
                          <span key={i} className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {messages.length === 1 && (
                <div className="px-4 pb-2 flex flex-wrap gap-2">
                  {QUICK_PROMPTS.map(p => (
                    <button
                      key={p}
                      onClick={() => sendMessage(p)}
                      className="px-3 py-1.5 text-xs bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 rounded-full hover:bg-teal-500/20 transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}

              <div className="p-4 border-t border-slate-200 dark:border-slate-700 shrink-0">
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything..."
                    className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || loading}
                    className="p-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-400 text-center mt-2 flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3 text-teal-500" />
                  Powered by SkillOrbit AI
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
