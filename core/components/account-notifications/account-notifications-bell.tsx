'use client';

import { useEffect, useRef, useState } from 'react';

import { useTranslations } from 'next-intl';

import { Link } from '~/components/link';
import type { AccountHeaderNotification } from '~/lib/account-notifications/types';

import { IconBell } from '../account-dashboard/icons';

export function AccountNotificationsBell({
  notifications,
  unreadCount,
  labels,
  variant = 'icon',
  onOpen,
}: {
  notifications: AccountHeaderNotification[];
  unreadCount: number;
  labels: {
    ariaLabel: string;
    panelTitle: string;
    empty: string;
    kindOrder: string;
    kindSubscription: string;
  };
  variant?: 'icon' | 'menu';
  onOpen?: () => void;
}) {
  const t = useTranslations('Account.Dashboard');
  const [open, setOpen] = useState(false);
  const [badgeCount, setBadgeCount] = useState(unreadCount);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setBadgeCount(unreadCount);
  }, [unreadCount]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current != null && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const markRead = async () => {
    try {
      const response = await fetch('/api/account/notifications/mark-read', {
        method: 'POST',
        credentials: 'same-origin',
      });

      if (response.ok) {
        setBadgeCount(0);
      }
    } catch {
      /* keep badge until next refresh */
    }
  };

  const onToggle = () => {
    const next = !open;

    setOpen(next);

    if (next) {
      onOpen?.();
      void markRead();
    }
  };

  const kindLabel = (kind: AccountHeaderNotification['kind']) =>
    kind === 'order' ? labels.kindOrder : labels.kindSubscription;

  return (
    <div
      className={
        variant === 'menu' ? 'mhd-notifications mhd-notifications--menu' : 'mhd-notifications'
      }
      ref={rootRef}
    >
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={
          badgeCount > 0
            ? t('notificationsUnread', { count: badgeCount })
            : labels.ariaLabel
        }
        className={variant === 'menu' ? 'mhd-account-menu__notifications' : 'mhd-icon-btn'}
        onClick={onToggle}
        type="button"
      >
        <IconBell />
        {variant === 'menu' ? <span>{labels.ariaLabel}</span> : null}
        {badgeCount > 0 ? (
          <span aria-hidden className="mhd-badge">
            {badgeCount > 9 ? '9+' : badgeCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="mhd-notifications__panel" role="menu">
          <div className="mhd-notifications__title">{labels.panelTitle}</div>
          <div className="mhd-notifications__list">
            {notifications.length === 0 ? (
              <p className="mhd-notifications__empty">{labels.empty}</p>
            ) : (
              <ul className="mhd-notifications__items">
                {notifications.map((notification) => (
                  <li key={notification.id}>
                    <Link
                      className="mhd-notifications__item"
                      href={notification.href}
                      onClick={() => setOpen(false)}
                      role="menuitem"
                    >
                      <p className="mhd-notifications__kind">{kindLabel(notification.kind)}</p>
                      <p className="mhd-notifications__item-title">{notification.title}</p>
                      <p className="mhd-notifications__item-body">{notification.body}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
