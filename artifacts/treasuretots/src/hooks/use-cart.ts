import { useState, useEffect } from 'react';
import { useGetCart, useAddToCart, useUpdateCartItem, useRemoveFromCart, useListProducts, Cart, CartItem } from '@workspace/api-client-react';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';
import { readBuyNowIntent } from '@/lib/buy-now';

export interface LocalCartItem {
  productId: number;
  quantity: number;
  childName?: string | null;
}

export function useCart() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [localCart, setLocalCart] = useState<LocalCartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tt_cart');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

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
    localStorage.setItem('tt_cart', JSON.stringify(localCart));
  }, [localCart]);

  useEffect(() => {
    if (isAuthenticated && localCart.length > 0) {
      if (readBuyNowIntent()) {
        setLocalCart([]);
        return;
      }
      const syncCart = async () => {
        for (const item of localCart) {
          try {
            await addToServerCart.mutateAsync({ data: item });
          } catch (e) {
            console.error("Failed to sync item", item, e);
          }
        }
        setLocalCart([]);
        refetchServerCart();
      };
      syncCart();
    }
  }, [isAuthenticated]);

  const addItem = async (productId: number, quantity: number = 1, childName?: string) => {
    if (isAuthenticated) {
      await addToServerCart.mutateAsync({ data: { productId, quantity, childName } });
      refetchServerCart();
      toast({ title: "Added to cart" });
    } else {
      setLocalCart(prev => {
        const existing = prev.find(item => item.productId === productId && item.childName === childName);
        if (existing) {
          return prev.map(item => item === existing ? { ...item, quantity: item.quantity + quantity } : item);
        }
        return [...prev, { productId, quantity, childName }];
      });
      toast({ title: "Added to cart" });
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (isAuthenticated) {
      await updateServerCartItem.mutateAsync({ productId, data: { quantity } });
      refetchServerCart();
    } else {
      setLocalCart(prev => prev.map(item => item.productId === productId ? { ...item, quantity } : item));
    }
  };

  const removeItem = async (productId: number) => {
    if (isAuthenticated) {
      await removeFromServerCart.mutateAsync({ productId });
      refetchServerCart();
      toast({ title: "Removed from cart" });
    } else {
      setLocalCart(prev => prev.filter(item => item.productId !== productId));
      toast({ title: "Removed from cart" });
    }
  };

  const clearLocalCart = () => {
    setLocalCart([]);
  };

  const localCartPopulated: CartItem[] = localCart.map(item => {
    const product = allProducts.find(p => p.id === item.productId);
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
