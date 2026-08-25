import type { ComponentType } from "react";
import { Link, useLocation } from "wouter";
import { Home, BookOpen, GraduationCap, LayoutGrid, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMobileMenu } from "@/hooks/use-mobile-menu";

interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  /** Highlights the tab for the section it represents, including detail pages. */
  isActive: (location: string) => boolean;
}

// Primary destinations only — this mirrors Amazon's *usability* pattern (a few
// thumb-reachable tabs), not its visual design. Secondary destinations live
// behind "More", which opens the existing mobile menu.
const navItems: NavItem[] = [
  { label: "Home", href: "/", icon: Home, isActive: (l) => l === "/" },
  { label: "Books", href: "/storybooks", icon: BookOpen, isActive: (l) => l.startsWith("/storybooks") },
  { label: "Learn", href: "/learning", icon: GraduationCap, isActive: (l) => l.startsWith("/learning") },
  { label: "Cards", href: "/flashcards", icon: LayoutGrid, isActive: (l) => l.startsWith("/flashcards") },
];

/**
 * Fixed bottom navigation, mobile only. Sits above the page content (a matching
 * spacer in the layout keeps it from covering the footer). Uses the TreasureTots
 * design tokens (primary accent for the active tab) rather than any third-party
 * styling.
 */
export function BottomNav() {
  const [location] = useLocation();
  const { setOpen } = useMobileMenu();

  const itemClasses = (active: boolean) =>
    cn(
      "flex h-16 w-full flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
      active ? "text-primary" : "text-muted-foreground hover:text-foreground",
    );

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary"
    >
      <ul className="grid grid-cols-5">
        {navItems.map((item) => {
          const active = item.isActive(location);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={itemClasses(active)}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
        <li>
          <button type="button" onClick={() => setOpen(true)} className={itemClasses(false)}>
            <Menu className="h-5 w-5" />
            <span>More</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
