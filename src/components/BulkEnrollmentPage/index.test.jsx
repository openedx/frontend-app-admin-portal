import React from 'react';
import { act, screen } from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import BulkEnrollmentPage from './index';

import { SUBSCRIPTION_DAYS_REMAINING_MODERATE } from '../subscriptions/data/constants';
import LicenseManagerApiService from '../../data/services/LicenseManagerAPIService';
import { ROUTE_NAMES } from '../EnterpriseApp/constants';
import { ADD_COURSES_TITLE } from './stepper/constants';
import { renderWithRouter } from '../test/testUtils';
import '../../../__mocks__/react-instantsearch-dom';

jest.mock('../../data/services/LicenseManagerAPIService', () => ({
  __esModule: true,
  default: {
    fetchSubscriptions: jest.fn(),
    fetchSubscriptionUsersOverview: jest.fn(),
  },
}));

const testSlug = 'horsesRus';

const sub1 = {
  uuid: 'foo',
  title: 'horse subscription',
  enterpriseSlug: testSlug,
  startDate: '01-01-2021',
  expirationDate: '04-21-2021',
  daysUntilExpiration: 0,
  licenses: {
    allocated: 5,
    total: 20,
  },
  enterpriseCatalogUuid: 'blarghl2',
};

// force the expiration modal to not expire by default to avoid
// needing to close it in unrelated tests
const numDaysUntilExpiration = SUBSCRIPTION_DAYS_REMAINING_MODERATE + 1;
const futureExpirationDate = new Date();
futureExpirationDate.setDate(futureExpirationDate.getDate() + numDaysUntilExpiration);
const sub2 = {
  uuid: 'bearz',
  title: 'bear subscription',
  enterpriseSlug: testSlug,
  startDate: '02-01-2021',
  expirationDate: futureExpirationDate.toLocaleString(),
  licenses: {
    allocated: 15,
    total: 40,
  },
  enterpriseCatalogUuid: 'blarghl',
  daysUntilExpiration: numDaysUntilExpiration,
};

const mockSubscriptionCount = Promise.resolve({
  data: [
    { status: 'unassigned', count: 0 },
    { status: 'assigned', count: 0 },
    { status: 'activated', count: 2 }],
});
const subscriptions = Promise.resolve({
  data: {
    results: [sub1, sub2],
    errors: null,
    setErrors: jest.fn(),
    forceRefresh: jest.fn(),
    loading: false,
    count: 2,
  },
});
const singleSubscription = Promise.resolve({
  data: {
    results: [sub1],
    errors: null,
    setErrors: jest.fn(),
    forceRefresh: jest.fn(),
    loading: false,
    count: 1,
  },
});
const mockSingleSubscriptionCount = Promise.resolve({
  data: [
    { status: 'unassigned', count: 0 },
    { status: 'assigned', count: 0 },
    { status: 'activated', count: 1 }],
});

const fakeStore = {
  portalConfiguration: {
    enterpriseId: 'foo',
    enableCodeManagementScreen: false,
    enableSubscriptionManagementScreen: true,
  },
};
const mockStore = configureMockStore([thunk]);
const BulkEnrollmentWrapper = () => (
  <Provider store={mockStore(fakeStore)}>
    <BulkEnrollmentPage />
  </Provider>
);

LicenseManagerApiService.fetchSubscriptions.mockImplementation(() => subscriptions);
LicenseManagerApiService.fetchSubscriptionUsersOverview.mockImplementation(() => mockSubscriptionCount);

describe('<BulkEnrollmentPage />', () => {
  describe('multiple subscriptions', () => {
    it('renders the bulk enrollment component', async () => {
      renderWithRouter(<BulkEnrollmentWrapper />);
      screen.getByText('Subscription Enrollment');
      await act(() => subscriptions);
    });
    it('renders the subscription picker', async () => {
      renderWithRouter(<BulkEnrollmentWrapper />, { route: `/${testSlug}/admin/${ROUTE_NAMES.bulkEnrollment}` });
      expect(await screen.findByText('Cohorts')).toBeInTheDocument();
      expect(await screen.findByText(sub1.title)).toBeInTheDocument();
      expect(await screen.findByText(sub2.title)).toBeInTheDocument();
    });
    it('renders the course search page', async () => {
      renderWithRouter(<BulkEnrollmentWrapper />, { route: `/${testSlug}/admin/${ROUTE_NAMES.bulkEnrollment}/${sub1.uuid}` });
      await act(() => subscriptions);
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(ADD_COURSES_TITLE);
    });
    it('renders course search page when navigating via subscription picker', async () => {
      renderWithRouter(<BulkEnrollmentWrapper />, { route: `/${testSlug}/admin/${ROUTE_NAMES.bulkEnrollment}` });
      await act(() => subscriptions);
      const sub1Button = screen.getAllByRole('link', { name: 'Enroll learners' })[0];
      userEvent.click(sub1Button);
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(ADD_COURSES_TITLE);
    });
  });
  describe('single subscription', () => {
    it('with one subscription, directly renders the course search page', async () => {
      LicenseManagerApiService.fetchSubscriptions.mockImplementation(() => singleSubscription);
      LicenseManagerApiService.fetchSubscriptionUsersOverview.mockImplementation(() => mockSingleSubscriptionCount);
      renderWithRouter(<BulkEnrollmentWrapper />, { route: `/${testSlug}/admin/${ROUTE_NAMES.bulkEnrollment}` });
      await act(() => subscriptions);
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(ADD_COURSES_TITLE);
    });
  });
});
