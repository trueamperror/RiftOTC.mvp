"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DealCard } from "@/components/DealCard";
import { getDeals, acceptDeal } from "@/lib/api";
import { Deal } from "@/types";

export default function DashboardPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("open");

  const loadDeals = async (status?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDeals(status === "all" ? undefined : status);
      setDeals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load deals");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDeals(activeTab);
  }, [activeTab]);

  const handleAcceptDeal = async (dealId: string) => {
    try {
      // Demo address for prototype
      const buyerAddress = "0xdemo123456789abcdef123456789abcdef123456";
      await acceptDeal(dealId, buyerAddress);
      // Reload deals
      loadDeals(activeTab);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept deal");
    }
  };

  const openDeals = deals.filter((d) => d.status === "open");
  const fundedDeals = deals.filter((d) => d.status === "funded");
  const completedDeals = deals.filter((d) => d.status === "completed");

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl font-bold">
          AI-Powered <span className="text-primary">OTC Trading</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Get discounted tokens with AI-analyzed deals. Short-term locks, instant savings.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open Deals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{openDeals.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Available for purchase
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Deals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{fundedDeals.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently locked
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedDeals.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Successfully closed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button asChild>
          <Link href="/deals/create">+ Create New Deal</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/analyze">Open AI Analyzer</Link>
        </Button>
      </div>

      {/* Deals List */}
      <div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="funded">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            <Button variant="ghost" size="sm" onClick={() => loadDeals(activeTab)}>
              Refresh
            </Button>
          </div>

          {error && (
            <div className="p-4 mb-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-card border-border animate-pulse">
                  <CardHeader className="pb-3">
                    <div className="h-10 bg-secondary rounded" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-20 bg-secondary rounded" />
                    <div className="h-8 bg-secondary rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : deals.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No deals found</p>
                <Button asChild>
                  <Link href="/deals/create">Create the first deal</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <TabsContent value={activeTab} className="mt-0">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {deals.map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    onAccept={deal.status === "open" ? handleAcceptDeal : undefined}
                  />
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
