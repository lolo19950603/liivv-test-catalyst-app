'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { usePathname } from '~/i18n/routing';
import { notifyCartUpdated } from '~/lib/cart/cart-updated-event';

import { MiniCartDrawer } from './mini-cart-drawer';

export function isCartPathname(pathname: string | null | undefined): boolean {
  if (!pathname) {
    return false;
  }

  return pathname === '/cart' || pathname.endsWith('/cart');
}

interface MiniCartContextValue {
  isOpen: boolean;
  openMiniCart: () => void;
  closeMiniCart: () => void;
}

const MiniCartContext = createContext<MiniCartContextValue | null>(null);

export function MiniCartProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const pathname = usePathname();
  const onCartPage = isCartPathname(pathname);

  const openMiniCart = useCallback(() => {
    if (onCartPage) {
      return;
    }

    setOpen(true);
    notifyCartUpdated();
  }, [onCartPage]);

  const closeMiniCart = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (onCartPage) {
      setOpen(false);
    }
  }, [onCartPage]);

  const value = useMemo(
    () => ({ isOpen, openMiniCart, closeMiniCart }),
    [isOpen, openMiniCart, closeMiniCart],
  );

  return (
    <MiniCartContext.Provider value={value}>
      {children}
      <MiniCartDrawer onOpenChange={setOpen} open={isOpen} />
    </MiniCartContext.Provider>
  );
}

export function useMiniCart(): MiniCartContextValue {
  const context = useContext(MiniCartContext);

  if (!context) {
    return {
      isOpen: false,
      openMiniCart: () => undefined,
      closeMiniCart: () => undefined,
    };
  }

  return context;
}
