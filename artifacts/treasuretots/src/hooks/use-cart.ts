import { useState, useEffect, useRef } from 'react';
import { useGetCart, useAddToCart, useUpdateCartItem, useRemoveFromCart, useListProducts, Cart, CartItem } from '@workspace/api-client-react';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';

export interface LocalCartItem {
  productId: number;
  quantity: number;
  childName?: string | null;
  product?: CartItem["product"];
}

const LOCAL_CART_EVENT = "tt-cart-updated";

function readLocalCart(): LocalCartItem[] {
  if (typeof window === "undefined") return [];
  const saved = window.localStorage.getItem("tt_cart");
  return saved ? JSON.parse(saved) : [];
}

export function useCart() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [localCart, setLocalCart] = useState<LocalCartItem[]>(readLocalCart);
  const localCartRef = useRef(localCart);
  localCartRef.current = localCart;

  const setSyncedLocalCart = (updater: (previous: LocalCartItem[]) => LocalCartItem[]) => {
    const next = updater(localCartRef.current);
    localCartRef.current = next;
    if (typeof window !== "undefined") {
      window.localStorage.setItem("tt_cart", JSON.stringify(next));
      window.dispatchEvent(new Event(LOCAL_CART_EVENT));
    }
    setLocalCart(next);
  };

  const { data: serverCart, refetch: refetchServerCart, isLoading: isServerLoading } = useGetCart({
    query: { queryKey: ["getCart"], enabled: isAuthenticated }
  });

  const { data: allProductsData } = useListProducts({ per_page: 100 }, {
    query: { queryKey: ["listProducts", "all"], enabled: !isAuthenticated && localCart.length > 0 }
  });
  const allProducts = allProductsData?.products ?? [];

  const addToServerCart = useAddToCart();
  const updateServerCartItem = useUpdateCartItem();
  const removeFromServerCart = useRemoveFromCart();

  useEffect(() => {
    const syncFromStorage = () => {
      const next = readLocalCart();
      localCartRef.current = next;
      setLocalCart(next);
    };
    window.addEventListener(LOCAL_CART_EVENT, syncFromStorage);
    window.addEventListener("storage", syncFromStorage);
    return () => {
      window.removeEventListener(LOCAL_CART_EVENT, syncFromStorage);
      window.removeEventListener("storage", syncFromStorage);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated && localCart.length > 0) {
      const syncCart = async () => {
        for (const item of localCart) {
          try {
            await addToServerCart.mutateAsync({ data: item });
          } catch (e) {
            console.error("Failed to sync item", item, e);
          }
        }
        setSyncedLocalCart(() => []);
        refetchServerCart();
      };
      syncCart();
    }
  }, [isAuthenticated]);

  const addItem = async (
    productId: number,
    quantity: number = 1,
    childName?: string,
    productSnapshot?: CartItem["product"],
  ) => {
    if (isAuthenticated) {
      await addToServerCart.mutateAsync({ data: { productId, quantity, childName } });
      await refetchServerCart();
      toast({ title: "Added to cart" });
    } else {
      setSyncedLocalCart(prev => {
        const existing = prev.find(item => item.productId === productId && item.childName === childName);
        if (existing) {
          return prev.map(item => item === existing ? {
            ...item,
            quantity: item.quantity + quantity,
            product: productSnapshot ?? item.product,
          } : item);
        }
        return [...prev, { productId, quantity, childName, product: productSnapshot }];
      });
      toast({ title: "Added to cart" });
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (isAuthenticated) {
      await updateServerCartItem.mutateAsync({ productId, data: { quantity } });
      await refetchServerCart();
    } else {
      setSyncedLocalCart(prev => prev.map(item => item.productId === productId ? { ...item, quantity } : item));
    }
  };

  const removeItem = async (productId: number) => {
    if (isAuthenticated) {
      await removeFromServerCart.mutateAsync({ productId });
      await refetchServerCart();
      toast({ title: "Removed from cart" });
    } else {
      setSyncedLocalCart(prev => prev.filter(item => item.productId !== productId));
      toast({ title: "Removed from cart" });
    }
  };

  const clearLocalCart = () => {
    setSyncedLocalCart(() => []);
  };

  const localCartPopulated: CartItem[] = localCart.map(item => {
    const product = item.product ?? allProducts.find(p => p.id === item.productId);
    return {
      productId: item.productId,
      quantity: item.quantity,
      childName: item.childName,
      product: product as any,
    };
  }).filter(item => item.product);

  const localTotal = localCartPopulated.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  const cart: Cart = isAuthenticated && serverCart ? serverCart : {
    items: localCartPopulated,
    total: localTotal,
    itemCount: localCartPopulated.reduce((sum, item) => sum + item.quantity, 0)
  };

  return {
    cart,
    isLoading: isAuthenticated ? isServerLoading : false,
    addItem,
    updateQuantity,
    removeItem,
    clearLocalCart,
    refetch: refetchServerCart
  };
}
