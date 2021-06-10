import { screen, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithRouter } from '../../test/testUtils';
import { ROUTE_NAMES } from '../../EnterpriseApp/constants';
import LicenseManagerApiService from '../../../data/services/LicenseManagerAPIService';

import BulkEnrollContextProvider from '../BulkEnrollmentContext';
import { ADD_LEARNERS_TITLE } from './constants';
import AddLearnersStep, { LEARNERS_PAGE_SIZE, LINK_TEXT, TABLE_HEADERS } from './AddLearnersStep';

jest.mock('../../../data/services/LicenseManagerAPIService', () => ({
  __esModule: true,
  default: {
    fetchSubscriptionUsers: jest.fn(),
  },
}));

const mockResults = [
  { uuid: 'foo', userEmail: 'y@z.com' },
  { uuid: 'bar', userEmail: 'a@z.com' },
  { uuid: 'afam', userEmail: 'afam@family.com' },
  { uuid: 'bears', userEmail: 'bears@jungle.org' },
];

const mockTableData = Promise.resolve({
  data: {
    results: mockResults,
    count: 4,
    numPages: 6,
  },
});
LicenseManagerApiService.fetchSubscriptionUsers.mockReturnValue(mockTableData);

const defaultProps = {
  subscriptionUUID: 'fakest-uuid',
  enterpriseSlug: 'sluggiest',
};

const StepperWrapper = (props) => (
  <BulkEnrollContextProvider>
    <AddLearnersStep {...props} />
  </BulkEnrollContextProvider>
);

const flushPromises = () => new Promise(setImmediate);

describe('AddLearnersStep', () => {
  it('displays a title', async () => {
    act(() => { renderWithRouter(<StepperWrapper {...defaultProps} />); });
    expect(screen.getByText(ADD_LEARNERS_TITLE)).toBeInTheDocument();
    await act(() => mockTableData);
  });
  it('displays a table', async () => {
    act(() => {
      renderWithRouter(<StepperWrapper {...defaultProps} />);
      flushPromises();
    });
    const columnHeader = await screen.findByText(TABLE_HEADERS.email);
    expect(columnHeader).toBeInTheDocument();
    expect(await screen.findByText(mockResults[0].userEmail)).toBeInTheDocument();
    expect(await screen.findByText(mockResults[1].userEmail)).toBeInTheDocument();
    await act(() => mockTableData);
  });
  it('allows search by email', async () => {
    act(() => {
      renderWithRouter(<StepperWrapper {...defaultProps} />);
    });
    expect(await screen.findByText('Search Email')).toBeInTheDocument();
    await act(() => mockTableData);
    userEvent.type(screen.getByPlaceholderText('Search Email'), 'beAR');
    expect(await screen.findByText(/Filtered by userEmail/)).toBeInTheDocument();
    expect(await screen.findByText('Clear Filters')).toBeInTheDocument();
    const { subscriptionUUID } = defaultProps;
    // multiple calls will occur to this function, we only test for the last one
    // for correctness, and don't test backend filtering part here (tested in backend).
    expect(LicenseManagerApiService.fetchSubscriptionUsers).toHaveBeenLastCalledWith(
      subscriptionUUID,
      {
        active_only: 1, page_size: LEARNERS_PAGE_SIZE, page: 1, search: 'beAR',
      },
    );
  });
  it('displays a table skeleton when loading', () => {
    LicenseManagerApiService.fetchSubscriptionUsers.mockReturnValue(new Promise(() => {}));
    act(() => { renderWithRouter(<StepperWrapper {...defaultProps} />); });
    expect(screen.getByTestId('skelly')).toBeInTheDocument();
  });
  it('links leaners to subscription management', async () => {
    act(() => {
      const { history } = renderWithRouter(<StepperWrapper {...defaultProps} />);
      const link = screen.getByText(LINK_TEXT);
      userEvent.click(link);
      expect(history.location.pathname).toEqual(`/${defaultProps.enterpriseSlug}/admin/${ROUTE_NAMES.subscriptionManagement}/${defaultProps.subscriptionUUID}`);
    });
    await act(() => mockTableData);
  });
});
