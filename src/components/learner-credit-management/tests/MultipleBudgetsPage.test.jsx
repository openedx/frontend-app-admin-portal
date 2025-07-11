/* eslint-disable react/prop-types */
import React from 'react';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import {
  screen,
  render,
  waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';

import { IntlProvider } from '@edx/frontend-platform/i18n';

import { EnterpriseSubsidiesContext } from '../../EnterpriseSubsidiesContext';
import MultipleBudgetsPage from '../MultipleBudgetsPage';
import { queryClient } from '../../test/testUtils';
import { useEnterpriseBudgets } from '../../EnterpriseSubsidiesContext/data/hooks';

const mockStore = configureMockStore([thunk]);
const getMockStore = store => mockStore(store);
const enterpriseId = 'test-enterprise-uuid';
const enterpriseSlug = 'test-enterprise-slug';
const initialStore = {
  portalConfiguration: {
    enterpriseId,
    enterpriseSlug,
    enableLearnerPortal: true,
    enterpriseFeatures: {
      topDownAssignmentRealTimeLcm: true,
    },
    enablePortalLearnerCreditManagementScreen: true,
  },
};

// helper function to set expiring date 1 month from today
const getOneMonthFromToday = () => {
  const oneMonthFromToday = new Date();
  oneMonthFromToday.setMonth(oneMonthFromToday.getMonth() + 1);
  return oneMonthFromToday.toISOString().replace(/\.\d{3}Z$/, 'Z');
};

jest.mock('../../EnterpriseSubsidiesContext/data/hooks', () => ({
  ...jest.requireActual('../../EnterpriseSubsidiesContext/data/hooks'),
  useEnterpriseBudgets: jest.fn().mockReturnValue({
    data: {
      budgets: [
        {
          source: 'subsidy',
          id: '392f1fe1-ee91-4f44-b174-13ecf59866eb',
          name: 'Subsidy 2 Expired for Executive Education (2U) Integration QA',
          start: '2023-06-07T15:38:29Z',
          end: '2024-06-07T15:38:30Z',
          isCurrent: true,
          isRetired: false,
        },
        {
          source: 'subsidy',
          id: '392f1fe1-ee91-4f44-b174-13ecf59866e3',
          name: 'Subsidy Expired 3',
          start: '2023-06-07T15:38:29Z',
          end: '2024-06-07T15:38:30Z',
          isCurrent: true,
          isRetired: true,
        },
        {
          source: 'subsidy',
          id: '392f1fe1-ee91-4f44-b174-13ecf59866ef',
          name: 'Subsidy InActive 4',
          start: '2023-06-07T15:38:29Z',
          end: '2024-06-07T15:38:30Z',
          isCurrent: false,
          isRetired: false,
        },
        {
          source: 'subsidy',
          id: '392f1fe1-ee91-4f44-b174-13ecf59866ef',
          name: 'Subsidy 5 scheduled',
          start: '2099-06-07T15:38:29Z',
          end: '3099-06-07T15:38:30Z',
          isCurrent: true,
          isRetired: false,
        },
        {
          source: 'subsidy',
          id: '392f1fe1-ee91-4f44-b174-13ecf59866ef',
          name: 'Subsidy 6 active',
          start: '2020-06-07T15:38:29Z',
          end: '3099-06-07T15:38:30Z',
          isCurrent: true,
          isRetired: false,
        },
        {
          source: 'subsidy',
          id: '392f1fe1-ee91-4f44-b174-13ecf59866ef',
          name: 'Subsidy 6 expiring',
          start: '2020-06-07T15:38:29Z',
          end: getOneMonthFromToday(),
          isCurrent: true,
          isRetired: false,
        },
      ],
    },
  }),
}));

const store = getMockStore({ ...initialStore });
const enterpriseUUID = '1234';

const emptyOffersContextValue = {
  budgets: [], // Empty offers array
};

const defaultEnterpriseSubsidiesContextValue = {};
const MultipleBudgetsPageWrapper = ({
  enterpriseSubsidiesContextValue = defaultEnterpriseSubsidiesContextValue,
  ...rest
}) => (
  <QueryClientProvider client={queryClient()}>
    <Provider store={store}>
      <IntlProvider locale="en">
        <EnterpriseSubsidiesContext.Provider value={enterpriseSubsidiesContextValue}>
          <MultipleBudgetsPage {...rest} />
        </EnterpriseSubsidiesContext.Provider>
      </IntlProvider>
    </Provider>
  </QueryClientProvider>
);

describe('<MultipleBudgetsPage />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('No budgets for your organization', () => {
    useEnterpriseBudgets.mockReturnValueOnce(
      { data: { budgets: [] } },
    );
    render(<MultipleBudgetsPageWrapper
      enterpriseUUID={enterpriseUUID}
      enterpriseSlug={enterpriseId}
      enterpriseSubsidiesContextValue={emptyOffersContextValue}
    />);
    expect(screen.getByText('No budgets for your organization'));
    expect(screen.getByText('Contact support'));
  });
  it('budgets for your organization', async () => {
    const user = userEvent.setup();
    render(<MultipleBudgetsPageWrapper enterpriseUUID={enterpriseUUID} enterpriseSlug={enterpriseId} />);
    expect(screen.getByText('Budgets'));
    const filterButton = screen.getByText('Filters');
    await user.click(filterButton);
    const checkboxes = screen.queryAllByRole('checkbox');
    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);
    await user.click(checkboxes[2]);
    await user.click(checkboxes[3]);
    await user.click(checkboxes[4]);
    await waitFor(() => expect(screen.getByText('Showing 1 - 3 of 6.')).toBeInTheDocument());
  });
  it.skip('shows only active and scheduled budgets on initial render', async () => {
    const user = userEvent.setup();
    render(<MultipleBudgetsPageWrapper enterpriseUUID={enterpriseUUID} enterpriseSlug={enterpriseId} />);
    expect(await screen.findByText('Budgets')).toBeInTheDocument();
    const clearFilterButton = screen.getByText('Clear filters');
    // only scheduled, active, and expiring budgets are rendered first
    expect(await screen.findByText('Showing 1 - 3 of 6.')).toBeInTheDocument();

    await user.click(clearFilterButton);
    // budget page renders all 5 budgets once user clears filter
    await waitFor(() => expect(screen.getByText('Showing 6 of 6.')).toBeInTheDocument());
  });
  it('Shows loading spinner', () => {
    const enterpriseSubsidiesContextValue = {
      ...defaultEnterpriseSubsidiesContextValue,
      isLoading: true,
    };
    render(<MultipleBudgetsPageWrapper
      enterpriseUUID={enterpriseUUID}
      enterpriseSlug={enterpriseSlug}
      enterpriseSubsidiesContextValue={enterpriseSubsidiesContextValue}
    />);
    expect(screen.getByText('Loading budgets...')).toBeInTheDocument();
  });
});
