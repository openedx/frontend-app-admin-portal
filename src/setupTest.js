/* eslint-disable max-classes-per-file */
/* eslint-disable import/no-extraneous-dependencies */
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import ResizeObserverPolyfill from 'resize-observer-polyfill';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import 'jest-localstorage-mock';
import 'jest-canvas-mock';

jest.mock('@edx/frontend-platform/auth');
jest.mock('@edx/frontend-platform/logging');
jest.mock('@edx/frontend-platform/analytics');

// Set up axios mocks
export const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);
axios.isAccessTokenExpired = jest.fn();
axios.isAccessTokenExpired.mockReturnValue(false);

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  disconnect() {
    return null;
  }

  observe() {
    return null;
  }

  takeRecords() {
    return null;
  }

  unobserve() {
    return null;
  }
};

// Mock ResizeObserver
global.ResizeObserver = ResizeObserverPolyfill;

// Stub createObjectURL
global.URL.createObjectURL = jest.fn();

// Suppress specific console.error warnings
/* eslint-disable no-console */
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

const CONSOLE_FILTERS = {
  warn: [
    'PubSub already loaded',
  ],
  error: [
    'Support for defaultProps will be removed from function components',
  ],
};

// Override `console.error`
console.error = (...args) => {
  const message = args[0];
  if (
    typeof message === 'string'
      && CONSOLE_FILTERS.error.some(ignored => message.includes(ignored))
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Override `console.warn`
console.warn = (...args) => {
  const message = args[0];
  if (
    typeof message === 'string'
      && CONSOLE_FILTERS.warn.some(ignored => message.includes(ignored))
  ) {
    return;
  }
  originalConsoleWarn(...args);
};
/* eslint-enable no-console */

// TODO: Once there are no more console errors in tests, uncomment the code below
// const { error } = global.console;

// global.console.error = (...args) => {
//   error(...args);
//   throw new Error(args.join(' '));
// };
