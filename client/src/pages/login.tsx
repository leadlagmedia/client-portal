import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-[hsl(220,40%,7%)] via-[hsl(220,35%,12%)] to-[hsl(220,40%,7%)]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Lead-Lag Media">
              <rect width="40" height="40" rx="8" fill="hsl(40, 80%, 55%)" />
              <path d="M10 28V12h4v12h8v4H10z" fill="hsl(220, 40%, 7%)" />
              <path d="M24 28V12h4v16h-4z" fill="hsl(220, 40%, 7%)" opacity="0.7" />
              <path d="M30 12h-2v4h2v-4z" fill="hsl(220, 40%, 7%)" opacity="0.5" />
            </svg>
            <span className="text-xl font-semibold tracking-tight text-foreground">
              Lead-Lag Media
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Client Portal</p>
        </div>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardContent className="pt-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 bg-background/50 border-border/60 focus:border-primary"
                    required
                    data-testid="input-email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11 bg-background/50 border-border/60 focus:border-primary"
                    required
                    data-testid="input-password"
                  />
                </div>
              </div>

              {login.error && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2" data-testid="text-error">
                  {login.error.message}
                </p>
              )}

              <Button
                type="submit"
                className="w-full h-11 font-medium"
                disabled={login.isPending}
                data-testid="button-login"
              >
                {login.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Access is restricted to Lead-Lag Media clients.
          <br />
          Contact your account manager for credentials.
        </p>
      </div>
    </div>
  );
}
