import { AnalyticsProvider } from '~/lib/analytics/types';

export interface GoogleAnalyticsConfig {
  gaId: string;
  consentModeEnabled?: boolean;
  developerId?: string;
  dataLayerName?: string;
  debugMode?: boolean;
  nonce?: string;
  getConsent?: () => Analytics.Consent.ConsentValues | null;
  /**
   * Whether the page being measured is one where advertising signals must be
   * off — an ostomy route, an ostomy shelf or product page, a cart holding
   * ostomy supplies (see ~/lib/analytics/ad-signals).
   *
   * Called while the tag is being set up, not when this object is built, so it
   * answers for the page the visitor actually landed on.
   */
  isSensitiveContext?: () => boolean;
}

/* The advertising half of consent. Never sent as 'granted' by this file. */
const AD_SIGNALS_DENIED: Gtag.ConsentParams = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
};

/* How long Google holds tags back waiting for an update to the default. */
const CONSENT_WAIT_FOR_UPDATE_MS = 500;

/*
 * What a health context's page parameters are replaced with. One constant, so
 * the hard-load path (`configParams`) and the soft-navigation path
 * (`redactPage`) cannot drift into reporting two different placeholders.
 */
const REDACTED_PATH = '/redacted';
const REDACTED_TITLE = 'Redacted';

export class GoogleAnalyticsProvider implements AnalyticsProvider {
  static #instance: GoogleAnalyticsProvider | null = null;

  readonly cart = this.getCartEvents();
  readonly navigation = this.getNavigationEvents();
  readonly consent = this.getConsentEvents();

  private readonly dataLayerScriptId = 'data-layer-script';
  private readonly gtagScriptId = 'gtag-script';

  constructor(private readonly config: GoogleAnalyticsConfig) {
    this.validateConfig();

    if (GoogleAnalyticsProvider.#instance) {
      return GoogleAnalyticsProvider.#instance;
    }

    GoogleAnalyticsProvider.#instance = this;
  }

  initialize() {
    if (typeof window === 'undefined') {
      throw new Error('Google Analytics is only available in the browser environment');
    }

    this.initializeDataLayer();
    this.initializeGTM();
  }

  /*
   * ===========================================================================
   * ADVERTISING SIGNALS OFF, FOR THE REST OF THIS PAGE SESSION
   * ===========================================================================
   * Called when a page turns out to be a health context after the tag was set
   * up: a client-side navigation into a chapter, a cart whose contents
   * changed, a product page whose sensitivity only arrived with its data.
   *
   * An update, not a new default — a default may only be set once, and by this
   * point gtag('config') has run. Google honours an update that lands within
   * `wait_for_update` before any tag fires, and after that it applies to
   * everything still to come.
   *
   * A no-op before the tag exists, which is the honest thing: with no gtag
   * there is nothing sending anything. The page's own server-rendered flag is
   * what keeps that case covered, because it is read while the very first
   * consent default is being written.
   * ===========================================================================
   */
  denyAdSignals() {
    if (typeof gtag === 'undefined') {
      return;
    }

    gtag('set', 'ads_data_redaction', true);
    gtag('consent', 'update', { ...AD_SIGNALS_DENIED });
  }

  /*
   * ===========================================================================
   * THE URL AND THE TITLE, REDACTED FROM HERE ON
   * ===========================================================================
   * `configParams` below redacts page_location and page_title, but it is read
   * once, while the tag is being set up. A client-side navigation writes no
   * second gtag('config'), so on a soft navigation into a chapter GA4's
   * enhanced measurement fires its own history-change page_view carrying the
   * real ostomy URL and the real chapter title — the exact thing the hard-load
   * path exists to prevent. This is the soft-navigation half of that, and it is
   * called from the same places, and on the same condition, as denyAdSignals.
   *
   * gtag('set') with no target id, so it applies to every event the tag sends
   * afterwards — not just the page_view. Ecommerce events carry page_location
   * too.
   *
   * STICKY, LIKE THE DENIAL, AND FOR A STRONGER REASON
   * ---------------------------------------------------------------------------
   * There is no honest way to lift this again. A `set` pins the parameter: once
   * page_location is set, GA4 stops deriving it, so un-setting means re-setting
   * it to the live values on every later navigation — and the history-change
   * page_view fires on pushState, BEFORE this effect could run, so every
   * subsequent page would be reported under the previous page's URL. That is
   * worse than losing the URL: it is wrong data.
   *
   * And lifting it would leak anyway. GA4's automatic page_referrer on the next
   * history-change page_view is the URL of the page just left — the ostomy one.
   * Redacting until the document is replaced is the only version that holds.
   *
   * The cost, stated plainly: after a visitor has been in a health context,
   * every page_view for the rest of that document's session reports
   * `<origin>/redacted` with the title "Redacted". Sessions, traffic sources
   * and events are all still counted; which pages they were on is not. A hard
   * navigation or a reload starts a new document and the redaction is gone.
   *
   * A no-op before the tag exists. The page's own server-rendered flag covers
   * the first load, because it is read while the very first config is written.
   * ===========================================================================
   */
  redactPage() {
    if (typeof gtag === 'undefined') {
      return;
    }

    gtag('set', {
      page_location: `${window.location.origin}${REDACTED_PATH}`,
      page_title: REDACTED_TITLE,
      page_referrer: `${window.location.origin}${REDACTED_PATH}`,
    });
  }

