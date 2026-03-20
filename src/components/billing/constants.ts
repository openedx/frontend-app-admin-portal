import countries from 'i18n-iso-countries';

/**
 * Billing-related constants shared across billing components.
 */

export interface Country {
  value: string;
  label: string;
}

/**
 * List of embargoed countries that should be excluded from billing options.
 *
 * These countries are excluded due to international sanctions and trade restrictions:
 * BY (Belarus), CU (Cuba), IR (Iran), KP (North Korea), RU (Russia), SY (Syria)
 */
const EMBARGOED_COUNTRY_CODES = new Set(['BY', 'CU', 'IR', 'KP', 'RU', 'SY']);

/**
 * Get all supported ISO 3166-1 alpha-2 country codes for billing and payment methods.
 *
 * This function retrieves all officially assigned ISO 3166-1 alpha-2 codes from the
 * i18n-iso-countries package (available via @edx/frontend-platform dependency),
 * excluding embargoed nations.
 *
 * Country names are localized at runtime using the useCountryOptions hook,
 * which leverages the Intl.DisplayNames API to provide names in the user's locale.
 *
 * This list is used by both BillingAddressModal and AddPaymentMethodModal
 * to ensure consistency between billing addresses and payment methods.
 *
 * @returns Array of ISO 3166-1 alpha-2 country codes, excluding embargoed countries
 */
export const getSupportedCountryCodes = (): string[] => {
  const allCountryCodes = Object.keys(countries.getAlpha2Codes());
  return allCountryCodes.filter(code => !EMBARGOED_COUNTRY_CODES.has(code));
};
