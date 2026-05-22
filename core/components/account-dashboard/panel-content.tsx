import type { AccountDashboardLabels, DashboardPanelId } from './types';

interface PanelProps {
  panel: DashboardPanelId;
  customerName: string;
  ordersHref: string;
  labels: AccountDashboardLabels;
}

export function DashboardPanelContent({ panel, customerName, ordersHref, labels }: PanelProps) {
  switch (panel) {
    case 'main':
      return (
        <>
          <header className="adc-panel__header">
            <h2 className="adc-panel__title">{labels.panels.main.title}</h2>
            <p className="adc-panel__lead">{labels.panels.main.lead}</p>
          </header>
          <div className="adc-grid adc-grid--stats">
            <article className="adc-card">
              <p className="adc-card__label">A1C trend</p>
              <p className="adc-card__value adc-stat-highlight">6.8%</p>
              <p className="adc-card__meta">Down 0.3 from last quarter</p>
            </article>
            <article className="adc-card">
              <p className="adc-card__label">Active prescriptions</p>
              <p className="adc-card__value">4</p>
              <p className="adc-card__meta">2 ready for refill</p>
            </article>
            <article className="adc-card">
              <p className="adc-card__label">Rewards balance</p>
              <p className="adc-card__value">1,240 pts</p>
              <p className="adc-card__meta">$12.40 toward your next order</p>
            </article>
            <article className="adc-card">
              <p className="adc-card__label">Next subscription</p>
              <p className="adc-card__value">May 28</p>
              <p className="adc-card__meta">CGM sensors · auto-ship</p>
            </article>
          </div>
          <div className="adc-grid" style={{ marginTop: '1rem' }}>
            <article className="adc-card">
              <p className="adc-card__label">Care team note</p>
              <p className="adc-card__meta">
                Your pharmacy sync is complete. Review insurance coverage before your next refill
                window.
              </p>
            </article>
            <article className="adc-card">
              <p className="adc-card__label">Quick actions</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                <button className="adc-button" type="button">
                  Schedule refill
                </button>
                <a className="adc-button adc-button--dark" href={ordersHref}>
                  View orders
                </a>
              </div>
            </article>
          </div>
        </>
      );

    case 'health-profile':
      return (
        <>
          <header className="adc-panel__header">
            <h2 className="adc-panel__title">{labels.panels.healthProfile.title}</h2>
            <p className="adc-panel__lead">{labels.panels.healthProfile.lead}</p>
          </header>
          <div className="adc-card adc-profile-grid" style={{ display: 'grid' }}>
            <div className="adc-field">
              <label htmlFor="adc-name">Full name</label>
              <input defaultValue={customerName} id="adc-name" name="name" type="text" />
            </div>
            <div className="adc-field">
              <label htmlFor="adc-dob">Date of birth</label>
              <input defaultValue="03/14/1978" id="adc-dob" name="dob" type="text" />
            </div>
            <div className="adc-field">
              <label htmlFor="adc-condition">Primary condition</label>
              <select defaultValue="type2" id="adc-condition" name="condition">
                <option value="type1">Type 1 diabetes</option>
                <option value="type2">Type 2 diabetes</option>
                <option value="prediabetes">Prediabetes</option>
              </select>
            </div>
            <div className="adc-field">
              <label htmlFor="adc-provider">Primary care provider</label>
              <input defaultValue="Dr. Rivera · Endocrinology" id="adc-provider" type="text" />
            </div>
            <div className="adc-field">
              <label htmlFor="adc-a1c">Latest A1C</label>
              <input defaultValue="6.8%" id="adc-a1c" type="text" />
            </div>
            <div className="adc-field">
              <label htmlFor="adc-target">Glucose target range</label>
              <input defaultValue="80 – 130 mg/dL fasting" id="adc-target" type="text" />
            </div>
          </div>
          <p style={{ marginTop: '1rem' }}>
            <button className="adc-button adc-button--dark" type="button">
              Save profile
            </button>
          </p>
        </>
      );

    case 'pharmacy':
      return (
        <>
          <header className="adc-panel__header">
            <h2 className="adc-panel__title">{labels.panels.pharmacy.title}</h2>
            <p className="adc-panel__lead">{labels.panels.pharmacy.lead}</p>
          </header>
          <ul className="adc-list">
            <li className="adc-list-item">
              <div>
                <strong>Metformin 500mg</strong>
                <p className="adc-card__meta" style={{ margin: '0.25rem 0 0' }}>
                  Liivv Pharmacy · 30-day supply
                </p>
              </div>
              <span className="adc-pill">Ready</span>
            </li>
            <li className="adc-list-item">
              <div>
                <strong>Freestyle Libre 3</strong>
                <p className="adc-card__meta" style={{ margin: '0.25rem 0 0' }}>
                  Sensors (2-pack)
                </p>
              </div>
              <span className="adc-pill">Processing</span>
            </li>
            <li className="adc-list-item">
              <div>
                <strong>Insulin pen needles</strong>
                <p className="adc-card__meta" style={{ margin: '0.25rem 0 0' }}>
                  Refill due in 5 days
                </p>
              </div>
              <span className="adc-pill">Due soon</span>
            </li>
          </ul>
        </>
      );

    case 'insurance':
      return (
        <>
          <header className="adc-panel__header">
            <h2 className="adc-panel__title">{labels.panels.insurance.title}</h2>
            <p className="adc-panel__lead">{labels.panels.insurance.lead}</p>
          </header>
          <div className="adc-grid">
            <article className="adc-card">
              <p className="adc-card__label">Plan</p>
              <p className="adc-card__value">Blue Shield PPO</p>
              <p className="adc-card__meta">Member ID ·••• 4821</p>
            </article>
            <article className="adc-card">
              <p className="adc-card__label">DME coverage</p>
              <p className="adc-card__value">80%</p>
              <p className="adc-card__meta">After deductible · CGM included</p>
            </article>
            <article className="adc-card">
              <p className="adc-card__label">Pharmacy tier</p>
              <p className="adc-card__value">Tier 2</p>
              <p className="adc-card__meta">Preferred brand copay $35</p>
            </article>
          </div>
        </>
      );

    case 'rewards':
      return (
        <>
          <header className="adc-panel__header">
            <h2 className="adc-panel__title">{labels.panels.rewards.title}</h2>
            <p className="adc-panel__lead">{labels.panels.rewards.lead}</p>
          </header>
          <div className="adc-grid">
            <article className="adc-card">
              <p className="adc-card__label">Available points</p>
              <p className="adc-card__value adc-stat-highlight">1,240</p>
              <p className="adc-card__meta">Earned 180 pts this month</p>
            </article>
            <article className="adc-card">
              <p className="adc-card__label">Next reward</p>
              <p className="adc-card__value">$15 off</p>
              <p className="adc-card__meta">260 pts to unlock</p>
            </article>
          </div>
          <ul className="adc-list" style={{ marginTop: '1rem' }}>
            <li className="adc-list-item">
              <span>Refill on time</span>
              <span className="adc-pill">+50 pts</span>
            </li>
            <li className="adc-list-item">
              <span>Subscription loyalty</span>
              <span className="adc-pill">+30 pts</span>
            </li>
            <li className="adc-list-item">
              <span>Care survey completed</span>
              <span className="adc-pill">+25 pts</span>
            </li>
          </ul>
        </>
      );

    case 'orders':
      return (
        <>
          <header className="adc-panel__header">
            <h2 className="adc-panel__title">{labels.panels.orders.title}</h2>
            <p className="adc-panel__lead">{labels.panels.orders.lead}</p>
          </header>
          <ul className="adc-list">
            <li className="adc-list-item">
              <div>
                <strong>Order #1042</strong>
                <p className="adc-card__meta" style={{ margin: '0.25rem 0 0' }}>
                  May 12, 2026 · Delivered
                </p>
              </div>
              <span>$86.40</span>
            </li>
            <li className="adc-list-item">
              <div>
                <strong>Order #1038</strong>
                <p className="adc-card__meta" style={{ margin: '0.25rem 0 0' }}>
                  Apr 28, 2026 · Shipped
                </p>
              </div>
              <span>$124.00</span>
            </li>
            <li className="adc-list-item">
              <div>
                <strong>Order #1031</strong>
                <p className="adc-card__meta" style={{ margin: '0.25rem 0 0' }}>
                  Apr 10, 2026 · Delivered
                </p>
              </div>
              <span>$52.15</span>
            </li>
          </ul>
          <p style={{ marginTop: '1.25rem' }}>
            <a className="adc-button adc-button--dark" href={ordersHref}>
              {labels.panels.orders.viewAll}
            </a>
          </p>
        </>
      );

    case 'subscriptions':
      return (
        <>
          <header className="adc-panel__header">
            <h2 className="adc-panel__title">{labels.panels.subscriptions.title}</h2>
            <p className="adc-panel__lead">{labels.panels.subscriptions.lead}</p>
          </header>
          <ul className="adc-list">
            <li className="adc-list-item">
              <div>
                <strong>CGM sensor kit</strong>
                <p className="adc-card__meta" style={{ margin: '0.25rem 0 0' }}>
                  Every 30 days · Next ship May 28
                </p>
              </div>
              <span className="adc-pill">Active</span>
            </li>
            <li className="adc-list-item">
              <div>
                <strong>Test strips (100 ct)</strong>
                <p className="adc-card__meta" style={{ margin: '0.25rem 0 0' }}>
                  Every 60 days · Paused
                </p>
              </div>
              <span className="adc-pill">Paused</span>
            </li>
          </ul>
          <p style={{ marginTop: '1rem' }}>
            <button className="adc-button" type="button">
              Manage subscriptions
            </button>
          </p>
        </>
      );

    default:
      return null;
  }
}
