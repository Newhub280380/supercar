import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background bg-[radial-gradient(circle_at_50%_35%,var(--accent)_0%,var(--background)_65%)] px-4 py-8">
      <div className="w-full max-w-md space-y-6">{children}</div>
    </div>
  );
}
