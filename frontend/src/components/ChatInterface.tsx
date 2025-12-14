"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { TokenAnalysis } from "@/types";

interface ChatInterfaceProps {
    tokenContext: TokenAnalysis;
    apiBaseUrl?: string;
}

interface Message {
    role: "user" | "assistant";
    content: string;
}

export function ChatInterface({ tokenContext, apiBaseUrl = "http://localhost:8000" }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: tokenContext.reasoning || "I've analyzed the token. Ask me anything about the scores or risks!"
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (manualInput?: string) => {
        const textToSend = manualInput || input;
        if (!textToSend.trim() || isLoading) return;

        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: textToSend }]);
        setIsLoading(true);

        try {
            const response = await fetch(`${apiBaseUrl}/api/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: textToSend,
                    token_context: tokenContext,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to send message");
            }

            const data = await response.json();
            setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
        } catch (error) {
            console.error(error);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Sorry, I encountered an error answering that." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[400px] bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-zinc-800 bg-zinc-900 flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-400" />
                <span className="font-semibold text-zinc-100">AI Analyst Chat</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"
                            }`}
                    >
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-indigo-600" : "bg-emerald-600"
                                }`}
                        >
                            {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                        </div>
                        <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.role === "user"
                                ? "bg-indigo-600/20 text-indigo-100 border border-indigo-500/30 rounded-tr-sm"
                                : "bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-tl-sm"
                                }`}
                        >
                            {msg.role === "user" ? (
                                msg.content
                            ) : (
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
                            <Bot size={16} />
                        </div>
                        <div className="bg-zinc-800 border border-zinc-700 px-4 py-2 rounded-2xl rounded-tl-sm">
                            <div className="flex gap-1 h-5 items-center">
                                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Presets */}
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                {["Explain risks", "Technical analysis", "Future price prediction", "Is it a scam?"].map((preset) => (
                    <button
                        key={preset}
                        onClick={() => handleSend(preset)}
                        className="whitespace-nowrap px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-xs text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-colors"
                    >
                        {preset}
                    </button>
                ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-zinc-100 placeholder-zinc-500"
                        placeholder="Ask about the token..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        disabled={isLoading}
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={isLoading || !input.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div >
    );
}
