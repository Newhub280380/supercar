"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to send reset link");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="size-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-heading">Check Your Email</CardTitle>
          <CardDescription>
            We&apos;ve sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Link href="/auth/login">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="size-4" />
              Back to Login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-heading">Forgot Password?</CardTitle>
        <CardDescription>Enter your email and we&apos;ll send you a reset link</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 pl-9"
                required
                autoComplete="email"
              />
            </div>
          </div>
          <Button type="submit" className="w-full h-10" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="size-4" />
          Back to Login
        </Link>
      </CardFooter>
    </Card>
  );
}
