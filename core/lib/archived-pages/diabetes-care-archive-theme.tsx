'use client';

import { useEffect, type ReactNode } from 'react';

import { DIABETES_CARE_SCROLL_ANIMATE_CSS } from '~/lib/makeswift/diabetes-care-scroll-animate';
import { DIABETES_CARE_MOBILE_RESPONSIVE_CSS } from '~/lib/makeswift/diabetes-care-mobile-responsive';

import { ACCORDION_DETAILS_CSS } from './accordion-details-css';
import { scheduleAccordionDetailsInit } from './accordion-details-element';
import { initShopifyButtonFillHover } from './init-shopify-button-fill-hover';
import { SHOPIFY_BUTTON_HOVER_CSS } from './shopify-button-hover-css';
const HTML_JS_CLASS = 'js';
const BODY_DATA_ATTRIBUTES: Record<string, string> = {
  'data-button-hover': 'standard',
  'data-rounded-button': 'round',
  'data-rounded-input': 'round-slight',
  'data-rounded-block': 'round',
  'data-rounded-card': 'round',
};

/**
 * Applies archived Shopify theme document attributes required by
 * `diabetes-care-sections.css` (button hover, radii, etc.).
 */
export function DiabetesCareArchiveTheme({ children }: { children: ReactNode }) {
  useEffect(() => {
    const { documentElement: html, body } = document;

    html.classList.add(HTML_JS_CLASS);

    const previousBodyAttrs: Record<string, string | null> = {};

    for (const [key, value] of Object.entries(BODY_DATA_ATTRIBUTES)) {
      previousBodyAttrs[key] = body.getAttribute(key);
      body.setAttribute(key, value);
    }

    let teardownButtonFill: (() => void) | undefined;
    let teardownAccordion: (() => void) | undefined;
    const frameId = requestAnimationFrame(() => {
      teardownButtonFill = initShopifyButtonFillHover(document);
    });

    teardownAccordion = scheduleAccordionDetailsInit();

    return () => {
      cancelAnimationFrame(frameId);
      teardownButtonFill?.();
      teardownAccordion?.();
      html.classList.remove(HTML_JS_CLASS);

      for (const [key, previous] of Object.entries(previousBodyAttrs)) {
        if (previous == null) {
          body.removeAttribute(key);
        } else {
          body.setAttribute(key, previous);
        }
      }
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SHOPIFY_BUTTON_HOVER_CSS }} />
      <style dangerouslySetInnerHTML={{ __html: ACCORDION_DETAILS_CSS }} />
      <style dangerouslySetInnerHTML={{ __html: DIABETES_CARE_SCROLL_ANIMATE_CSS }} />
      <style dangerouslySetInnerHTML={{ __html: DIABETES_CARE_MOBILE_RESPONSIVE_CSS }} />
      {children}
    </>
  );
}
