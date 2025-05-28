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
// eslint-disable-next-line no-console
const originalConsoleError = console.error;

const ignoredErrors = [
  'Support for defaultProps will be removed from function components',
  // Add more substrings to ignore additional warnings
];

// eslint-disable-next-line no-console
console.error = (...args) => {
  const message = args[0];

  if (
    typeof message === 'string'
      && ignoredErrors.some(ignored => message.includes(ignored))
  ) {
    return; // Suppress matched warning
  }

  originalConsoleError(...args); // Log everything else
};

// TODO: Once there are no more console errors in tests, uncomment the code below
// const { error } = global.console;

// global.console.error = (...args) => {
//   error(...args);
//   throw new Error(args.join(' '));
// };
