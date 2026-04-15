"use client";

import ProtectedRoute from "@/components/protected-route";
import DashboardShell from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useState } from "react";

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const upgrade = async () => {
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const ok = await loadRazorpay();
      if (!ok) {
        throw new Error("Failed to load Razorpay checkout");
      }

      const { data } = await api.post("/api/payments/create-order", {});
      const order = data?.data;
      if (!order?.orderId || !order?.keyId) {
        throw new Error("Failed to create order");
      }

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "DevFlow AI",
        description: "Upgrade to Pro",
        order_id: order.orderId,
        handler: async (response) => {
          try {
            await api.post("/api/payments/verify", response);
            window.location.href = "/dashboard?upgrade=success";
          } catch (verifyError) {
            setError(
              verifyError?.response?.data?.message || "Payment verification failed. Please contact support."
            );
          }
        },
        theme: { color: "#0f172a" },
      };

      // eslint-disable-next-line no-undef
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp) => {
        setError(resp?.error?.description || "Payment failed. Please try again.");
      });
      rzp.open();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Upgrade failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardShell>
        <h2 className="mb-4 text-2xl font-semibold">Pricing</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-5 dark:border-slate-800">
            <h3 className="text-xl font-semibold">Free</h3>
            <p className="mt-2 text-sm text-slate-500">20 prompts total, basic chat and code explain.</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-5 dark:border-slate-800">
            <h3 className="text-xl font-semibold">Pro</h3>
            <p className="mt-2 text-sm text-slate-500">Unlimited usage, faster responses, priority support.</p>
            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
            <Button className="mt-4" onClick={upgrade} disabled={loading}>
              {loading ? "Opening checkout..." : "Upgrade to Pro"}
            </Button>
          </div>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
