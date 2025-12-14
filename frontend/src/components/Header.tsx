"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/" },
  { name: "AI Analyzer", href: "/analyze" },
  { name: "Create Deal", href: "/deals/create" },
];

import { useState } from "react";

function WalletButton() {
  const [address, setAddress] = useState<string | null>(null);

  const connect = () => {
    // Mock connection
    setAddress("0x71C...9A21");
  };

  if (address) {
    return (
      <button
        className="px-4 py-2 rounded-lg bg-secondary text-primary text-sm font-medium border border-primary/20"
        onClick={() => setAddress(null)}
      >
        {address}
      </button>
    );
  }

  return (
    <button
      onClick={connect}
      className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
    >
      Connect Wallet
    </button>
  );
}

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">R</span>
              </div>
              <span className="font-bold text-xl">RIFT OTC</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === item.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-muted-foreground">Demo Mode</span>
            </div>
            {/* Wallet Button */}
            <WalletButton />
          </div>
        </div>
      </div>
    </header>
  );
}
