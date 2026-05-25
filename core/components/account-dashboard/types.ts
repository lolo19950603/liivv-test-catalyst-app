export type DashboardPanelId =
  | 'main'
  | 'health-profile'
  | 'pharmacy'
  | 'insurance'
  | 'rewards'
  | 'orders'
  | 'subscriptions';

export interface AccountDashboardLabels {
  signOut: string;
  notifications: string;
  cart: string;
  myAccount: string;
  accountSettings: string;
  featuredNav: {
    prescriptions: string;
    appointments: string;
    metrics: string;
  };
  megaNav: string[];
  healthCenter: {
    greeting: {
      morning: string;
      afternoon: string;
      evening: string;
    };
    welcomeLead: string;
    prescriptions: {
      title: string;
      heading: string;
      description: string;
      cta: string;
    };
    appointments: {
      title: string;
      heading: string;
      description: string;
      cta: string;
    };
    quickLinksTitle: string;
    quickLinks: {
      prescriptions: { title: string; description: string };
      appointments: { title: string; description: string };
      metrics: { title: string; description: string };
    };
  };
}

export interface AccountDashboardProps {
  customerName: string;
  cartHref: string;
  ordersHref: string;
  logoutHref: string;
  labels: AccountDashboardLabels;
}
