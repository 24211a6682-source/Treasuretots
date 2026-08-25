import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { BottomNav } from "@/components/layout/BottomNav";
import { ScrollToTop } from "@/components/ScrollToTop";
import { MobileMenuProvider } from "@/hooks/use-mobile-menu";

import Home from "@/pages/home";
import Learning from "@/pages/learning";
import LearningDetail from "@/pages/learning-detail";
import Flashcards from "@/pages/flashcards";
import FlashcardDetail from "@/pages/flashcards-detail";
import Storybooks from "@/pages/storybooks";
import StorybookDetail from "@/pages/storybook-detail";
import Wallpapers from "@/pages/wallpapers";
import Labels from "@/pages/labels";
import LabelDetail from "@/pages/label-detail";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import OrderSuccess from "@/pages/order-success";
import Dashboard from "@/pages/dashboard";
import Admin from "@/pages/admin";
import AdminOrders from "@/pages/admin-orders";
import AdminLogin from "@/pages/admin-login";
import Login from "@/pages/login";
import Register from "@/pages/register";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import BuyNow from "@/pages/buy-now";
import ShippingPolicy from "@/pages/shipping";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileMenuProvider>
      <div className="flex min-h-[100dvh] flex-col relative">
        {/* Reset scroll to top on every route change (product A → recommended B → C). */}
        <ScrollToTop />
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        {/* Spacer so the fixed mobile bottom navigation never overlaps the footer. */}
        <div className="h-16 md:hidden" aria-hidden="true" />
        <FloatingWhatsApp />
        <BottomNav />
      </div>
    </MobileMenuProvider>
  );
}

function UserRouter() {
  return (
    <UserLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/learning" component={Learning} />
        <Route path="/learning/:slug" component={LearningDetail} />
        <Route path="/flashcards" component={Flashcards} />
        <Route path="/flashcards/:slug" component={FlashcardDetail} />
        <Route path="/storybooks" component={Storybooks} />
        <Route path="/storybooks/:slug" component={StorybookDetail} />
        <Route path="/wallpapers" component={Wallpapers} />
        <Route path="/labels" component={Labels} />
        <Route path="/labels/:slug" component={LabelDetail} />
        <Route path="/cart" component={Cart} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/order-success" component={OrderSuccess} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/shipping" component={ShippingPolicy} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/buy-now" component={BuyNow} />
        <Route component={NotFound} />
      </Switch>
    </UserLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Switch>
            {/* Admin routes — completely separate UI, no user layout */}
            <Route path="/admin/login" component={AdminLogin} />
            <Route path="/admin/orders" component={AdminOrders} />
            <Route path="/admin" component={Admin} />
            {/* All user-facing routes wrapped in UserLayout */}
            <Route component={UserRouter} />
          </Switch>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
