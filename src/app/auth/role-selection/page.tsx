"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, User, Shield } from "lucide-react";
import type { Role } from "@/types";
import { cn } from "@/lib/utils";

interface RoleOption {
  role: Role;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const roles: RoleOption[] = [
  {
    role: "cosmetologist",
    label: "Cosmetologist",
    description: "Manage clients, appointments, services and grow your practice",
    icon: <Briefcase className="size-6" />,
  },
  {
    role: "client",
    label: "Client",
    description: "Book appointments, get AI-powered skincare recommendations",
    icon: <User className="size-6" />,
  },
  {
    role: "admin",
    label: "Administrator",
    description: "Full platform access, manage users, services and settings",
    icon: <Shield className="size-6" />,
  },
];

export default function RoleSelectionPage() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSelectRole() {
    if (!selectedRole) {
      setError("Please select a role");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });

      const data = await res.json();

      if (res.ok) {
        if (selectedRole === "cosmetologist") {
          router.push("/dashboard");
        } else if (selectedRole === "admin") {
          router.push("/dashboard");
        } else {
          router.push("/profile");
        }
      } else {
        setError(data.error || "Failed to set role");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-heading">Choose Your Role</CardTitle>
        <CardDescription>Select how you want to use the platform</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {roles.map((option) => (
          <button
            key={option.role}
            type="button"
            onClick={() => setSelectedRole(option.role)}
            className={cn(
              "flex w-full items-start gap-4 rounded-lg border p-4 text-left transition-colors",
              selectedRole === option.role
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/50",
            )}
          >
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-lg",
                selectedRole === option.role
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {option.icon}
            </div>
            <div>
              <p className="font-medium">{option.label}</p>
              <p className="text-sm text-muted-foreground">{option.description}</p>
            </div>
          </button>
        ))}
        <Button
          onClick={handleSelectRole}
          className="w-full h-10 mt-4"
          disabled={!selectedRole || loading}
        >
          {loading ? "Setting up..." : "Continue"}
        </Button>
      </CardContent>
    </Card>
  );
}
