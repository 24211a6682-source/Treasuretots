import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useRegister } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getAuthLink, getSafeReturnUrl } from "@/lib/auth-navigation";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const { login } = useAuth();
  const registerMutation = useRegister();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const returnUrl = getSafeReturnUrl(window.location.search);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    setPasswordError(null);
    try {
      const res = await registerMutation.mutateAsync({
        data: { name, email, password }
      });
      login(res.token);
      toast({ title: "Account created!", description: "Welcome to TreasureTots Creations." });
      setLocation(returnUrl);
    } catch (err: any) {
      toast({ 
        title: "Registration failed", 
        description: err.message || "Please check your details", 
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-orange-50/30">
      <Card className="w-full max-w-md shadow-xl border-orange-100 rounded-3xl overflow-hidden">
        <div className="h-2 bg-primary w-full"></div>
        <CardHeader className="text-center pt-8">
          <img src="/assets/images/logo.png" alt="Logo" className="h-12 mx-auto mb-4 object-contain" />
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Join our magical community</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                autoComplete="name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="h-12 rounded-xl bg-muted/50 border-transparent focus:border-primary focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl bg-muted/50 border-transparent focus:border-primary focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="h-12 rounded-xl bg-muted/50 border-transparent focus:border-primary focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={e => {
                  setConfirmPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                required
                aria-invalid={passwordError ? "true" : "false"}
                aria-describedby={passwordError ? "confirm-password-error" : undefined}
                className="h-12 rounded-xl bg-muted/50 border-transparent focus:border-primary focus:bg-white transition-all"
              />
              {passwordError && (
                <p id="confirm-password-error" role="alert" className="text-sm text-destructive">
                  {passwordError}
                </p>
              )}
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl text-base font-bold shadow-md mt-6"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
          
          <div className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href={getAuthLink("/login", returnUrl)} className="text-primary font-bold hover:underline">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}