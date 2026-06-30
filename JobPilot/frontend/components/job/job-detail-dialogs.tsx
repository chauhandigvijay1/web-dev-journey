"use client";

import { Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AiKind = "email" | "summary" | "interview" | "cover-letter" | "tailor-resume";

export function AiOutputDialog({
  open,
  onOpenChange,
  aiKind,
  aiLoading,
  aiError,
  aiOutput,
  aiCopied,
  onCopy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aiKind: AiKind;
  aiLoading: boolean;
  aiError: string | null;
  aiOutput: string;
  aiCopied: boolean;
  onCopy: () => void;
}) {
  const title =
    aiKind === "email"
      ? "Follow-up email"
      : aiKind === "summary"
        ? "Job summary"
        : aiKind === "interview"
          ? "Interview questions"
          : aiKind === "cover-letter"
            ? "Cover letter"
            : "Tailored resume";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl gap-4 overflow-hidden">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">Generated content</DialogDescription>
        </DialogHeader>
        <div className="min-h-[120px] space-y-3">
          {aiLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating...
            </div>
          ) : null}
          {aiError ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {aiError}
            </p>
          ) : null}
          {!aiLoading && aiOutput ? (
            <pre className="max-h-[min(50vh,420px)] overflow-auto whitespace-pre-wrap rounded-md border bg-muted/40 p-4 text-sm leading-relaxed">
              {aiOutput}
            </pre>
          ) : null}
        </div>
        {!aiLoading && aiOutput ? (
          <DialogFooter className="gap-2 sm:justify-between">
            <span className="text-xs text-muted-foreground">{aiCopied ? "Copied" : "\u00a0"}</span>
            <Button type="button" size="sm" variant="outline" className="gap-2" onClick={onCopy}>
              <Copy className="h-4 w-4" />
              Copy
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export function DeleteJobDialog({
  open,
  onOpenChange,
  deleting,
  jobTitle,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deleting: boolean;
  jobTitle: string;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !deleting && onOpenChange(o)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this job?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes &quot;{jobTitle}&quot; from your board. You cannot undo this action.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={deleting}
            onClick={onConfirm}
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
