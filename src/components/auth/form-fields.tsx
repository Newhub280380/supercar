"use client";

import { useState } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="bg-destructive/10 text-destructive rounded-lg px-4 py-3 text-sm">
      {message}
    </div>
  );
}

interface FieldProps extends Omit<React.ComponentProps<typeof Input>, "id"> {
  id: string;
  label: string;
  icon: LucideIcon;
}

export function IconField({
  id,
  label,
  icon: Icon,
  className,
  ...props
}: FieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <Icon className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input id={id} className={cn("h-10 pl-9", className)} {...props} />
      </div>
    </div>
  );
}

interface PasswordFieldProps extends FieldProps {
  visible?: boolean;
  onToggleVisibility?: () => void;
}

/** Masked field; pass `onToggleVisibility` to render the show/hide toggle. */
export function PasswordField({
  id,
  label,
  icon: Icon,
  className,
  visible = false,
  onToggleVisibility,
  ...props
}: PasswordFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <Icon className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          id={id}
          type={visible ? "text" : "password"}
          className={cn("h-10 pl-9", onToggleVisibility && "pr-9", className)}
          {...props}
        />
        {onToggleVisibility && (
          <button
            type="button"
            onClick={onToggleVisibility}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
          >
            {visible ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export function usePasswordVisibility() {
  const [visible, setVisible] = useState(false);
  return { visible, toggle: () => setVisible((v) => !v) };
}
