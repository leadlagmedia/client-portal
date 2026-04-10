import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Lock, Mail } from "lucide-react";
import { Link } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { logoWhite } from "@/lib/images";

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

              <div className="text-center pt-1">
                <span
                  className="text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors"
                  onClick={() => window.location.hash = "#/forgot-password"}
                  data-testid="link-forgot-password"
                >
                  Forgot your password?
                </span>
              </div>
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
