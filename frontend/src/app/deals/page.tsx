"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DealCard } from "@/components/DealCard";
import { getDeals, acceptDeal } from "@/lib/api";
import { Deal } from "@/types";

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

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
      const buyerAddress = "0xdemo_buyer_" + Math.random().toString(36).slice(2, 10);
      await acceptDeal(dealId, buyerAddress);
      loadDeals(activeTab);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept deal");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">All Deals</h1>
          <p className="text-muted-foreground mt-1">Browse and manage OTC deals</p>
        </div>
        <Button asChild>
          <Link href="/deals/create">+ Create Deal</Link>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="funded">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
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
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="bg-card border-border animate-pulse">
                <CardContent className="pt-6 space-y-4">
                  <div className="h-10 bg-secondary rounded" />
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
  );
}
