import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateProfile } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function CompletePhone({ returnTo = "/dashboard" }: { returnTo?: string }) {
  const { user, isLoading, refreshUser } = useAuth();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [isLoading, setLocation, user]);

  if (isLoading || !user) {
    return <div className="min-h-[60vh] flex items-center justify-center text-sm text-muted-foreground">Loading account...</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({ data: { phone } });
      await refreshUser();
      toast({ title: "Phone number saved", description: "Your account is ready to use." });
      setLocation(returnTo === "/complete-phone" ? "/dashboard" : returnTo);
    } catch (err: any) {
      toast({
        title: "Unable to save phone number",
        description: err.message || "Enter a valid phone number and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 bg-orange-50/30">
      <Card className="w-full max-w-md shadow-xl border-orange-100 rounded-3xl overflow-hidden">
        <div className="h-2 bg-primary w-full" />
        <CardHeader className="text-center pt-8">
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>Add a phone number to continue using your account.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="required-phone">Phone Number</Label>
              <Input
                id="required-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="8500630595"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                autoFocus
              />
              <p className="text-xs text-muted-foreground">Use a valid Indian mobile number.</p>
            </div>
            <Button type="submit" className="w-full" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? "Saving..." : "Save and Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}