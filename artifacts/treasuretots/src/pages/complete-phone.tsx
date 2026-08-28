import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateProfile } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Check, ChevronDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DEFAULT_PHONE_COUNTRY,
  getLocalPhoneDigits,
  PHONE_COUNTRIES,
  toInternationalPhone,
  validateLocalPhone,
  type PhoneCountry,
} from "@/lib/phone-countries";

export default function CompletePhone({ returnTo = "/dashboard" }: { returnTo?: string }) {
  const { user, isLoading, refreshUser } = useAuth();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState<PhoneCountry>(DEFAULT_PHONE_COUNTRY);
  const [countryOpen, setCountryOpen] = useState(false);
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
              <div className="flex gap-2">
                <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={countryOpen}
                      className="h-12 w-[116px] shrink-0 justify-between px-3 sm:w-[132px]"
                    >
                      <span className="truncate">+{country.dialCode}</span>
                      <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-[280px] p-0">
                    <Command>
                      <CommandInput placeholder="Search country..." />
                      <CommandList>
                        <CommandEmpty>No country found.</CommandEmpty>
                        {PHONE_COUNTRIES.map((option) => (
                          <CommandItem
                            key={`${option.name}-${option.dialCode}`}
                            value={`${option.name} +${option.dialCode}`}
                            onSelect={() => {
                              setCountry(option);
                              setCountryOpen(false);
                              setPhoneError(null);
                            }}
                          >
                            <Check className={`h-4 w-4 ${country.name === option.name ? "opacity-100" : "opacity-0"}`} />
                            <span className="flex-1 truncate">{option.name}</span>
                            <span className="text-muted-foreground">+{option.dialCode}</span>
                          </CommandItem>
                        ))}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <Input
                  id="required-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (phoneError) setPhoneError(null);
                  }}
                  aria-invalid={!!phoneError}
                  required
                  autoFocus
                  className="h-12 min-w-0 flex-1"
                />
              </div>
              <p className={`text-xs ${phoneError ? "text-destructive" : "text-muted-foreground"}`}>
                {phoneError ?? "Enter a valid phone number for the selected country."}
              </p>
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