  private validateConfig() {
    if (!this.config.gaId) {
      throw new Error('Google Analytics requires a Google Analytics ID');
    }

    if (!this.config.dataLayerName) {
      this.config.dataLayerName = 'dataLayer';
    }
  }

  /*
   * ===========================================================================
   * WHAT THE TAG IS ALLOWED TO DO BEFORE ANYONE HAS SAID ANYTHING
   * ===========================================================================
   * Returns the consent default, or null to send none at all.
   *
   * The default used to be pushed after gtag('config'), which is too late: the
   * automatic page_view has already gone by then, and a default that arrives
   * after the first tag has fired cannot take it back. It is now written into
   * the same inline script, ahead of gtag('js') and gtag('config').
   *
   * That replaced upstream Catalyst's `initializeConsent()`, which no longer
   * exists here. Two things follow, and both belong in the merge plan rather
   * than in a surprise: the next Catalyst sync will conflict on this class, and
   * a channel that turns the cookie banner ON will see GA4 volume fall, because
   * a first page_view that used to go out unconditionally now waits on a stored
   * consent decision. Neither is a regression — the old order was the bug.
   *
   * On an ordinary page the answer is exactly what it was. With the cookie
   * banner off, Google is told nothing and treats every signal as granted;
   * that is a sitewide measurement decision and this is not the place to make
   * it. With the banner on, the stored consent decides, and no stored consent
   * means denied.
   *
   * A health context is the exception, banner or no banner: the three
   * advertising signals are denied, and a stored marketing opt-in does not
   * lift them. Ticking "marketing" on a cookie banner is not express consent
   * to advertise on the strength of someone's ostomy — the two are different
   * questions, and only one of them was asked. Measurement is left exactly as
   * it would otherwise be, so denying ads costs no analytics.
   * ===========================================================================
   */
  private consentDefaults(): Gtag.ConsentParams | null {
    const sensitive = this.config.isSensitiveContext?.() === true;

    if (!this.config.consentModeEnabled || !this.config.getConsent) {
      if (!sensitive) {
        return null;
      }

      return {
        ...AD_SIGNALS_DENIED,
        // Granted is what the banner-off channel does today for every other
        // page; nothing here changes measurement.
        analytics_storage: 'granted',
        wait_for_update: CONSENT_WAIT_FOR_UPDATE_MS,
      };
    }

    const consent = this.config.getConsent();
    const marketing = consent?.marketing === true && !sensitive;

    return {
      ad_storage: marketing ? 'granted' : 'denied',
      ad_user_data: marketing ? 'granted' : 'denied',
      ad_personalization: marketing ? 'granted' : 'denied',
      analytics_storage: consent?.measurement === true ? 'granted' : 'denied',
      wait_for_update: CONSENT_WAIT_FOR_UPDATE_MS,
    };
  }

