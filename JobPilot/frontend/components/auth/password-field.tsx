"use client";

import { useState } from "react";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getPasswordChecklist } from "@/lib/auth-validation";

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  autoComplete?: string;
  placeholder?: string;
  description?: string | null;
  error?: string | null;
  required?: boolean;
  minLength?: number;
  showChecklist?: boolean;
  onChange: (value: string) => void;
};

export function PasswordField({
  id,
  label,
  value,
  autoComplete,
  placeholder,
  description,
  error,
  required = true,
  minLength,
  showChecklist = false,
  onChange,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const checklist = showChecklist ? getPasswordChecklist(value) : [];

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="pr-11"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
      {showChecklist && value ? (
        <ul className="space-y-1">
          {checklist.map((item) => (
            <li key={item.label} className="flex items-center gap-1.5 text-xs">
              {item.met ? (
                <Check className="h-3 w-3 text-emerald-500" />
              ) : (
                <X className="h-3 w-3 text-muted-foreground" />
              )}
              <span className={item.met ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}>
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {!error && description && !showChecklist ? <p className="text-xs text-muted-foreground">{description}</p> : null}
    </div>
  );
}
