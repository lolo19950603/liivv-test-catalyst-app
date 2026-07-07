'use client';

import { useEffect, useRef, useState } from 'react';

import { Link } from '~/components/link';
import type { AccountHeaderNotification } from '~/lib/account-notifications/types';

import { IconBell } from '../account-dashboard/icons';

function kindLabel(kind: AccountHeaderNotification['kind']) {
  return kind;
}

export function AccountNotificationsBell({
  notifications,
  unreadCount,
  labels,
}: {
  notifications: AccountHeaderNotification[];
  unreadCount: number;
  labels: {
    ariaLabel: string;
    unreadAria: string;
    panelTitle: string;
    empty: string;
  };
}) {
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

  const markRead = () => {
    setBadgeCount(0);
    void fetch('/api/account/notifications/mark-read', {
      method: 'POST',
      credentials: 'same-origin',
    }).catch(() => {});
  };

  const onToggle = () => {
    const next = !open;

    setOpen(next);

    if (next) {
      markRead();
    }
  };

  return (
    <div className="mhd-notifications" ref={rootRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={
          badgeCount > 0
            ? labels.unreadAria.replace('{count}', String(badgeCount))
            : labels.ariaLabel
        }
        className="mhd-icon-btn"
        onClick={onToggle}
        type="button"
      >
        <IconBell />
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
