export interface AccountDashboardLabels {
  signOut: string;
  notifications: string;
  cart: string;
  myAccount: string;
  accountSettings: string;
  search: string;
  sidebar: {
    home: string;
    orders: string;
    shop: string;
    loyalty: string;
    settings: string;
    help: string;
  };
  wellness: {
    greeting: string;
    welcomeLead: string;
    hero: {
      basedOnSelection: string;
      title: string;
      subtitle: string;
      dailyTips: {
        title: string;
        description: string;
      };
      yourSupplies: {
        title: string;
        description: string;
      };
      exploreMore: string;
      tabs: {
        diabetes: string;
        sleepRest: string;
        changeSelection: string;
      };
    };
    actionCenter: {
      subscriptionTitle: string;
      subscriptionManage: string;
      subscriptionEmpty: string;
      orderHistory: string;
    };
    virtualCare: {
      title: string;
      consulting: string;
      carePack: string;
      pharmacy: string;
    };
  };
}

export interface AccountDashboardProps {
  customerName: string;
  cartHref: string;
  ordersHref: string;
  subscriptionsHref: string;
  shopHref: string;
  loyaltyHref: string;
  settingsHref: string;
  contactHref: string;
  logoutHref: string;
  nextSubscriptionDate: string | null;
  labels: AccountDashboardLabels;
}