  /*
   * ===========================================================================
   * THE PAGE'S OWN ADDRESS IS THE HEALTH FACT
   * ===========================================================================
   * gtag('config') sends an automatic page_view, and it carries page_location
   * and page_title. Suppressing the ecommerce items does nothing about it:
   * /liivv-health/ostomy-care/chapters/new-to-the-journey says why someone is
   * reading, and a product page is titled "SenSura 1-Piece Drainable Opaque".
   * With analytics_storage granted, that is stored against a client_id.
   *
   * So on a health context the three page parameters are overridden with one
   * constant that names nothing — the real hostname, a `/redacted` path, and a
   * redacted title and referrer. A page_view still goes out, so a session that
   * begins here is still counted and still keeps its traffic source; what GA4
   * cannot store is which page it was. That is the same trade the rest of this
   * file makes: measurement stays, the health fact does not.
   *
   * Not `send_page_view: false`, which would drop the session as well and cost
   * measurement the denial was never meant to cost.
   *
   * This is the HARD-LOAD half only: it is read once, while the tag is being
   * set up. A client-side navigation into a health context writes no second
   * config, and `redactPage()` above is what covers that — same placeholder,
   * called from the same places as `denyAdSignals`.
   *
   * Residual, recorded rather than hidden: a *hard* navigation from a health
   * page to an ordinary one lets that next page's own automatic page_view carry
   * the ostomy URL as page_referrer, because the next document is not a health
   * context and nothing overrides it there. That is the browser-reload and
   * target=_blank case; the soft-navigation equivalent is covered, because the
   * redaction from `redactPage()` outlives the route it was set on.
   * ===========================================================================
   */
  private configParams(sensitive: boolean): Record<string, unknown> {
    const params: Record<string, unknown> = {};

    if (this.config.debugMode) {
      params.debug_mode = true;
    }

    if (sensitive) {
      const redacted = `${window.location.origin}${REDACTED_PATH}`;

      params.page_location = redacted;
      params.page_title = REDACTED_TITLE;
      params.page_referrer = redacted;
    }

    return params;
  }

  private initializeDataLayer() {
    const existingScript = document.getElementById(this.dataLayerScriptId);

    if (existingScript) {
      return;
    }

    const defaults = this.consentDefaults();
    const sensitive = this.config.isSensitiveContext?.() === true;
    const params = this.configParams(sensitive);
    const configArgs = Object.keys(params).length > 0 ? `, ${JSON.stringify(params)}` : '';

    const script = document.createElement('script');

    script.id = this.dataLayerScriptId;
    script.type = 'text/javascript';
    script.nonce = this.config.nonce;
    script.innerHTML = `
      window['${this.config.dataLayerName}'] = window['${this.config.dataLayerName}'] || [];
      function gtag(){window['${this.config.dataLayerName}'].push(arguments);}
      ${defaults ? `gtag('consent', 'default', ${JSON.stringify(defaults)});` : ''}
      ${sensitive ? "gtag('set', 'ads_data_redaction', true);" : ''}
      gtag('js', new Date());

      ${this.config.developerId ? `gtag('set', 'developer_id.${this.config.developerId}', true)` : ''};
      gtag('config', '${this.config.gaId}'${configArgs});
    `;

    document.body.appendChild(script);
  }

