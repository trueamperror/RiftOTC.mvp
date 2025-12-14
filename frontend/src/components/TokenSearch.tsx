"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { searchTokens, getTrendingTokens } from "@/lib/api";
import { TokenSearchResult } from "@/types";
import { cn } from "@/lib/utils";

interface TokenSearchProps {
  onSelect: (token: TokenSearchResult) => void;
  placeholder?: string;
  value?: string;
}

export function TokenSearch({
  onSelect,
  placeholder = "Search for a token...",
  value,
}: TokenSearchProps) {
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState<TokenSearchResult[]>([]);
  const [trending, setTrending] = useState<TokenSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load trending tokens on mount
  useEffect(() => {
    getTrendingTokens().then(setTrending).catch(console.error);
  }, []);

  // Search as user types
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const tokens = await searchTokens(query);
        setResults(tokens);
        setSelectedIndex(0);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayResults = query.length >= 2 ? results : trending;
  const showDropdown = isOpen && (displayResults.length > 0 || isLoading);

  const handleSelect = (token: TokenSearchResult) => {
    setQuery(token.name);
    setIsOpen(false);
    onSelect(token);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, displayResults.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (displayResults[selectedIndex]) {
          handleSelect(displayResults[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full"
      />

      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-80 overflow-auto">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Searching...
            </div>
          ) : (
            <>
              {query.length < 2 && (
                <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border">
                  Trending Tokens
                </div>
              )}
              {displayResults.map((token, index) => (
                <button
                  key={token.id}
                  onClick={() => handleSelect(token)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-secondary transition-colors",
                    index === selectedIndex && "bg-secondary"
                  )}
                >
                  {token.thumb ? (
                    <img
                      src={token.thumb}
                      alt={token.symbol}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {token.symbol.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{token.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {token.symbol.toUpperCase()}
                      {token.market_cap_rank && (
                        <span className="ml-2">#{token.market_cap_rank}</span>
                      )}
                    </p>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
