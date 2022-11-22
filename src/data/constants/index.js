/* eslint-disable import/prefer-default-export */

/**
 * Maximum timestamp supported by browsers that won't
 * https://stackoverflow.com/questions/3290424/set-a-cookie-to-never-expire
 */
export const COOKIE_DISMISS_MAX_EXPIRY = 2147483647; // 2038-01-19 03:14:07 GMT
export const COOKIE_DISMISS_MAX_EXPIRY_DATE = new Date(COOKIE_DISMISS_MAX_EXPIRY * 1000).toUTCString();
