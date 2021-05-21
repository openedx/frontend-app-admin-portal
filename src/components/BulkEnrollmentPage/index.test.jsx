import React from 'react';
import { act, screen } from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import { MemoryRouter } from 'react-router-dom';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { renderWithRouter } from '../test/testUtils';
import BulkEnrollmentPage from './index';
import '../../../__mocks__/react-instantsearch-dom';
import LicenseManagerApiService from '../../data/services/LicenseManagerAPIService';
import { ROUTE_NAMES } from '../EnterpriseApp/constants';
import { ADD_COURSES_TITLE } from './stepper/constants';

jest.mock('../../data/services/LicenseManagerAPIService', () => ({
  __esModule: true,
  default: {
    fetchSubscriptions: jest.fn(),
  },
}));

const sub1 = {
  uuid: 'foo',
  title: 'horse subscription',
  enterpriseSlug: 'horsesRus',
  startDate: 1621347682,
  expirationDate: 1721547682,
  licenses: {
    allocated: 5,
    total: 20,
  },
};

const sub2 = {
  uuid: 'bearz',
  title: 'bear subscription',
  enterpriseSlug: 'horsesRus',
  startDate: 1621347682,
  expirationDate: 1721547682,
  licenses: {
    allocated: 15,
    total: 40,
  },
};

const subscriptions = Promise.resolve({
  data: {
    results: {
      subscriptions: [sub1, sub2],
    },
    errors: null,
    setErrors: jest.fn(),
    forceRefresh: jest.fn(),
    loading: false,
  },
});

LicenseManagerApiService.fetchSubscriptions.mockReturnValue(subscriptions);

const fakeStore = {
  portalConfiguration: {
    enterpriseId: 'foo',
  },
};
const mockStore = configureMockStore([thunk]);
const BulkEnrollmentWrapper = () => (
  <MemoryRouter>
    <Provider store={mockStore(fakeStore)}>
      <BulkEnrollmentPage />
    </Provider>
  </MemoryRouter>
);

describe('<BulkEnrollmentPage />', () => {
  it('renders the bulk enrollment component', async () => {
    renderWithRouter(<BulkEnrollmentWrapper />);
    screen.getByText('Subscription Enrollment');
    await act(() => subscriptions);
  });
  it.skip('renders the subscription picker', async () => {
    renderWithRouter(<BulkEnrollmentWrapper />, { route: `/sluggo/admin/${ROUTE_NAMES.bulkEnrollment}` });
    expect(await screen.findByText('Cohorts')).toBeInTheDocument();
    expect(await screen.findByText(sub1.title)).toBeInTheDocument();
    expect(await screen.findByText(sub2.title)).toBeInTheDocument();

    await act(() => subscriptions);
  });
  it.skip('renders the course search page', async () => {
    renderWithRouter(<BulkEnrollmentWrapper />, { route: `/sluggo/admin/${ROUTE_NAMES.bulkEnrollment}/${sub1.uuid}` });
    expect(await screen.findByText('Cohorts')).toBeInTheDocument();
    expect(await screen.findByText(ADD_COURSES_TITLE)).toBeInTheDocument();

    await act(() => subscriptions);
  });
});
