"use client";

import Header from "@/components/header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function GoogleIcon() {
  // Clean inline Google "G" — no external deps
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5h-1.8V20H24v8h11.3C33.8 31.7 29.4 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34 5 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.8 16.4 19 13 24 13c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34 5 29.3 3 24 3 16.2 3 9.5 7.4 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 45c5.3 0 10-1.8 13.6-4.8l-6.3-5.2c-2 1.4-4.6 2.3-7.3 2.3-5.4 0-9.8-3.3-11.3-7.9l-6.6 5.1C9.4 40.6 16.1 45 24 45z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5h-1.8V20H24v8h11.3c-1.3 3.7-4.9 7-11.3 7-5.4 0-9.8-3.3-11.3-7.9l-6.6 5.1C8.1 38.6 15 44 24 44c10.2 0 18.9-7.4 20-17 0-.8.1-1.6.1-2.5 0-1.2-.1-2.3-.5-3.5z"
      />
    </svg>
  );
}

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { data: session, status, update } = useSession();

  // Redirect when authenticated (avoid doing it during render)
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // keep false so we can show errors
        callbackUrl: "/dashboard", // where to go on success
      });

      if (result?.error) {
        setError("Invalid email/password or unverified email");
      } else if (result?.ok) {
        await update();
        router.replace(result.url ?? "/dashboard");
      } else {
        setError("Unable to sign in. Please try again.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Optional: small loading state while session is resolving
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-2 text-white">
          <Loader2 className="h-5 w-5 animate-spin" />
          Checking your session…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      <div className="mx-auto max-w-lg px-4 py-12 sm:py-10">
        <Card className="rounded-2xl border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardContent className="p-8 sm:p5">
            {/* Title */}
            <div className="mb-6 text-center">
              <h1 className="text-2xl sm:text-2xl font-bold text-slate-900">
                Sign in to StockAmplify
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Welcome back! Please sign in to continue
              </p>
              <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500" />
            </div>

            {/* Google button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full h-11 rounded-lg border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 gap-2 cursor-pointer"
            >
              <GoogleIcon />
              <span className="font-medium">Continue with Google</span>
            </Button>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4 text-sm text-slate-400">
              <div className="h-px flex-1 bg-slate-400"></div>
              <span>or</span>
              <div className="h-px flex-1 bg-slate-400"></div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700"
                >
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="h-11 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 border-slate-200 focus-visible:ring-2 focus-visible:ring-violet-500"
                />
              </div>

              {/* Keep password for credentials flow.
                      If you want email-first like the screenshot, hide this and reveal on Continue. */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="h-11 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 border-slate-200 focus-visible:ring-2 focus-visible:ring-violet-500"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-600 hover:to-fuchsia-600 text-white font-semibold cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Footer */}
            <p className="mt-8 text-center text-sm text-slate-500">
              Don’t have an account?{" "}
              <a
                href="/sign-up"
                className="font-semibold text-violet-600 hover:text-violet-700"
              >
                Sign up
              </a>
            </p>
          </CardContent>
        </Card>

        <p className="text-xs text-gray-300 mt-4 text-center">
          By signing in, you agree to our{" "}
          <a href="/terms" className="text-blue-400 hover:underline">
            Terms and Conditions
          </a>
          .
        </p>
      </div>
    </div>
  );
}
