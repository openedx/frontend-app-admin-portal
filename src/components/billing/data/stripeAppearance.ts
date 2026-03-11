import { Appearance } from '@stripe/stripe-js';

/**
 * Creates a Stripe Appearance object using Paragon CSS variables for consistent theming.
 * This ensures Stripe Elements match the admin portal's design system.
 *
 * @returns {Appearance} Stripe Appearance configuration object
 */
export const createStripeAppearance = (): Appearance => {
  // Get Paragon CSS variables from document root
  const root = document.documentElement;
  const getComputedVar = (varName: string): string => {
    const value = getComputedStyle(root).getPropertyValue(varName).trim();
    return value || '';
  };

  return {
    theme: 'stripe',
    variables: {
      colorPrimary: getComputedVar('--pgn-color-primary-500') || '#0075b4',
      colorBackground: getComputedVar('--pgn-color-white') || '#ffffff',
      colorText: getComputedVar('--pgn-color-text-primary') || '#000000',
      colorDanger: getComputedVar('--pgn-color-danger-500') || '#c32d3a',
      fontFamily: getComputedVar('--pgn-font-family-base') || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSizeBase: getComputedVar('--pgn-font-size-base') || '1rem',
      spacingUnit: getComputedVar('--pgn-spacing-base') || '1rem',
      borderRadius: getComputedVar('--pgn-border-radius') || '0.375rem',
    },
    rules: {
      '.Input': {
        borderColor: getComputedVar('--pgn-color-border') || '#707070',
        borderRadius: getComputedVar('--pgn-border-radius') || '0.375rem',
        fontSize: getComputedVar('--pgn-font-size-base') || '1rem',
        padding: '0.5rem 0.75rem',
      },
      '.Input:focus': {
        borderColor: getComputedVar('--pgn-color-primary-500') || '#0075b4',
        boxShadow: `0 0 0 0.2rem ${getComputedVar('--pgn-color-primary-100') || 'rgba(0, 117, 180, 0.25)'}`,
      },
      '.Input--invalid': {
        borderColor: getComputedVar('--pgn-color-danger-500') || '#c32d3a',
      },
      '.Label': {
        color: getComputedVar('--pgn-color-text-primary') || '#000000',
        fontSize: getComputedVar('--pgn-font-size-base') || '1rem',
        fontWeight: '400',
      },
      '.Error': {
        color: getComputedVar('--pgn-color-danger-500') || '#c32d3a',
        fontSize: getComputedVar('--pgn-font-size-sm') || '0.875rem',
      },
    },
  };
};
