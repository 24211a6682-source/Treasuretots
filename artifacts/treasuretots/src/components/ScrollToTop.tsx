import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Resets the window scroll position to the top on every route change.
 *
 * Mounted once inside the user layout so that opening a product from a listing,
 * following a "Recommended" product from another product page (A → B → C), or
 * using the in-app Back buttons always lands at the top of the new page instead
 * of inheriting the previous page's scroll offset. Driven by wouter's location
 * subscription (not a timeout), so it fires deterministically on each
 * client-side navigation.
 */
export function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}
