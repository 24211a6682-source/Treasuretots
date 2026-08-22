import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, ShoppingCart, User, Menu, X } from "lucide-react";
import { useSearchProducts } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { searchStaticCatalog } from "@/lib/products";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const { cart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const firstName = user?.name.trim().split(/\s+/)[0];
  const searchQuery = searchInput.trim().replace(/\s+/g, " ");
  const hasSearchQuery = isSearchOpen && searchQuery.length > 0;
  const {
    data: searchResults = [],
    isFetching: isSearching,
    isError: hasSearchError,
  } = useSearchProducts(
    { q: searchQuery },
    {
      query: {
        enabled: hasSearchQuery,
        queryKey: ["searchProducts", searchQuery],
      },
    },
  );
  const catalogResults = useMemo(() => {
    const uniqueResults = new Map<string, {
      id: string;
      name: string;
      categoryLabel: string;
      coverImage: string;
      href: string;
    }>();

    for (const product of searchResults) {
      const href = `/${product.category}/${product.slug}`;
      uniqueResults.set(`product-${product.id}`, {
        id: `product-${product.id}`,
        name: product.name,
        categoryLabel: product.category,
        coverImage: product.coverImage,
        href,
      });
    }

    for (const product of searchStaticCatalog(searchQuery)) {
      uniqueResults.set(product.id, product);
    }

    return [...uniqueResults.values()];
  }, [searchQuery, searchResults]);

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchInput("");
  };

  const selectProduct = (href: string) => {
    closeSearch();
    setLocation(href);
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Story Books", href: "/storybooks" },
    { label: "Learning", href: "/learning" },
    { label: "Flash Cards", href: "/flashcards" },
    { label: "Wallpapers", href: "/wallpapers" },
    { label: "Name Tags", href: "/labels" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                {isAuthenticated && firstName && (
                  <Link href="/dashboard" className="rounded-xl bg-orange-50 px-4 py-3 text-sm font-semibold text-primary">
                    Welcome, {firstName}
                  </Link>
                )}
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} className={`text-lg font-medium transition-colors hover:text-primary ${location === link.href ? "text-primary" : "text-muted-foreground"}`}>
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2">
            <img src="/assets/images/logo.png" alt="TreasureTots Logo" className="h-10 object-contain" />
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={`text-sm font-medium transition-colors hover:text-primary ${location === link.href ? "text-primary" : "text-muted-foreground"}`}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated && firstName && (
            <Link href="/dashboard" className="hidden lg:block text-sm font-semibold text-primary hover:underline">
              Welcome, {firstName}
            </Link>
          )}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground"
              onClick={() => setIsSearchOpen((open) => !open)}
              aria-expanded={isSearchOpen}
              aria-controls="catalog-search"
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search products</span>
            </Button>
            {isSearchOpen && (
              <div
                id="catalog-search"
                className="absolute right-0 top-12 z-[60] w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border bg-background p-3 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <Input
                    autoFocus
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") closeSearch();
                    }}
                    placeholder="Search products..."
                    aria-label="Search products"
                    className="h-9 border-0 p-0 shadow-none focus-visible:ring-0"
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={closeSearch}>
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close search</span>
                  </Button>
                </div>

                {hasSearchQuery && (
                  <div className="mt-3 max-h-80 overflow-y-auto border-t pt-2">
                    {isSearching && catalogResults.length === 0 ? (
                      <p className="px-2 py-3 text-sm text-muted-foreground">Searching products...</p>
                    ) : hasSearchError && catalogResults.length === 0 ? (
                      <p className="px-2 py-3 text-sm text-destructive">Could not search products. Please try again.</p>
                    ) : catalogResults.length === 0 ? (
                      <p className="px-2 py-3 text-sm text-muted-foreground">No products found for “{searchQuery}”.</p>
                    ) : (
                      <ul className="space-y-1">
                        {catalogResults.map((product) => {
                          return (
                            <li key={product.id}>
                              <button
                                type="button"
                                onClick={() => selectProduct(product.href)}
                                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted"
                              >
                                <img
                                  src={product.coverImage}
                                  alt=""
                                  className="h-10 w-10 rounded-md bg-muted object-cover"
                                />
                                <span className="min-w-0">
                                  <span className="block truncate text-sm font-medium">{product.name}</span>
                                  <span className="block text-xs capitalize text-muted-foreground">{product.categoryLabel}</span>
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}
                {!hasSearchQuery && (
                  <p className="mt-3 border-t px-2 pt-3 text-sm text-muted-foreground">
                    Search the TreasureTots catalog by product name.
                  </p>
                )}
              </div>
            )}
          </div>
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative text-foreground">
              <ShoppingCart className="h-5 w-5" />
              {cart && cart.itemCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full">
                  {cart.itemCount}
                </Badge>
              )}
              <span className="sr-only">Cart</span>
            </Button>
          </Link>
          <Link href={isAuthenticated ? "/dashboard" : "/login"}>
            <Button variant="ghost" size="icon" className="text-foreground">
              <User className="h-5 w-5" />
              <span className="sr-only">Account</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}