"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Button } from "@/components/ui/button";

type GoogleAuthButtonProps = {
  disabled?: boolean;
  onCredential: (credential: string) => Promise<void>;
  onError: (message: string) => void;
};

type GoogleCredentialResponse = {
  credential?: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
            ux_mode?: "popup" | "redirect";
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

export function GoogleAuthButton({
  disabled = false,
  onCredential,
  onError,
}: GoogleAuthButtonProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || "";
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [pending, setPending] = useState(false);

  const renderGoogleButton = useCallback(() => {
    if (!scriptLoaded || !clientId || !containerRef.current || !window.google) {
      return;
    }

    const element = containerRef.current;
    element.innerHTML = "";

    window.google.accounts.id.initialize({
      client_id: clientId,
      ux_mode: "popup",
      cancel_on_tap_outside: true,
      callback: async (response) => {
        if (!response.credential) {
          onError("Google sign-in did not return a valid credential.");
          return;
        }

        setPending(true);
        try {
          await onCredential(response.credential);
        } catch (error) {
          const message =
            error instanceof Error && error.message
              ? error.message
              : "Could not complete Google sign-in.";
          onError(message);
        } finally {
          setPending(false);
        }
      },
    });

    window.google.accounts.id.renderButton(element, {
      type: "standard",
      theme: document.documentElement.classList.contains("dark") ? "filled_black" : "outline",
      text: "continue_with",
      shape: "pill",
      size: "large",
      width: Math.max(240, Math.min(element.clientWidth || 360, 420)),
      logo_alignment: "left",
    });
  }, [clientId, onCredential, onError, scriptLoaded]);

  useEffect(() => {
    renderGoogleButton();
    if (!clientId || !scriptLoaded) return undefined;

    const handleResize = () => renderGoogleButton();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [clientId, renderGoogleButton, scriptLoaded]);

  return (
    <div className="space-y-2">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />

      {clientId ? (
        <div className={disabled || pending ? "pointer-events-none opacity-70" : ""}>
          <div ref={containerRef} className="min-h-10 w-full overflow-hidden rounded-full" />
        </div>
      ) : (
        <Button type="button" variant="outline" className="w-full" disabled>
          Continue with Google
        </Button>
      )}

      {pending ? <p className="text-xs text-muted-foreground">Finishing Google sign-in...</p> : null}
      {!clientId ? (
        <p className="text-xs text-muted-foreground">
          Google sign-in becomes available after adding `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.
        </p>
      ) : null}
    </div>
  );
}
