"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from '@/components/header';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          username,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Account created successfully! Please check your email to verify.");
        setTimeout(() => {
          router.push("/sign-in");
        }, 2000);
      } else {
        setError(data.error || "Failed to create account");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      <section className="px-4 py-12 flex items-center justify-center">
        <Card className="w-full max-w-md rounded-3xl border-none shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-slate-900">
                Sign up to StockAmplify
              </h1>
              <p className="mt-1 text-slate-500 text-sm">
                Let’s get you started with a free account
              </p>
              {/* Divider underline */}
              <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
            </div>

            {/* Alerts */}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                placeholder="Username (optional)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11 rounded-md border border-slate-200 bg-white placeholder-slate-400 text-slate-900"
              />
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-md border border-slate-200 bg-white placeholder-slate-400 text-slate-900"
              />
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 rounded-md border border-slate-200 bg-white placeholder-slate-400 text-slate-900"
              />
              <Input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-11 rounded-md border border-slate-200 bg-white placeholder-slate-400 text-slate-900"
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-md bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white hover:from-indigo-600 hover:to-fuchsia-600 font-semibold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Footer link */}
            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <a
                href="/sign-in"
                className="font-semibold text-violet-600 hover:text-violet-700"
              >
                Sign in
              </a>
            </p>
          </CardContent>
        </Card>
      </section>
            <p className="text-xs text-gray-300 text-center">
              By signing up, you agree to our{" "}
              <a href="/terms" className="text-blue-400 hover:underline">
                Terms and Conditions
              </a>.
            </p>
    </div>
  );
}