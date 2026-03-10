/**
 * Billing-related constants shared across billing components.
 */

export interface Country {
  value: string;
  label: string;
}

/**
 * List of supported ISO 3166-1 alpha-2 country codes for billing and payment methods.
 *
 * This list includes all Stripe-supported countries as of 2024, excluding embargoed nations.
 * Source: https://stripe.com/global
 *
 * Country names are localized at runtime using the useCountryOptions hook,
 * which leverages the Intl.DisplayNames API to provide names in the user's locale.
 *
 * This list is used by both BillingAddressModal and AddPaymentMethodModal
 * to ensure consistency between billing addresses and payment methods.
 *
 * Embargoed countries explicitly excluded: RU, IR, KP, SY, CU, BY
 */
export const SUPPORTED_COUNTRY_CODES: string[] = [
  'AE', // United Arab Emirates
  'AT', // Austria
  'AU', // Australia
  'BE', // Belgium
  'BG', // Bulgaria
  'BR', // Brazil
  'CA', // Canada
  'CH', // Switzerland
  'CY', // Cyprus
  'CZ', // Czech Republic
  'DE', // Germany
  'DK', // Denmark
  'EE', // Estonia
  'ES', // Spain
  'FI', // Finland
  'FR', // France
  'GB', // United Kingdom
  'GI', // Gibraltar
  'GR', // Greece
  'HK', // Hong Kong
  'HR', // Croatia
  'HU', // Hungary
  'IE', // Ireland
  'IT', // Italy
  'JP', // Japan
  'LI', // Liechtenstein
  'LT', // Lithuania
  'LU', // Luxembourg
  'LV', // Latvia
  'MT', // Malta
  'MX', // Mexico
  'MY', // Malaysia
  'NL', // Netherlands
  'NO', // Norway
  'NZ', // New Zealand
  'PL', // Poland
  'PT', // Portugal
  'RO', // Romania
  'SE', // Sweden
  'SG', // Singapore
  'SI', // Slovenia
  'SK', // Slovakia
  'TH', // Thailand
  'US', // United States
];
