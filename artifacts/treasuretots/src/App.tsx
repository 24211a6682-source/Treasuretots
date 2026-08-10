import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";

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
import AdminLogin from "@/pages/admin-login";
import Login from "@/pages/login";
import Register from "@/pages/register";
import ShippingPolicy from "@/pages/shipping";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col relative">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
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
