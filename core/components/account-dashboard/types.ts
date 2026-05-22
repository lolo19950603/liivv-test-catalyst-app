export type DashboardPanelId =
  | 'main'
  | 'health-profile'
  | 'pharmacy'
  | 'insurance'
  | 'rewards'
  | 'orders'
  | 'subscriptions';

export interface DashboardNavItem {
  id: DashboardPanelId;
  label: string;
  icon: string;
}

export interface AccountDashboardLabels {
  brandEyebrow: string;
  brandTitle: string;
  signOut: string;
  notifications: string;
  cart: string;
  needHelpTitle: string;
  needHelpBody: string;
  needHelpToggle: string;
  nav: Record<DashboardPanelId, string>;
  panels: {
    main: { title: string; lead: string };
    healthProfile: { title: string; lead: string };
    pharmacy: { title: string; lead: string };
    insurance: { title: string; lead: string };
    rewards: { title: string; lead: string };
    orders: { title: string; lead: string; viewAll: string };
    subscriptions: { title: string; lead: string };
  };
}

export interface AccountDashboardProps {
  customerName: string;
  cartHref: string;
  ordersHref: string;
  logoutHref: string;
  labels: AccountDashboardLabels;
}
