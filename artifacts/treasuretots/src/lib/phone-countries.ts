export type PhoneCountry = {
  name: string;
  dialCode: string;
  minDigits: number;
  maxDigits: number;
};

// Common international destinations with national-number length guidance.
// The selected dial code and local number are combined before saving.
export const PHONE_COUNTRIES: PhoneCountry[] = [
  { name: "India", dialCode: "91", minDigits: 10, maxDigits: 10 },
  { name: "United States", dialCode: "1", minDigits: 10, maxDigits: 10 },
  { name: "Canada", dialCode: "1", minDigits: 10, maxDigits: 10 },
  { name: "United Kingdom", dialCode: "44", minDigits: 10, maxDigits: 11 },
  { name: "Australia", dialCode: "61", minDigits: 9, maxDigits: 10 },
  { name: "New Zealand", dialCode: "64", minDigits: 8, maxDigits: 10 },
  { name: "United Arab Emirates", dialCode: "971", minDigits: 9, maxDigits: 9 },
  { name: "Saudi Arabia", dialCode: "966", minDigits: 9, maxDigits: 9 },
  { name: "Qatar", dialCode: "974", minDigits: 8, maxDigits: 8 },
  { name: "Kuwait", dialCode: "965", minDigits: 8, maxDigits: 8 },
  { name: "Oman", dialCode: "968", minDigits: 8, maxDigits: 8 },
  { name: "Bahrain", dialCode: "973", minDigits: 8, maxDigits: 8 },
  { name: "Singapore", dialCode: "65", minDigits: 8, maxDigits: 8 },
  { name: "Malaysia", dialCode: "60", minDigits: 9, maxDigits: 10 },
  { name: "Indonesia", dialCode: "62", minDigits: 9, maxDigits: 12 },
  { name: "Philippines", dialCode: "63", minDigits: 10, maxDigits: 10 },
  { name: "Thailand", dialCode: "66", minDigits: 9, maxDigits: 9 },
  { name: "Japan", dialCode: "81", minDigits: 9, maxDigits: 10 },
  { name: "South Korea", dialCode: "82", minDigits: 9, maxDigits: 10 },
  { name: "China", dialCode: "86", minDigits: 10, maxDigits: 11 },
  { name: "Hong Kong", dialCode: "852", minDigits: 8, maxDigits: 8 },
  { name: "Taiwan", dialCode: "886", minDigits: 9, maxDigits: 9 },
  { name: "Bangladesh", dialCode: "880", minDigits: 10, maxDigits: 10 },
  { name: "Pakistan", dialCode: "92", minDigits: 10, maxDigits: 10 },
  { name: "Sri Lanka", dialCode: "94", minDigits: 9, maxDigits: 9 },
  { name: "Nepal", dialCode: "977", minDigits: 10, maxDigits: 10 },
  { name: "Germany", dialCode: "49", minDigits: 10, maxDigits: 11 },
  { name: "France", dialCode: "33", minDigits: 9, maxDigits: 9 },
  { name: "Italy", dialCode: "39", minDigits: 9, maxDigits: 10 },
  { name: "Spain", dialCode: "34", minDigits: 9, maxDigits: 9 },
  { name: "Netherlands", dialCode: "31", minDigits: 9, maxDigits: 9 },
  { name: "Belgium", dialCode: "32", minDigits: 9, maxDigits: 9 },
  { name: "Switzerland", dialCode: "41", minDigits: 9, maxDigits: 9 },
  { name: "Sweden", dialCode: "46", minDigits: 7, maxDigits: 9 },
  { name: "Norway", dialCode: "47", minDigits: 8, maxDigits: 8 },
  { name: "Denmark", dialCode: "45", minDigits: 8, maxDigits: 8 },
  { name: "Ireland", dialCode: "353", minDigits: 9, maxDigits: 9 },
  { name: "Portugal", dialCode: "351", minDigits: 9, maxDigits: 9 },
  { name: "Austria", dialCode: "43", minDigits: 10, maxDigits: 11 },
  { name: "Poland", dialCode: "48", minDigits: 9, maxDigits: 9 },
  { name: "Russia", dialCode: "7", minDigits: 10, maxDigits: 10 },
  { name: "South Africa", dialCode: "27", minDigits: 9, maxDigits: 9 },
  { name: "Nigeria", dialCode: "234", minDigits: 10, maxDigits: 10 },
  { name: "Kenya", dialCode: "254", minDigits: 9, maxDigits: 9 },
  { name: "Egypt", dialCode: "20", minDigits: 10, maxDigits: 10 },
  { name: "Brazil", dialCode: "55", minDigits: 10, maxDigits: 11 },
  { name: "Mexico", dialCode: "52", minDigits: 10, maxDigits: 10 },
];

export const DEFAULT_PHONE_COUNTRY = PHONE_COUNTRIES[0];

export function getLocalPhoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function validateLocalPhone(country: PhoneCountry, value: string): string | null {
  const digits = getLocalPhoneDigits(value);
  if (digits.length < country.minDigits || digits.length > country.maxDigits) {
    return "Enter a valid phone number for the selected country.";
  }
  if (country.dialCode === "91" && !/^[6-9]\d{9}$/.test(digits.replace(/^0/, ""))) {
    return "Enter a valid phone number for the selected country.";
  }
  return null;
}

export function toInternationalPhone(country: PhoneCountry, value: string): string {
  const digits = getLocalPhoneDigits(value).replace(/^0/, "");
  return `+${country.dialCode}${digits}`;
}