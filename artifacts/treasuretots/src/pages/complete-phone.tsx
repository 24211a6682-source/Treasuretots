import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateProfile } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  DEFAULT_PHONE_COUNTRY,
  toInternationalPhone,
  validateLocalPhone,
  type PhoneCountry,
} from "@/lib/phone-countries";
import { InternationalPhoneInput } from "@/components/InternationalPhoneInput";
import { trackEvent } from "@/lib/analytics";

export default function CompletePhone({ returnTo = "/dashboard" }: { returnTo?: string }) {
  const { user, isLoading, refreshUser } = useAuth();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState<PhoneCountry>(DEFAULT_PHONE_COUNTRY);
  const [phoneError, setPhoneError] = useState<string | null>(null);

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
    const validationError = validateLocalPhone(country, phone);
    if (validationError) {
      setPhoneError(validationError);
      return;
    }
    setPhoneError(null);
    try {
      await updateProfile.mutateAsync({ data: { phone: toInternationalPhone(country, phone) } });
      await refreshUser();
      trackEvent("profile_phone_completed", {
        country: country.name,
        calling_code: `+${country.dialCode}`,
      });
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
              <InternationalPhoneInput
                id="required-phone"
                value={phone}
                country={country}
                error={phoneError}
                onChange={setPhone}
                onCountryChange={setCountry}
                onErrorClear={() => setPhoneError(null)}
                required
                autoFocus
              />
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