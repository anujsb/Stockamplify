"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get("status");

  // Auto redirect to sign-in page after success
  useEffect(() => {
    if (status === "success") {
      const timeout = setTimeout(() => {
        router.push("/sign-in");
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [status, router]);

  let title = "";
  let description = "";
  let icon;
  let iconColor = "";

  switch (status) {
    case "success":
      title = "Email Verified 🎉";
      description =
        "Your email has been successfully verified. Redirecting to sign-in...";
      icon = <CheckCircle className="h-16 w-16" />;
      iconColor = "text-green-500";
      break;
    case "expired":
      title = "Verification Link Expired ⏳";
      description =
        "Your verification link has expired. Please request a new one.";
      icon = <AlertTriangle className="h-16 w-16" />;
      iconColor = "text-yellow-500";
      break;
    case "invalid":
      title = "Invalid Token ❌";
      description = "Your verification token is invalid or already used.";
      icon = <XCircle className="h-16 w-16" />;
      iconColor = "text-red-500";
      break;
    default:
      title = "Invalid Request";
      description = "We couldn’t process your request.";
      icon = <XCircle className="h-16 w-16" />;
      iconColor = "text-red-500";
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-md w-full text-center">
        <div className={`flex justify-center mb-4 ${iconColor}`}>{icon}</div>
        <h1 className="text-2xl font-bold mb-2 text-gray-800">{title}</h1>
        <p className="text-gray-600 mb-6">{description}</p>
        {(status === "invalid" || status === "expired") && (
          <Button
            onClick={() => router.push("/sign-in")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 py-3"
          >
            Go to Sign In
          </Button>
        )}
      </div>
    </div>
  );
}
