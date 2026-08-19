import { useState } from "react";
import { Link } from "wouter";
import { useRequestPasswordReset } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const GENERIC_MESSAGE = "If an account exists for that email, a reset link has been sent.";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const requestReset = useRequestPasswordReset();
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await requestReset.mutateAsync({ data: { email } });
      setSubmitted(true);
    } catch {
      toast({
        title: "Request failed",
        description: "Please wait a moment and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-orange-50/30">
      <Card className="w-full max-w-md shadow-xl border-orange-100 rounded-3xl overflow-hidden">
        <div className="h-2 bg-primary w-full" />
        <CardHeader className="text-center pt-8">
          <img src="/assets/images/logo.png" alt="TreasureTots" className="h-12 mx-auto mb-4 object-contain" />
          <CardTitle className="text-2xl">Reset your password</CardTitle>
          <CardDescription>We’ll email you a secure, one-time reset link.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          {submitted ? (
            <div className="space-y-6 text-center">
              <p className="text-sm text-muted-foreground">{GENERIC_MESSAGE}</p>
              <Button asChild className="w-full">
                <Link href="/login">Back to Login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="h-12 rounded-xl bg-muted/50 border-transparent focus:border-primary focus:bg-white"
                />
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl font-bold" disabled={requestReset.isPending}>
                {requestReset.isPending ? "Sending..." : "Send Reset Link"}
              </Button>
              <div className="text-center text-sm">
                <Link href="/login" className="text-primary font-bold hover:underline">
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}