"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative"
    >
      {theme === "light" ? (
        <Moon className="size-4 stroke-[1.5]" />
      ) : (
        <Sun className="size-4 stroke-[1.5]" />
      )}
    </Button>
  );
}

export { ThemeToggle };
