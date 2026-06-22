"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";
import { api } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CareerStrategyPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [strategy, setStrategy] = useState<string | null>(null);

  async function fetchStrategy() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ success: boolean; data?: string; message?: string }>("/ai/strategy-dashboard");
      if (res.data.success && typeof res.data.data === "string") {
        setStrategy(res.data.data);
      } else {
        throw new Error(res.data.message || "Failed to load strategy dashboard.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchStrategy();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Career Strategy</h1>
        <p className="text-muted-foreground mt-2">
          Your personalized Career Brain analysis and AI-driven growth plan.
        </p>
      </div>

      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-950 to-indigo-900 text-white rounded-t-xl">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-300" />
            AI Career Architect
          </CardTitle>
          <CardDescription className="text-blue-200">
            Based on your uploaded resume and parsed experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p>Analyzing your Career Brain metrics...</p>
            </div>
          ) : error ? (
            <div className="rounded-md border border-red-500/50 bg-red-50/50 p-4 dark:bg-red-950/20">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold mb-2">
                <AlertCircle className="h-4 w-4" />
                <span>Analysis Failed</span>
              </div>
              <div className="text-sm text-red-600/90 dark:text-red-400/90">{error}</div>
              <Button variant="outline" className="mt-4" onClick={fetchStrategy}>
                Try Again
              </Button>
            </div>
          ) : strategy ? (
            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-headings:text-indigo-600 dark:prose-headings:text-indigo-400 prose-a:text-blue-600">
              <ReactMarkdown>{strategy}</ReactMarkdown>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
