'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { Image } from '~/components/image';
import { Link } from '~/components/link';

import hidingBehindLogo from './olivia-hiding-behind-liivv-logo.png';
import { OliviaFigure, type OliviaMood } from './olivia-figure';

import './olivia.css';

export type OliviaAuthScene = 'login' | 'register' | 'forgot-password';

export type OliviaAuthCopy = {
  kicker: string;
  heading: string;
  lead: string;
  mascotAlt: string;
  switcherLabel?: string;
  switcherHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  submitting: string;
  error: string;
  oneStepAway: string;
  almostDone: string;
  named: string;
  sent?: string;
  idle: string[];
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type FieldKey = 'firstName' | 'lastName' | 'email' | 'password' | 'confirmPassword';

type AuthSnapshot = {
  focused: FieldKey | null;
  filled: number;
  total: number;
  firstName: string;
  submitting: boolean;
  hasError: boolean;
  hasSuccess: boolean;
};

const EMPTY_SNAPSHOT: AuthSnapshot = {
  focused: null,
  filled: 0,
  total: 0,
  firstName: '',
  submitting: false,
  hasError: false,
  hasSuccess: false,
};

function isCountableInput(el: Element): el is HTMLInputElement | HTMLTextAreaElement {
  if (!(el instanceof HTMLInputElement) && !(el instanceof HTMLTextAreaElement)) {
    return false;
  }

  if (el instanceof HTMLInputElement) {
    const type = el.type.toLowerCase();

    if (
      type === 'hidden' ||
      type === 'submit' ||
      type === 'button' ||
      type === 'checkbox' ||
      type === 'radio' ||
      type === 'file'
    ) {
      return false;
    }
  }

  if (el.closest('[hidden], .grecaptcha-badge, iframe')) {
    return false;
  }

  return el.name !== 'g-recaptcha-response';
}

function fieldKeyFromInput(el: HTMLInputElement | HTMLTextAreaElement): FieldKey | null {
  const hay = `${el.name} ${el.id} ${el.getAttribute('autocomplete') ?? ''} ${el.type}`.toLowerCase();

  if (hay.includes('confirm')) return 'confirmPassword';
  if (hay.includes('first')) return 'firstName';
  if (hay.includes('last')) return 'lastName';
  if (el.type === 'email' || hay.includes('email')) return 'email';
  if (el.type === 'password' || hay.includes('password')) return 'password';

  return null;
}

function readSnapshot(root: HTMLElement): AuthSnapshot {
  const form = root.querySelector('form');
  const inputs = [...root.querySelectorAll('input, textarea')].filter(isCountableInput);
  let filled = 0;
  let firstName = '';
  let focused: FieldKey | null = null;
  const active = document.activeElement;

  for (const input of inputs) {
    if (input.value.trim()) filled += 1;

    const key = fieldKeyFromInput(input);

    if (key === 'firstName') {
      firstName = input.value.trim();
    }

    if (active === input) {
      focused = key;
    }
  }

  const submit = form?.querySelector('button[type="submit"]');
  const submitting = submit?.getAttribute('aria-busy') === 'true';
  const hasError = Boolean(
    root.querySelector(
      '[aria-invalid="true"], [class*="field-error"], [class*="form-status-light-background-error"], [class*="form-status-dark-background-error"]',
    ),
  );
  const hasSuccess = Boolean(
    root.querySelector(
      '[class*="form-status-light-background-success"], [class*="form-status-dark-background-success"]',
    ),
  );

  return {
    focused,
    filled,
    total: inputs.length,
    firstName,
    submitting,
    hasError,
    hasSuccess,
  };
}

function withName(template: string, name: string): string {
  return template.replaceAll('%name%', name);
}

function snapshotsEqual(a: AuthSnapshot, b: AuthSnapshot): boolean {
  return (
    a.focused === b.focused &&
    a.filled === b.filled &&
    a.total === b.total &&
    a.firstName === b.firstName &&
    a.submitting === b.submitting &&
    a.hasError === b.hasError &&
    a.hasSuccess === b.hasSuccess
  );
}

function pickLine(scene: OliviaAuthScene, copy: OliviaAuthCopy, snapshot: AuthSnapshot, idleIndex: number): string {
  if (snapshot.submitting) return copy.submitting;
  if (snapshot.hasSuccess) return copy.sent ?? copy.almostDone;
  if (snapshot.hasError) return copy.error;

  if (snapshot.focused === 'firstName') {
    return snapshot.firstName ? withName(copy.named, snapshot.firstName) : copy.firstName;
  }

  if (snapshot.focused === 'lastName') return copy.lastName;
  if (snapshot.focused === 'email') return copy.email;
  if (snapshot.focused === 'confirmPassword') return copy.confirmPassword;

  if (snapshot.focused === 'password') {
    if (scene === 'login') return copy.oneStepAway;
    return copy.password;
  }

  if (snapshot.total > 0 && snapshot.filled >= snapshot.total) return copy.almostDone;
  if (snapshot.total > 1 && snapshot.filled >= snapshot.total - 1) return copy.oneStepAway;

  if (snapshot.firstName) return withName(copy.named, snapshot.firstName);

  return copy.idle[idleIndex % Math.max(copy.idle.length, 1)] ?? copy.idle[0] ?? copy.lead;
}

function pickMood(snapshot: AuthSnapshot): OliviaMood {
  if (snapshot.submitting) return 'loading';
  if (snapshot.hasSuccess) return 'bounce';
  if (snapshot.hasError) return 'look';
  if (snapshot.total > 0 && snapshot.filled >= snapshot.total) return 'bounce';
  if (snapshot.focused) return 'look';
  if (snapshot.filled > 0) return 'wave';
  return 'live';
}

export function OliviaAuthStage({
  scene,
  copy,
  children,
}: {
  scene: OliviaAuthScene;
  copy: OliviaAuthCopy;
  children: ReactNode;
}) {
  const [snapshot, setSnapshot] = useState<AuthSnapshot>(EMPTY_SNAPSHOT);
  const [idleIndex, setIdleIndex] = useState(0);
  const [formRoot, setFormRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!formRoot) return;

    const sync = () => {
      const next = readSnapshot(formRoot);
      setSnapshot((prev) => (snapshotsEqual(prev, next) ? prev : next));
    };

    sync();

    formRoot.addEventListener('focusin', sync);
    formRoot.addEventListener('input', sync);
    formRoot.addEventListener('change', sync);
    formRoot.addEventListener('submit', sync);

    const onFocusOut = () => {
      window.setTimeout(sync, 0);
    };
    formRoot.addEventListener('focusout', onFocusOut);

    const observer = new MutationObserver(sync);
    observer.observe(formRoot, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['aria-busy', 'aria-invalid', 'disabled'],
    });

    return () => {
      formRoot.removeEventListener('focusin', sync);
      formRoot.removeEventListener('focusout', onFocusOut);
      formRoot.removeEventListener('input', sync);
      formRoot.removeEventListener('change', sync);
      formRoot.removeEventListener('submit', sync);
      observer.disconnect();
    };
  }, [formRoot]);

  useEffect(() => {
    if (snapshot.focused || snapshot.submitting || snapshot.hasError || snapshot.hasSuccess) return;
    if (copy.idle.length <= 1) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const id = window.setInterval(() => {
      setIdleIndex((current) => (current + 1) % copy.idle.length);
    }, 4200);

    return () => window.clearInterval(id);
  }, [copy.idle.length, snapshot.focused, snapshot.hasError, snapshot.hasSuccess, snapshot.submitting]);

  const line = useMemo(
    () => pickLine(scene, copy, snapshot, idleIndex),
    [copy, idleIndex, scene, snapshot],
  );
  const mood = pickMood(snapshot);

  return (
    <section className="olivia-auth" data-scene={scene} id="olivia-auth">
      <div className="olivia-auth__shell">
        <aside className="olivia-auth__companion">
          <div className="olivia-auth__mascot">
            <div className="olivia-auth__speech" key={line}>
              <p aria-live="polite" className="olivia-bubble olivia-bubble--center">
                {line}
              </p>
            </div>
            {scene === 'login' ? (
              <Image
                alt={copy.mascotAlt}
                className="olivia-auth__logo-scene"
                priority
                sizes="(min-width: 880px) 24rem, 22rem"
                src={hidingBehindLogo}
              />
            ) : (
              <OliviaFigure alt={copy.mascotAlt} mood={mood} priority size="lg" />
            )}
          </div>
          <div className="olivia-auth__intro">
            <span className="olivia-auth__kicker">{copy.kicker}</span>
            <h1>{copy.heading}</h1>
            <p>{copy.lead}</p>
            {copy.switcherLabel && copy.switcherHref ? (
              <div className="olivia-auth__links">
                <Link className="olivia-auth__switcher" href={copy.switcherHref}>
                  {copy.switcherLabel}
                </Link>
                {copy.secondaryLabel && copy.secondaryHref ? (
                  <Link className="olivia-auth__switcher" href={copy.secondaryHref}>
                    {copy.secondaryLabel}
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
        </aside>
        <div className="olivia-auth__card" ref={setFormRoot}>
          {children}
        </div>
      </div>
    </section>
  );
}
