import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Lock, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { Link } from "wouter";
import { logoWhite } from "@/lib/images";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Extract token from hash URL: /#/reset-password?token=abc123
  const token = useMemo(() => {
    const hash = window.location.hash; // e.g. #/reset-password?token=abc
    const qIdx = hash.indexOf("?");
    if (qIdx === -1) return "";
    const params = new URLSearchParams(hash.slice(qIdx));
    return params.get("token") || "";
  }, []);

  // Verify token validity
  const { data: tokenStatus, isLoading: tokenLoading } = useQuery<{ valid: boolean }>({
    queryKey: ["/api/auth/verify-reset-token", token],
    queryFn: async () => {
      const res = await apiRequest(`/api/auth/verify-reset-token?token=${token}`);
      return res.json();
    },
    enabled: !!token,
    retry: false,
  });

  const resetMutation = useMutation({
    mutationFn: async ({ token, password }: { token: string; password: string }) => {
      const res = await apiRequest("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      return res.json();
    },
    onSuccess: () => setSuccess(true),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }
    resetMutation.mutate({ token, password });
  };

  // No token provided
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="fixed inset-0 bg-gradient-to-br from-[hsl(220,40%,7%)] via-[hsl(220,35%,12%)] to-[hsl(220,40%,7%)]" />
        <div className="relative z-10 w-full max-w-md text-center">
          <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground">Invalid Reset Link</h2>
          <p className="text-sm text-muted-foreground mt-2">No reset token was provided.</p>
          <Link href="/">
            <Button variant="outline" className="mt-6 gap-2" data-testid="button-back-login">
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="fixed inset-0 bg-gradient-to-br from-[hsl(220,40%,7%)] via-[hsl(220,35%,12%)] to-[hsl(220,40%,7%)]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-2">
            <img
              src={logoWhite}
              alt="Lead-Lag Media"
              className="h-10 w-auto"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-1">Client Portal</p>
        </div>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardContent className="pt-6 pb-6">
            {tokenLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : !tokenStatus?.valid ? (
              <div className="text-center space-y-4 py-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-destructive/15 flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Link Expired</h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    This reset link is invalid or has expired. Please request a new one.
                  </p>
                </div>
                <Link href="/forgot-password">
                  <Button variant="outline" className="mt-2 gap-2" data-testid="button-request-new">
                    Request New Link
                  </Button>
                </Link>
              </div>
            ) : success ? (
              <div className="text-center space-y-4 py-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-green-500/15 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Password Reset</h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    Your password has been successfully changed. You can now sign in.
                  </p>
                </div>
                <Link href="/">
                  <Button className="mt-2 gap-2" data-testid="button-go-login">
                    Sign In
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-5">
                  <h2 className="text-lg font-semibold text-foreground">Set New Password</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose a new password for your account.
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-sm font-medium text-foreground">
                      New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="Min. 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 h-11 bg-background/50 border-border/60 focus:border-primary"
                        required
                        minLength={6}
                        data-testid="input-new-password"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-sm font-medium text-foreground">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 h-11 bg-background/50 border-border/60 focus:border-primary"
                        required
                        minLength={6}
                        data-testid="input-confirm-password"
                      />
                    </div>
                  </div>

                  {(validationError || resetMutation.error) && (
                    <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2" data-testid="text-error">
                      {validationError || resetMutation.error?.message}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11 font-medium"
                    disabled={resetMutation.isPending}
                    data-testid="button-reset-password"
                  >
                    {resetMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Reset Password
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
