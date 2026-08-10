import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send, Sparkles, User, Terminal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

function ChatAi({ problem }) {
    const [messages, setMessages] = useState([
        { role: 'model', parts: [{ text: "Hi! I am your AlgoSphere AI assistant. Ask me questions, request debugging help, or get hints on solving this challenge." }] }
    ]);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const onSubmit = async (data) => {
        const userMsg = { role: 'user', parts: [{ text: data.message }] };
        const updatedMessages = [...messages, userMsg];
        
        setMessages(updatedMessages);
        reset();
        setLoading(true);

        try {
            const response = await axiosClient.post("/ai/chat", {
                messages: updatedMessages,
                title: problem.title,
                description: problem.dscription,
                testCases: problem.visibleTestCases,
                startCode: problem.startcode
            });

            setMessages(prev => [...prev, { 
                role: 'model', 
                parts: [{ text: response.data.message }] 
            }]);
            
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
            }
        } catch (error) {
            console.error("API Error:", error);
            setMessages(prev => [...prev, { 
                role: 'model', 
                parts: [{ text: "Sorry, I encountered an issue compiling a response. Please try again." }]
            }]);
        } finally {
            setLoading(false);
        }
    };

    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
        }
    };

    const { ref, onChange, ...registerProps } = register("message", { required: true, minLength: 2 });

    return (
        <div className="flex flex-col h-full bg-zinc-950/20 text-zinc-100">
            
            {/* Header */}
            <div className="px-4 py-3 border-b border-zinc-800/80 bg-zinc-950/80 flex items-center gap-2">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5 rounded-lg text-white shadow-md shadow-indigo-500/10">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white leading-none">AlgoSphere AI Assistant</h3>
                <span className="text-[10px] text-zinc-500 font-medium">Gemini 2.0 Tutor Engine</span>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {messages.map((msg, index) => {
                    const isUser = msg.role === "user";
                    return (
                        <div key={index} className={`flex gap-3 items-start ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 ${
                              isUser 
                                ? 'bg-zinc-850 border-zinc-700 text-zinc-300' 
                                : 'bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border-purple-500/25 text-purple-400'
                            }`}>
                              {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                            </div>

                            {/* Message bubble */}
                            <div className={`max-w-[78%] rounded-2xl p-4 shadow-sm border text-sm leading-relaxed overflow-x-auto ${
                              isUser 
                                ? 'bg-gradient-to-br from-indigo-600 to-purple-600 border-none text-white rounded-tr-none' 
                                : 'bg-zinc-900 border-zinc-800/80 text-zinc-200 rounded-tl-none'
                            }`}>
                                <ReactMarkdown
                                    components={{
                                        pre: ({ node, ...props }) => (
                                          <pre className="bg-zinc-950 p-4 rounded-xl my-3 overflow-x-auto font-mono text-xs border border-zinc-850 leading-relaxed text-emerald-400" {...props} />
                                        ),
                                        code: ({ node, className, children, ...props }) => {
                                            const match = /language-(\w+)/.exec(className || '');
                                            return match ? (
                                                <code className="font-mono text-xs block" {...props}>{children}</code>
                                            ) : (
                                                <code className="bg-zinc-950 text-purple-300 border border-zinc-900 px-1.5 py-0.5 rounded font-mono text-xs mx-0.5" {...props}>{children}</code>
                                            );
                                        },
                                        p: ({ node, ...props }) => <p className="mb-2.5 last:mb-0" {...props} />,
                                        ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2.5 space-y-1" {...props} />,
                                        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2.5 space-y-1" {...props} />,
                                        li: ({ node, ...props }) => <li className="mb-0.5" {...props} />
                                    }}
                                >
                                    {msg.parts[0].text}
                                </ReactMarkdown>
                            </div>
                        </div>
                    );
                })}

                {/* Gemini typing loader bubble */}
                {loading && (
                    <div className="flex gap-3 items-start flex-row animate-pulse">
                        <div className="w-8 h-8 rounded-full border border-purple-500/25 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 flex items-center justify-center flex-shrink-0 text-purple-400">
                          <Sparkles className="w-4 h-4 animate-pulse" />
                        </div>
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-none px-4 py-3.5 shadow-sm flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form Footer */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-4 bg-zinc-950/80 border-t border-zinc-800/80">
                <div className="relative flex items-end bg-zinc-950 border border-zinc-800 focus-within:border-purple-500/80 rounded-xl px-3 py-2.5 shadow-inner transition-all duration-200">
                    <textarea 
                        placeholder="Ask AI for hints or debug code..." 
                        className="bg-transparent border-none text-zinc-100 placeholder-zinc-600 focus:ring-0 focus:outline-none flex-1 pr-10 resize-none leading-relaxed max-h-[160px] overflow-y-auto text-sm" 
                        rows={1}
                        ref={(e) => {
                            ref(e);
                            textareaRef.current = e;
                        }}
                        onChange={(e) => {
                            onChange(e);
                            adjustHeight();
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(onSubmit)();
                            }
                        }}
                        {...registerProps}
                    />
                    <button 
                        type="submit" 
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 p-2 rounded-lg transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center shadow-md hover:shadow-indigo-500/10"
                        disabled={loading}
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ChatAi;