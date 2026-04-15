"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/protected-route";
import DashboardShell from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

const PLAN_LIMIT = 20;
const REQUEST_TIMEOUT_MS = 15000;

const withTimeout = (promise, timeoutMs = REQUEST_TIMEOUT_MS) =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timed out. Please try again.")), timeoutMs);
    }),
  ]);

const getFriendlyError = (error, fallback) => {
  const apiMessage = error?.response?.data?.message;
  const raw = String(apiMessage || error?.message || "");
  if (!raw) return fallback;
  if (
    raw.includes("ENOTFOUND") ||
    raw.includes("ECONNREFUSED") ||
    raw.includes("ETIMEDOUT") ||
    raw.includes("Network Error") ||
    raw.includes("Service is temporarily unavailable")
  ) {
    return "Server is temporarily unavailable. Please retry in a moment.";
  }
  return apiMessage || raw || fallback;
};

const ensureRazorpayLoaded = () =>
  new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true), { once: true });
      existingScript.addEventListener("error", () => resolve(false), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function BillingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [showExpiredPrompt, setShowExpiredPrompt] = useState(false);
  const [expiredPromptMessage, setExpiredPromptMessage] = useState("");
  const paymentWatchdogRef = useRef(null);
  const [billing, setBilling] = useState({
    plan: "free",
    status: "inactive",
    expiresAt: null,
    usage: {
      dailyCount: 0,
      limit: PLAN_LIMIT,
      remaining: PLAN_LIMIT,
      lastReset: null,
    },
    pricing: {
      regularMonthly: 29900,
      currency: "INR",
    },
  });

  const fetchBilling = useCallback(async () => {
    const { data } = await withTimeout(api.get("/api/payment/status"));
    const payload = data?.data || {};
    setBilling({
      plan: payload.plan || "free",
      status: payload.status || "inactive",
      expiresAt: payload.expiresAt || null,
      usage: {
        dailyCount: payload.usage?.dailyCount || 0,
        limit: payload.usage?.limit || PLAN_LIMIT,
        remaining:
          typeof payload.usage?.remaining === "number"
            ? payload.usage.remaining
            : Math.max(0, PLAN_LIMIT - (payload.usage?.dailyCount || 0)),
        lastReset: payload.usage?.lastReset || null,
      },
      pricing: {
        regularMonthly: payload.pricing?.regularMonthly || 29900,
        currency: payload.pricing?.currency || "INR",
      },
    });
    setShowExpiredPrompt(!!payload.expiredOfferPrompt?.show);
    setExpiredPromptMessage(payload.expiredOfferPrompt?.message || "");
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        await fetchBilling();
      } catch (fetchError) {
        setError(getFriendlyError(fetchError, "Failed to load billing data."));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchBilling]);

  useEffect(() => {
    const onFocus = () => {
      setUpgrading(false);
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  useEffect(
    () => () => {
      if (paymentWatchdogRef.current) {
        clearTimeout(paymentWatchdogRef.current);
      }
    },
    []
  );

  const onUpgrade = async () => {
    if (upgrading) return;
    setUpgrading(true);
    setError("");
    setSuccess("");

    try {
      const razorpayReady = await ensureRazorpayLoaded();
      if (typeof window === "undefined" || !window.Razorpay || !razorpayReady) {
        throw new Error("Razorpay SDK failed to load.");
      }

      const { data: orderResponse } = await withTimeout(
        api.post("/api/payment/create-order", {
          couponCode: appliedCoupon?.code || "",
        })
      );
      const order = orderResponse?.data || {};
      const key = order.keyId;

      if (!key || !order.orderId) {
        throw new Error("Invalid payment configuration.");
      }

      const razorpay = new window.Razorpay({
        key,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "DevFlow AI",
        description: "Pro Plan - Monthly Subscription",
        order_id: order.orderId,
        handler: async (response) => {
          try {
            await withTimeout(api.post("/api/payment/verify", response));
            await fetchBilling();
            setSuccess("Payment successful. Pro plan activated.");
            setAppliedCoupon(null);
            setCouponCode("");
          } catch (verifyError) {
            setError(
              getFriendlyError(
                verifyError,
                "Payment received, but verification failed. Please contact support."
              )
            );
          } finally {
            setUpgrading(false);
            if (paymentWatchdogRef.current) clearTimeout(paymentWatchdogRef.current);
          }
        },
        prefill: {},
        modal: {
          ondismiss: () => {
            setError("Payment cancelled. You can try again.");
            setUpgrading(false);
            if (paymentWatchdogRef.current) clearTimeout(paymentWatchdogRef.current);
          },
        },
        theme: {
          color: "#0f172a",
        },
      });

      razorpay.on("payment.failed", (event) => {
        const reason =
          event?.error?.description || event?.error?.reason || "Payment failed. Please try again.";
        setError(reason);
        setUpgrading(false);
        if (paymentWatchdogRef.current) clearTimeout(paymentWatchdogRef.current);
      });

      paymentWatchdogRef.current = setTimeout(() => {
        setUpgrading(false);
      }, 45000);
      razorpay.open();
    } catch (paymentError) {
      setError(getFriendlyError(paymentError, "Upgrade failed."));
      setUpgrading(false);
      if (paymentWatchdogRef.current) clearTimeout(paymentWatchdogRef.current);
    }
  };

  const onApplyCoupon = async () => {
    const normalized = couponCode.trim().toUpperCase();
    return applyCouponCode(normalized);
  };

  const applyCouponCode = async (rawCode) => {
    if (applyingCoupon || upgrading) return;
    const normalized = String(rawCode || "")
      .trim()
      .toUpperCase();
    if (!normalized) {
      setError("Enter a coupon code.");
      return;
    }

    setApplyingCoupon(true);
    setError("");
    setSuccess("");
    try {
      const { data } = await withTimeout(
        api.post("/api/payment/apply-coupon", {
          couponCode: normalized,
        })
      );
      setAppliedCoupon(data?.data || null);
      setCouponCode(normalized);
      setSuccess(`Coupon ${normalized} applied.`);
    } catch (couponError) {
      setAppliedCoupon(null);
      setError(getFriendlyError(couponError, "Invalid coupon."));
    } finally {
      setApplyingCoupon(false);
    }
  };

  const planLabel = useMemo(() => (billing.plan === "pro" ? "Pro" : "Free"), [billing.plan]);
  const usageLabel =
    billing.plan === "pro"
      ? "Unlimited prompts"
      : `${billing.usage.dailyCount} / ${billing.usage.limit} prompts used today`;
  const displayAmount = appliedCoupon?.amount ?? billing.pricing.regularMonthly;
  const displayDurationDays = appliedCoupon?.durationDays ?? 30;
  const displayPriceText = `Rs. ${(displayAmount / 100).toFixed(2)}`;

  return (
    <ProtectedRoute>
      <DashboardShell>
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-semibold">Billing</h1>
              <Button variant="outline" onClick={() => router.push("/settings")}>
                Back
              </Button>
            </div>

            {loading ? (
              <p className="text-sm text-slate-500">Loading billing details...</p>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                  <p className="text-sm text-slate-500">Current Plan</p>
                  <p className="mt-1 text-lg font-semibold">{planLabel}</p>
                  {billing.plan === "pro" && billing.expiresAt && (
                    <p className="mt-1 text-sm text-slate-500">
                      Renews/Expires on {new Date(billing.expiresAt).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                  <p className="text-sm text-slate-500">Usage</p>
                  <p className="mt-1 text-sm">{usageLabel}</p>
                </div>

                {billing.plan !== "pro" && (
                  <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                    <p className="text-sm text-slate-500">Coupon</p>
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                      <input
                        value={couponCode}
                        onChange={(event) => setCouponCode(event.target.value)}
                        placeholder="Enter coupon code"
                        className="h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onApplyCoupon}
                        disabled={applyingCoupon || upgrading}
                        className="w-full sm:w-auto"
                      >
                        {applyingCoupon ? "Applying..." : "Apply"}
                      </Button>
                    </div>
                    <div className="mt-2 space-y-2">
                      <p className="text-xs text-slate-500">FREETRIAL: Rs. 1 for 7 days.</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => applyCouponCode("FREETRIAL")}
                        disabled={applyingCoupon || upgrading}
                        className="w-full sm:w-auto"
                      >
                        Apply FREETRIAL
                      </Button>
                      <p className="text-xs text-slate-500">OFF50: 50% off monthly Pro.</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => applyCouponCode("OFF50")}
                        disabled={applyingCoupon || upgrading}
                        className="w-full sm:w-auto"
                      >
                        Apply OFF50
                      </Button>
                    </div>
                  </div>
                )}

                {billing.plan !== "pro" && (
                  <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                    <p className="text-sm text-slate-500">Payable Now</p>
                    <p className="mt-1 text-lg font-semibold">{displayPriceText}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Access duration: {displayDurationDays} day{displayDurationDays > 1 ? "s" : ""}
                    </p>
                  </div>
                )}

                {error && <p className="text-sm text-red-500">{error}</p>}
                {success && <p className="text-sm text-emerald-500">{success}</p>}

                <Button
                  onClick={onUpgrade}
                  disabled={upgrading || billing.plan === "pro"}
                  className="w-full sm:w-auto"
                >
                  {billing.plan === "pro"
                    ? "You are on Pro"
                    : upgrading
                      ? "Processing..."
                      : `Upgrade to Pro - ${displayPriceText}`}
                </Button>
              </div>
            )}
          </div>
        </div>
        {showExpiredPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-xl border bg-white p-5 dark:bg-slate-900">
              <h3 className="text-lg font-semibold">Plan Expired</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {expiredPromptMessage || "Your Pro access has expired. Upgrade to continue."}
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowExpiredPrompt(false)}>
                  Later
                </Button>
                <Button
                  onClick={() => {
                    setAppliedCoupon(null);
                    setCouponCode("");
                    setShowExpiredPrompt(false);
                    onUpgrade();
                  }}
                >
                  Upgrade Now
                </Button>
              </div>
            </div>
          </div>
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
