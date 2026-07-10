export type AccountMenuLink = {
  href: string;
  label: string;
  prefetch?: 'none';
};

export function buildAccountMenuLinks(
  t: (key: 'dashboard' | 'orders' | 'subscriptions' | 'settings' | 'wishlists' | 'logout') => string,
): AccountMenuLink[] {
  return [
    { href: '/account/dashboard/', label: t('dashboard') },
    { href: '/account/orders/', label: t('orders') },
    { href: '/account/subscriptions/', label: t('subscriptions') },
    { href: '/account/settings/', label: t('settings') },
    { href: '/account/wishlists/', label: t('wishlists') },
    { href: '/logout', label: t('logout'), prefetch: 'none' },
  ];
}
