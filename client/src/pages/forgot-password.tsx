import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { logoWhite } from "@/lib/images";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const resetMutation = useMutation({
    mutationFn: async (email: string) => {
      await apiRequest("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
    },
    onSuccess: () => setSubmitted(true),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetMutation.mutate(email);
  };

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
            {submitted ? (
              <div className="text-center space-y-4 py-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-green-500/15 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Check Your Email</h2>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    If an account exists for <span className="text-foreground font-medium">{email}</span>,
                    you'll receive a password reset link shortly.
                  </p>
                </div>
                <Link href="/">
                  <Button variant="outline" className="mt-2 gap-2" data-testid="button-back-login">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-5">
                  <h2 className="text-lg font-semibold text-foreground">Reset Password</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enter your email and we'll send you a reset link.
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="text-sm font-medium text-foreground">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-11 bg-background/50 border-border/60 focus:border-primary"
                        required
                        data-testid="input-reset-email"
                      />
                    </div>
                  </div>

                  {resetMutation.error && (
                    <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2" data-testid="text-error">
                      {resetMutation.error.message}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11 font-medium"
                    disabled={resetMutation.isPending}
                    data-testid="button-send-reset"
                  >
                    {resetMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Send Reset Link
                  </Button>
                </form>
                <div className="mt-4 text-center">
                  <Link href="/">
                    <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer inline-flex items-center gap-1">
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Back to Sign In
                    </span>
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