  private initializeGTM() {
    const existingScript = document.getElementById(this.gtagScriptId);

    if (existingScript) {
      return;
    }

    const script = document.createElement('script');

    script.id = this.gtagScriptId;
    script.nonce = this.config.nonce;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.gaId}`;

    document.head.appendChild(script);
  }

  /*
   * ===========================================================================
   * HEALTH-REVEALING ITEMS ARE NEVER SENT
   * ===========================================================================
   * An item an emitter has flagged `sensitive` is left out of the event, and
   * an event whose items were all suppressed is not sent at all. An event that
   * carried no items in the first place is untouched and goes out as it always
   * did — emptiness is only a suppression when something was removed.
   *
   * Dropped rather than stripped of its name. Stripping item_name, item_brand
   * and item_category still sends item_id — which is the SKU, and a SKU joins
   * straight back to a Merchant Center or catalogue feed, so the name is one
   * lookup away. Price and value narrow it further. Suppression is the only
   * version of this that actually holds.
   *
   * `value` is summed from the items that are actually reported, never derived
   * by subtracting the suppressed ones from a cart total. The two numbers have
   * different bases — a line item's `price` is its LIST price, while the cart's
   * `value` is the SALE-priced subtotal — so subtracting one from the other
   * reports a total that does not match its own items, and the size of the
   * mismatch is a function of the health item that was meant to be invisible.
   * Summing what is reported is both the honest number and one that cannot
   * encode the suppressed line.
   * ===========================================================================
   */
  private toGa4Item(item: Analytics.Product, currency: string) {
    return {
      item_name: item.name,
      item_id: item.sku ?? item.id,
      price: item.price,
      quantity: item.quantity,
      currency,
      item_brand: item.brand,
      variant_id: item.variant_id,
      item_category: item.categories?.at(0),
      item_category2: item.categories?.at(1),
      item_category3: item.categories?.at(2),
      item_category4: item.categories?.at(3),
      item_category5: item.categories?.at(4),
    };
  }

  /* The ecommerce half of an event, or null when nothing may be reported. */
  private toGa4Ecommerce(payload: { currency: string; value: number; items: Analytics.Product[] }) {
    const reportable = payload.items.filter((item) => item.sensitive !== true);

    /*
     * Everything there was has been suppressed, so there is nothing left to
     * report and the event does not go out.
     *
     * An event that had no items to begin with is a different thing and is
     * left alone: an empty cart, or a shelf whose filters matched nothing,
     * sends what it always sent. Suppression may cost measurement only where
     * it is actually protecting something.
     */
    if (payload.items.length > 0 && reportable.length === 0) {
      return null;
    }

    const reportedValue = reportable.reduce(
      (total, item) => total + (item.price ?? 0) * (item.quantity ?? 1),
      0,
    );

    return {
      currency: payload.currency,
      // Nothing was suppressed, so the emitter's own total is the better
      // number: it is the real subtotal, discounts and all.
      value: reportable.length === payload.items.length ? payload.value : reportedValue,
      items: reportable.map((item) => this.toGa4Item(item, payload.currency)),
    };
  }

  private getCartEvents() {
    return {
      cartViewed: (payload, metadata) => {
        const ecommerce = this.toGa4Ecommerce(payload);

        if (!ecommerce) {
          return;
        }

        gtag('event', 'view_cart', {
          event_id: metadata.eventUuid,
          channel_id: metadata.channelId,
          ...ecommerce,
        });
      },
      productAdded: (payload, metadata) => {
        const ecommerce = this.toGa4Ecommerce(payload);

        if (!ecommerce) {
          return;
        }

        gtag('event', 'add_to_cart', {
          event_id: metadata.eventUuid,
          channel_id: metadata.channelId,
          ...ecommerce,
        });
      },
      productRemoved: (payload, metadata) => {
        const ecommerce = this.toGa4Ecommerce(payload);

        if (!ecommerce) {
          return;
        }

        gtag('event', 'remove_from_cart', {
          event_id: metadata.eventUuid,
          channel_id: metadata.channelId,
          ...ecommerce,
        });
      },
    } satisfies Analytics.Cart.ProviderEvents;
  }

  private getNavigationEvents() {
    return {
      categoryViewed: (payload, metadata) => {
        /*
         * A sensitive list is its own signal: "Ostomy Care" as item_list_name,
         * or its id, says what the visitor was looking at even with every item
         * gone — and so does a list of the products on that shelf, named or
         * not. The whole event stays behind, and the list flag alone is enough
         * to hold it: the emitter also flags every item on such a shelf, but
         * this must not depend on it having done so.
         */
        if (payload.sensitive === true) {
          return;
        }

        const reportable = payload.items.filter((item) => item.sensitive !== true);

        // Every item on this shelf was suppressed; a shelf that matched
        // nothing is not a suppression and still reports — see toGa4Ecommerce.
        if (payload.items.length > 0 && reportable.length === 0) {
          return;
        }

        gtag('event', 'view_item_list', {
          event_id: metadata.eventUuid,
          channel_id: metadata.channelId,
          item_list_id: payload.id,
          item_list_name: payload.name,
          items: reportable.map((item) => this.toGa4Item(item, payload.currency)),
        });
      },
      productViewed: (payload, metadata) => {
        const ecommerce = this.toGa4Ecommerce(payload);

        if (!ecommerce) {
          return;
        }

        gtag('event', 'view_item', {
          event_id: metadata.eventUuid,
          channel_id: metadata.channelId,
          ...ecommerce,
        });
      },
    } satisfies Analytics.Navigation.ProviderEvents;
  }

  private getConsentEvents() {
    return {
      consentUpdated: (consent) => {
        gtag('consent', 'update', {
          ad_storage: consent.marketing ? 'granted' : 'denied',
          ad_user_data: consent.marketing ? 'granted' : 'denied',
          ad_personalization: consent.marketing ? 'granted' : 'denied',
          analytics_storage: consent.measurement ? 'granted' : 'denied',
        });
      },
    } satisfies Analytics.Consent.ProviderEvents;
  }
}
