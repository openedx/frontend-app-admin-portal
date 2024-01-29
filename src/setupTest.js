/* eslint-disable max-classes-per-file */
/* eslint-disable import/no-extraneous-dependencies */
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import ResizeObserverPolyfill from 'resize-observer-polyfill';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import 'jest-localstorage-mock';

jest.mock('@edx/frontend-platform/auth');
jest.mock('@edx/frontend-platform/logging');
jest.mock('@edx/frontend-platform/analytics');

// eslint-disable-next-line import/prefer-default-export
export const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);
axios.isAccessTokenExpired = jest.fn();
axios.isAccessTokenExpired.mockReturnValue(false);

// mock IntersectionObserver
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

global.ResizeObserver = ResizeObserverPolyfill;

// TODO: Once there are no more console errors in tests, uncomment the code below
// const { error } = global.console;

// global.console.error = (...args) => {
//   error(...args);
//   throw new Error(args.join(' '));
// };
