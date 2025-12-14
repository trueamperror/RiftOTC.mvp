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
        <div className="flex flex-col h-[400px] bg-card/50 border border-border rounded-xl overflow-hidden font-mono">
            {/* Header */}
            <div className="p-4 border-b border-border bg-muted/20 flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">AI Analyst Chat</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"
                            }`}
                    >
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-border ${msg.role === "user" ? "bg-primary/20 text-primary" : "bg-secondary/50 text-secondary-foreground"
                                }`}
                        >
                            {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                        </div>
                        <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.role === "user"
                                ? "bg-primary/10 text-foreground border border-primary/20 rounded-tr-sm"
                                : "bg-card border border-border text-foreground rounded-tl-sm"
                                }`}
                        >
                            {msg.role === "user" ? (
                                <span className="text-foreground">{msg.content}</span>
                            ) : (
                                <div className="prose prose-invert prose-sm max-w-none prose-p:text-foreground prose-a:text-primary">
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center shrink-0 border border-border">
                            <Bot size={16} className="text-secondary-foreground" />
                        </div>
                        <div className="bg-card border border-border px-4 py-2 rounded-2xl rounded-tl-sm">
                            <div className="flex gap-1 h-5 items-center">
                                <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" />
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
                        className="whitespace-nowrap px-3 py-1 rounded-full bg-secondary/30 border border-border text-xs text-muted-foreground hover:bg-primary/20 hover:text-primary hover:border-primary/50 transition-all font-mono"
                    >
                        {preset}
                    </button>
                ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-muted/10">
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="flex-1 bg-input/50 border border-border rounded-lg px-4 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground transition-all"
                        placeholder="Ask about the token..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        disabled={isLoading}
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={isLoading || !input.trim()}
                        className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground p-2 rounded-lg transition-colors shadow-[0_0_10px_rgba(0,212,255,0.2)]"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div >
    );
}
