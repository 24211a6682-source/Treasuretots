import { useState } from "react";
import { Link } from "wouter";
import { useResetPassword } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResetPassword() {
  const token = new URLSearchParams(window.location.search).get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);
  const resetPassword = useResetPassword();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setFormError(null);
    try {
      await resetPassword.mutateAsync({ data: { token, password } });
      setComplete(true);
    } catch {
      setFormError("This reset link is invalid or has expired. Please request a new one.");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-orange-50/30">
      <Card className="w-full max-w-md shadow-xl border-orange-100 rounded-3xl overflow-hidden">
        <div className="h-2 bg-primary w-full" />
        <CardHeader className="text-center pt-8">
          <img src="/assets/images/logo.png" alt="TreasureTots" className="h-12 mx-auto mb-4 object-contain" />
          <CardTitle className="text-2xl">Choose a new password</CardTitle>
          <CardDescription>Your link can be used once and expires after one hour.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          {complete ? (
            <div className="space-y-6 text-center">
              <p className="text-sm text-muted-foreground">Your password has been reset successfully.</p>
              <Button asChild className="w-full">
                <Link href="/login">Log In</Link>
              </Button>
            </div>
          ) : !token ? (
            <div className="space-y-6 text-center">
              <p className="text-sm text-destructive">This reset link is incomplete.</p>
              <Button asChild className="w-full">
                <Link href="/forgot-password">Request a New Link</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="h-12 rounded-xl bg-muted/50 border-transparent focus:border-primary focus:bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    if (formError === "Passwords do not match.") setFormError(null);
                  }}
                  required
                  aria-invalid={formError ? "true" : "false"}
                  aria-describedby={formError ? "reset-password-error" : undefined}
                  className="h-12 rounded-xl bg-muted/50 border-transparent focus:border-primary focus:bg-white"
                />
              </div>
              {formError && (
                <p id="reset-password-error" role="alert" className="text-sm text-destructive">
                  {formError}
                </p>
              )}
              <Button type="submit" className="w-full h-12 rounded-xl font-bold" disabled={resetPassword.isPending}>
                {resetPassword.isPending ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}