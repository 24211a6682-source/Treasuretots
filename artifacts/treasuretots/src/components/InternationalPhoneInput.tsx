import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  PHONE_COUNTRIES,
  type PhoneCountry,
} from "@/lib/phone-countries";

type InternationalPhoneInputProps = {
  id: string;
  value: string;
  country: PhoneCountry;
  error?: string | null;
  autoFocus?: boolean;
  required?: boolean;
  onChange: (value: string) => void;
  onCountryChange: (country: PhoneCountry) => void;
  onErrorClear?: () => void;
};

export function InternationalPhoneInput({
  id,
  value,
  country,
  error,
  autoFocus,
  required,
  onChange,
  onCountryChange,
  onErrorClear,
}: InternationalPhoneInputProps) {
  const [countryOpen, setCountryOpen] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Popover open={countryOpen} onOpenChange={setCountryOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={countryOpen}
              aria-label="Select country code"
              className="h-12 w-[116px] shrink-0 justify-between rounded-xl px-3 sm:w-[132px]"
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
                      onCountryChange(option);
                      setCountryOpen(false);
                      onErrorClear?.();
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
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="Enter your phone number"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            onErrorClear?.();
          }}
          aria-invalid={!!error}
          required={required}
          autoFocus={autoFocus}
          className="h-12 min-w-0 flex-1 rounded-xl bg-muted/50 border-transparent focus:border-primary focus:bg-white transition-all"
        />
      </div>
      <p className={`text-xs ${error ? "text-destructive" : "text-muted-foreground"}`} role={error ? "alert" : undefined}>
        {error ?? "Enter a valid phone number for the selected country."}
      </p>
    </div>
  );
}