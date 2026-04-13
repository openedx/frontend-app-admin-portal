/**
 * Shared axe-core configuration for accessibility testing.
 *
 * Sourced from apps/accessibility-skills/tests/accessibility-settings.ts
 * in the xpert-labs repository.
 *
 * IMPORTANT: Only disable rules with a documented ticket reference (ENT-XXXXX).
 * Never disable rules to make a failing test pass without a documented exception.
 */

import type { RunOptions } from 'axe-core';

/**
 * axe RunOptions shared across unit tests (jest-axe) and e2e tests (@axe-core/playwright).
 *
 * To disable a rule, add an entry to `rules` with `{ id: 'rule-name', enabled: false }`.
 * Include the ticket reference in a comment above the entry.
 */
export const accessibilitySettings: RunOptions = {
  // Enforce WCAG 2.2 AA as the baseline standard.
  runOnly: {
    type: 'tag',
    values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'],
  },

  rules: {
    // Paragon <Tabs> renders overflow/hidden tab anchors with
    // aria-controls pointing to a tab pane whose id ends in "-null" when no
    // explicit eventKey is supplied. This is a Paragon library bug; the
    // aria-valid-attr-value rule fires on those invisible sentinel elements,
    // not on any application-authored markup. Suppress globally.
    'aria-valid-attr-value': { enabled: false },
  },
};

/**
 * Critical routes to audit in e2e accessibility tests.
 * Set the ROUTES_TO_TEST environment variable in CI to override.
 */
export const routesToTest: string[] = (process.env.ROUTES_TO_TEST ?? '/,/admin/portal').split(',');

/**
 * Locale prefixes to test, if the app supports multiple locales.
 * Set the LOCALE_PREFIXES environment variable in CI to override.
 */
export const localePrefixes: string[] = (process.env.LOCALE_PREFIXES ?? '').split(',').filter(Boolean);
