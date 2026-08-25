import { createContext, useContext, useState, type ReactNode } from "react";

interface MobileMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const MobileMenuContext = createContext<MobileMenuContextValue | null>(null);

/**
 * Shares the open-state of the mobile navigation Sheet (rendered by the Navbar)
 * so that the "More" tab in the bottom navigation can open the very same menu.
 * Keeping a single source of truth avoids a second, competing drawer.
 */
export function MobileMenuProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <MobileMenuContext.Provider value={{ open, setOpen }}>
      {children}
    </MobileMenuContext.Provider>
  );
}

export function useMobileMenu(): MobileMenuContextValue {
  const context = useContext(MobileMenuContext);
  if (!context) {
    // Defensive no-op so a consumer rendered outside the provider never crashes
    // the whole layout; in practice Navbar and BottomNav are always wrapped.
    return { open: false, setOpen: () => {} };
  }
  return context;
}
