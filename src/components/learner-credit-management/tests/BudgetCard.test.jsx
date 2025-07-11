import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import dayjs from 'dayjs';
import {
  screen,
  render,
  within,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import { QueryClientProvider } from '@tanstack/react-query';
import BudgetCard from '../BudgetCard';
import { formatPrice, useSubsidySummaryAnalyticsApi, useBudgetRedemptions } from '../data';
import { BUDGET_STATUSES, BUDGET_TYPES } from '../../EnterpriseApp/data/constants';
import { EnterpriseSubsidiesContext } from '../../EnterpriseSubsidiesContext';
import { queryClient } from '../../test/testUtils';

jest.mock('../../EnterpriseSubsidiesContext/data/hooks', () => ({
  ...jest.requireActual('../../EnterpriseSubsidiesContext/data/hooks'),
  useEnterpriseBudgets: jest.fn().mockReturnValue({
    isFetchingBudgets: false,
  }),
}));
jest.mock('../data', () => ({
  ...jest.requireActual('../data'),
  useSubsidySummaryAnalyticsApi: jest.fn(),
  useBudgetRedemptions: jest.fn(),
}));
useSubsidySummaryAnalyticsApi.mockReturnValue({
  isLoading: false,
  offerSummary: null,
});
useBudgetRedemptions.mockReturnValue({
  isLoading: false,
  offerRedemptions: {
    itemCount: 0,
    pageCount: 0,
    results: [],
  },
  fetchBudgetRedemptions: jest.fn(),
});

const mockStore = configureMockStore([thunk]);
const getMockStore = store => mockStore(store);
const enterpriseSlug = 'test-enterprise';
const enterpriseUUID = '1234';
const initialStore = {
  portalConfiguration: {
    enterpriseId: enterpriseUUID,
    enterpriseSlug,
    enterpriseFeatures: {
      topDownAssignmentRealTimeLcm: true,
    },
    enablePortalLearnerCreditManagementScreen: true,
  },
};
const store = getMockStore({ ...initialStore });

const mockEnterpriseOfferId = 123;
const mockBudgetUuid = 'test-budget-uuid';

const mockBudgetDisplayName = 'Test Enterprise Budget Display Name';

const defaultEnterpriseSubsidiesContextValue = {
  isFetchingBudgets: false,
};
const BudgetCardWrapper = ({
  enterpriseSubsidiesContextValue = defaultEnterpriseSubsidiesContextValue,
  ...rest
}) => (
  <QueryClientProvider client={queryClient()}>
    <MemoryRouter initialEntries={['/test-enterprise/admin/learner-credit']}>
      <Provider store={store}>
        <IntlProvider locale="en">
          <EnterpriseSubsidiesContext.Provider value={enterpriseSubsidiesContextValue}>
            <BudgetCard {...rest} />
          </EnterpriseSubsidiesContext.Provider>
        </IntlProvider>
      </Provider>
    </MemoryRouter>
  </QueryClientProvider>
);

describe('<BudgetCard />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays correctly for a scheduled Enterprise Offers (ecommerce)', () => {
    const mockBudgetAggregates = {
      total: 5000,
      spent: 200,
      available: 4800,
    };
    const mockBudget = {
      id: mockEnterpriseOfferId,
      name: mockBudgetDisplayName,
      start: '3022-01-01',
      end: '3023-01-01',
      source: BUDGET_TYPES.ecommerce,
      aggregates: mockBudgetAggregates,
    };

    useSubsidySummaryAnalyticsApi.mockReturnValue({
      isLoading: false,
      subsidySummary: {
        totalFunds: mockBudgetAggregates.total,
        redeemedFunds: mockBudgetAggregates.spent,
        remainingFunds: mockBudgetAggregates.available,
        percentUtilized: mockBudgetAggregates.spent / mockBudgetAggregates.total,
        offerType: 'Site',
        offerId: mockEnterpriseOfferId,
        budgetsSummary: [],
      },
    });

    render(<BudgetCardWrapper
      original={mockBudget}
    />);

    expect(screen.getByText(mockBudgetDisplayName)).toBeInTheDocument();
    expect(screen.queryByText('Executive Education')).not.toBeInTheDocument();
    const formattedString = `Starts ${dayjs(mockBudget.start).format('MMMM D, YYYY')}`;
    const elementsWithTestId = screen.getAllByTestId('budget-date');
    const firstElementWithTestId = elementsWithTestId[0];
    expect(firstElementWithTestId).toHaveTextContent(formattedString);
  });

  it('displays correctly for a scheduled Subsidy (enterprise-subsidy)', () => {
    const mockBudgetAggregates = {
      total: 5000,
      spent: 200,
      available: 4800,
    };
    const mockBudget = {
      id: mockEnterpriseOfferId,
      name: mockBudgetDisplayName,
      start: '3022-01-01',
      end: '4023-01-01',
      source: BUDGET_TYPES.subsidy,
      aggregates: mockBudgetAggregates,
    };
    useSubsidySummaryAnalyticsApi.mockReturnValue({
      isLoading: false,
      subsidySummary: {
        totalFunds: mockBudgetAggregates.total,
        redeemedFunds: mockBudgetAggregates.spent,
        remainingFunds: mockBudgetAggregates.available,
        percentUtilized: mockBudgetAggregates.spent / mockBudgetAggregates.total,
        offerType: 'Site',
        offerId: mockEnterpriseOfferId,
        budgetsSummary: [
          {
            id: 'test-subsidy-uuid',
            start: '3022-01-01',
            end: '4023-01-01',
            remainingFunds: mockBudgetAggregates.available,
            redeemedFunds: mockBudgetAggregates.spent,
            enterpriseSlug,
            subsidyAccessPolicyDisplayName: mockBudgetDisplayName,
            subsidyAccessPolicyUuid: mockBudgetUuid,
          },
        ],
      },
    });

    render(<BudgetCardWrapper
      original={mockBudget}
    />);

    expect(screen.getByText(mockBudgetDisplayName)).toBeInTheDocument();
    expect(screen.queryByText('Executive Education')).not.toBeInTheDocument();
    const formattedString = `Starts ${dayjs(mockBudget.start).format('MMMM D, YYYY')}`;
    const elementsWithTestId = screen.getAllByTestId('budget-date');
    const firstElementWithTestId = elementsWithTestId[0];
    expect(firstElementWithTestId).toHaveTextContent(formattedString);
  });

  it.each([
    { isAssignableBudget: false },
    { isAssignableBudget: true },
  ])('displays correctly for a scheduled Policy (enterprise-access) (%s)', ({ isAssignableBudget }) => {
    const mockBudgetAggregates = {
      total: 5000,
      spent: 200,
      pending: 100,
      available: isAssignableBudget ? 4700 : 4800,
    };
    const mockBudget = {
      id: mockBudgetUuid,
      name: mockBudgetDisplayName,
      start: '3022-01-01',
      end: '4023-01-01',
      source: BUDGET_TYPES.policy,
      aggregates: {
        available: mockBudgetAggregates.available,
        pending: isAssignableBudget ? mockBudgetAggregates.pending : undefined,
        spent: mockBudgetAggregates.spent,
      },
      isAssignable: isAssignableBudget,
      enterpriseSlug,
      enterpriseUUID,
    };
    useSubsidySummaryAnalyticsApi.mockReturnValue({
      isLoading: false,
      subsidySummary: undefined,
    });

    render(<BudgetCardWrapper
      original={mockBudget}
    />);

    expect(screen.getByText(mockBudgetDisplayName)).toBeInTheDocument();
    expect(screen.queryByText('Executive Education')).not.toBeInTheDocument();
    const formattedString = `Starts ${dayjs(mockBudget.start).format('MMMM D, YYYY')}`;
    const elementsWithTestId = screen.getAllByTestId('budget-date');
    const firstElementWithTestId = elementsWithTestId[0];
    expect(firstElementWithTestId).toHaveTextContent(formattedString);
  });

  it('displays correctly for an expired Enterprise Offers (ecommerce)', () => {
    const mockBudgetAggregates = {
      total: 5000,
      spent: 200,
      available: 4800,
    };
    const mockBudget = {
      id: mockEnterpriseOfferId,
      name: mockBudgetDisplayName,
      start: '2022-01-01',
      end: '2023-01-01',
      source: BUDGET_TYPES.ecommerce,
      aggregates: mockBudgetAggregates,
      enterpriseSlug,
      enterpriseUUID,
    };
    useSubsidySummaryAnalyticsApi.mockReturnValue({
      isLoading: false,
      subsidySummary: {
        totalFunds: mockBudgetAggregates.total,
        redeemedFunds: mockBudgetAggregates.spent,
        remainingFunds: mockBudgetAggregates.available,
        percentUtilized: mockBudgetAggregates.spent / mockBudgetAggregates.total,
        offerType: 'Site',
        offerId: mockEnterpriseOfferId,
        budgetsSummary: [],
      },
    });

    render(<BudgetCardWrapper
      original={mockBudget}
    />);

    expect(screen.getByText(mockBudgetDisplayName)).toBeInTheDocument();
    expect(screen.queryByText('Executive Education')).not.toBeInTheDocument();
    const formattedString = `Expired ${dayjs(mockBudget.end).format('MMMM D, YYYY')}`;
    const elementsWithTestId = screen.getAllByTestId('budget-date');
    const firstElementWithTestId = elementsWithTestId[0];
    expect(firstElementWithTestId).toHaveTextContent(formattedString);

    // View budget CTA
    const viewBudgetCTA = screen.getByText('View budget history', { selector: 'a' });
    expect(viewBudgetCTA).toBeInTheDocument();
    expect(viewBudgetCTA).toHaveAttribute('href', `/${enterpriseSlug}/admin/learner-credit/${mockEnterpriseOfferId}`);
  });

  it('displays correctly for an expired Subsidy (enterprise-subsidy)', () => {
    const mockBudgetAggregates = {
      total: 5000,
      spent: 200,
      available: 4800,
    };
    const mockBudget = {
      id: mockEnterpriseOfferId,
      name: mockBudgetDisplayName,
      start: '2022-01-01',
      end: '2023-01-01',
      source: BUDGET_TYPES.subsidy,
      aggregates: mockBudgetAggregates,
      enterpriseSlug,
      enterpriseUUID,
    };
    useSubsidySummaryAnalyticsApi.mockReturnValue({
      isLoading: false,
      subsidySummary: {
        totalFunds: mockBudgetAggregates.total,
        redeemedFunds: mockBudgetAggregates.spent,
        remainingFunds: mockBudgetAggregates.available,
        percentUtilized: mockBudgetAggregates.spent / mockBudgetAggregates.total,
        offerType: 'Site',
        offerId: mockEnterpriseOfferId,
        budgetsSummary: [
          {
            id: 'test-subsidy-uuid',
            start: '2022-01-01',
            end: '2022-01-01',
            remainingFunds: mockBudgetAggregates.available,
            redeemedFunds: mockBudgetAggregates.spent,
            enterpriseSlug,
            subsidyAccessPolicyDisplayName: mockBudgetDisplayName,
            subsidyAccessPolicyUuid: mockBudgetUuid,
          },
        ],
      },
    });

    render(<BudgetCardWrapper
      original={mockBudget}
    />);

    expect(screen.getByText(mockBudgetDisplayName)).toBeInTheDocument();
    expect(screen.queryByText('Executive Education')).not.toBeInTheDocument();
    const formattedString = `Expired ${dayjs(mockBudget.end).format('MMMM D, YYYY')}`;
    const elementsWithTestId = screen.getAllByTestId('budget-date');
    const firstElementWithTestId = elementsWithTestId[0];
    expect(firstElementWithTestId).toHaveTextContent(formattedString);

    // View budget CTA
    const viewBudgetCTA = screen.getByText('View budget history', { selector: 'a' });
    expect(viewBudgetCTA).toBeInTheDocument();
    expect(viewBudgetCTA).toHaveAttribute('href', `/${enterpriseSlug}/admin/learner-credit/${mockBudgetUuid}`);
  });

  it.each([
    { isAssignableBudget: false },
    { isAssignableBudget: true },
  ])('displays correctly for an expired Policy (enterprise-access) (%s)', ({ isAssignableBudget }) => {
    const mockBudgetAggregates = {
      total: 5000,
      spent: 200,
      pending: 100,
      available: isAssignableBudget ? 4700 : 4800,
    };
    const mockBudget = {
      id: mockBudgetUuid,
      name: mockBudgetDisplayName,
      start: '2022-01-01',
      end: '2023-01-01',
      source: BUDGET_TYPES.policy,
      aggregates: {
        available: mockBudgetAggregates.available,
        pending: isAssignableBudget ? mockBudgetAggregates.pending : undefined,
        spent: mockBudgetAggregates.spent,
      },
      isAssignable: isAssignableBudget,
      enterpriseSlug,
      enterpriseUUID,
    };
    useSubsidySummaryAnalyticsApi.mockReturnValue({
      isLoading: false,
      subsidySummary: undefined,
    });

    render(<BudgetCardWrapper
      original={mockBudget}
    />);

    expect(screen.getByText(mockBudgetDisplayName)).toBeInTheDocument();
    expect(screen.queryByText('Executive Education')).not.toBeInTheDocument();
    const formattedString = `Expired ${dayjs(mockBudget.end).format('MMMM D, YYYY')}`;
    const elementsWithTestId = screen.getAllByTestId('budget-date');
    const firstElementWithTestId = elementsWithTestId[0];
    expect(firstElementWithTestId).toHaveTextContent(formattedString);

    // View budget CTA
    const viewBudgetCTA = screen.getByText('View budget history', { selector: 'a' });
    expect(viewBudgetCTA).toBeInTheDocument();
    expect(viewBudgetCTA).toHaveAttribute('href', `/${enterpriseSlug}/admin/learner-credit/${mockBudgetUuid}`);
  });

  it('displays correctly for a current Enterprise Offers (ecommerce)', () => {
    const mockBudgetAggregates = {
      total: 5000,
      spent: 200,
      available: 4800,
    };
    const mockBudget = {
      id: mockEnterpriseOfferId,
      name: mockBudgetDisplayName,
      start: '2022-01-01',
      end: '3022-01-01',
      source: BUDGET_TYPES.ecommerce,
      aggregates: mockBudgetAggregates,
      enterpriseSlug,
      enterpriseUUID,
    };
    useSubsidySummaryAnalyticsApi.mockReturnValue({
      isLoading: false,
      subsidySummary: {
        totalFunds: mockBudgetAggregates.total,
        redeemedFunds: mockBudgetAggregates.spent,
        remainingFunds: mockBudgetAggregates.available,
        percentUtilized: mockBudgetAggregates.spent / mockBudgetAggregates.total,
        offerType: 'Site',
        offerId: mockEnterpriseOfferId,
        budgetsSummary: [],
      },
    });

    render(<BudgetCardWrapper
      original={mockBudget}
    />);

    expect(screen.getByText(mockBudgetDisplayName)).toBeInTheDocument();
    expect(screen.queryByText('Executive Education')).not.toBeInTheDocument();
    const formattedString = `Expires ${dayjs(mockBudget.end).format('MMMM D, YYYY')}`;
    const elementsWithTestId = screen.getAllByTestId('budget-date');
    const firstElementWithTestId = elementsWithTestId[0];
    expect(firstElementWithTestId).toHaveTextContent(formattedString);

    // View budget CTA
    const viewBudgetCTA = screen.getByText('View budget', { selector: 'a' });
    expect(viewBudgetCTA).toBeInTheDocument();
    expect(viewBudgetCTA).toHaveAttribute('href', `/${enterpriseSlug}/admin/learner-credit/${mockEnterpriseOfferId}`);

    // Aggregates
    expect(screen.getByText('Balance')).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText(formatPrice(mockBudgetAggregates.available))).toBeInTheDocument();
    expect(screen.getByText('Spent')).toBeInTheDocument();
    expect(screen.getByText(formatPrice(mockBudgetAggregates.spent))).toBeInTheDocument();
  });

  it('displays correctly for a current Subsidy (enterprise-subsidy)', () => {
    const mockBudgetAggregates = {
      total: 5000,
      spent: 200,
      available: 4800,
    };
    const mockBudget = {
      id: mockEnterpriseOfferId,
      name: mockBudgetDisplayName,
      start: '2022-01-01',
      end: '3023-01-01',
      source: BUDGET_TYPES.subsidy,
      aggregates: mockBudgetAggregates,
      enterpriseSlug,
      enterpriseUUID,
    };
    useSubsidySummaryAnalyticsApi.mockReturnValue({
      isLoading: false,
      subsidySummary: {
        totalFunds: mockBudgetAggregates.total,
        redeemedFunds: mockBudgetAggregates.spent,
        remainingFunds: mockBudgetAggregates.available,
        percentUtilized: mockBudgetAggregates.spent / mockBudgetAggregates.total,
        offerType: 'Site',
        offerId: mockEnterpriseOfferId,
        budgetsSummary: [
          {
            id: 'test-subsidy-uuid',
            start: '2022-01-01',
            end: '3023-01-01',
            remainingFunds: mockBudgetAggregates.available,
            redeemedFunds: mockBudgetAggregates.spent,
            enterpriseSlug,
            subsidyAccessPolicyDisplayName: mockBudgetDisplayName,
            subsidyAccessPolicyUuid: mockBudgetUuid,
          },
        ],
      },
    });

    render(<BudgetCardWrapper
      original={mockBudget}
    />);

    expect(screen.getByText(mockBudgetDisplayName)).toBeInTheDocument();
    expect(screen.queryByText('Executive Education')).not.toBeInTheDocument();
    const formattedString = `Expires ${dayjs(mockBudget.end).format('MMMM D, YYYY')}`;
    const elementsWithTestId = screen.getAllByTestId('budget-date');
    const firstElementWithTestId = elementsWithTestId[0];
    expect(firstElementWithTestId).toHaveTextContent(formattedString);

    // View budget CTA
    const viewBudgetCTA = screen.getByText('View budget', { selector: 'a' });
    expect(viewBudgetCTA).toBeInTheDocument();
    expect(viewBudgetCTA).toHaveAttribute('href', `/${enterpriseSlug}/admin/learner-credit/${mockBudgetUuid}`);

    // Aggregates
    expect(screen.getByText('Balance')).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText(formatPrice(mockBudgetAggregates.available))).toBeInTheDocument();
    expect(screen.getByText('Spent')).toBeInTheDocument();
    expect(screen.getByText(formatPrice(mockBudgetAggregates.spent))).toBeInTheDocument();
  });

  it.each([
    { isAssignableBudget: false },
    { isAssignableBudget: true },
  ])('displays correctly for a current Policy (enterprise-access) (%s)', ({ isAssignableBudget }) => {
    const mockBudgetAggregates = {
      total: 5000,
      spent: 200,
      pending: 100,
      available: isAssignableBudget ? 4700 : 4800,
    };
    const mockBudget = {
      id: mockBudgetUuid,
      name: mockBudgetDisplayName,
      start: '2022-01-01',
      end: '3023-01-01',
      source: BUDGET_TYPES.policy,
      aggregates: {
        available: mockBudgetAggregates.available,
        pending: isAssignableBudget ? mockBudgetAggregates.pending : undefined,
        spent: mockBudgetAggregates.spent,
      },
      isAssignable: isAssignableBudget,
      enterpriseSlug,
      enterpriseUUID,
    };
    useSubsidySummaryAnalyticsApi.mockReturnValue({
      isLoading: false,
      subsidySummary: undefined,
    });

    render(<BudgetCardWrapper
      original={mockBudget}
    />);

    expect(screen.getByText(mockBudgetDisplayName)).toBeInTheDocument();
    expect(screen.queryByText('Executive Education')).not.toBeInTheDocument();
    const formattedString = `Expires ${dayjs(mockBudget.end).format('MMMM D, YYYY')}`;
    const elementsWithTestId = screen.getAllByTestId('budget-date');
    const firstElementWithTestId = elementsWithTestId[0];
    expect(firstElementWithTestId).toHaveTextContent(formattedString);

    // View budget CTA
    const viewBudgetCTA = screen.getByText('View budget', { selector: 'a' });
    expect(viewBudgetCTA).toBeInTheDocument();
    expect(viewBudgetCTA).toHaveAttribute('href', `/${enterpriseSlug}/admin/learner-credit/${mockBudgetUuid}`);

    // Aggregates
    expect(screen.getByText('Balance')).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText(formatPrice(mockBudgetAggregates.available))).toBeInTheDocument();
    if (isAssignableBudget) {
      expect(screen.getByText('Assigned')).toBeInTheDocument();
      expect(screen.getByText(formatPrice(mockBudgetAggregates.pending))).toBeInTheDocument();
    } else {
      expect(screen.queryByText('Assigned')).not.toBeInTheDocument();
    }
    expect(screen.getByText('Spent')).toBeInTheDocument();
    expect(screen.getByText(formatPrice(mockBudgetAggregates.spent))).toBeInTheDocument();
  });

  it.each([
    { isBnREnabled: true },
    { isBnREnabled: false },
  ])('displays correctly for a current BnR enabled Policy (enterprise-access) (%s)', ({ isBnREnabled }) => {
    const mockBudgetAggregates = {
      total: 5000,
      spent: 200,
      pending: 100,
      available: isBnREnabled ? 4700 : 4800,
    };
    const mockBudget = {
      id: mockBudgetUuid,
      name: mockBudgetDisplayName,
      start: '2022-01-01',
      end: '3023-01-01',
      source: BUDGET_TYPES.policy,
      aggregates: {
        available: mockBudgetAggregates.available,
        pending: isBnREnabled ? mockBudgetAggregates.pending : undefined,
        spent: mockBudgetAggregates.spent,
      },
      isBnREnabled,
      enterpriseSlug,
      enterpriseUUID,
    };
    useSubsidySummaryAnalyticsApi.mockReturnValue({
      isLoading: false,
      subsidySummary: undefined,
    });

    render(<BudgetCardWrapper
      original={mockBudget}
    />);

    expect(screen.getByText(mockBudgetDisplayName)).toBeInTheDocument();
    expect(screen.queryByText('Executive Education')).not.toBeInTheDocument();
    const formattedString = `Expires ${dayjs(mockBudget.end).format('MMMM D, YYYY')}`;
    const elementsWithTestId = screen.getAllByTestId('budget-date');
    const firstElementWithTestId = elementsWithTestId[0];
    expect(firstElementWithTestId).toHaveTextContent(formattedString);

    // View budget CTA
    const viewBudgetCTA = screen.getByText('View budget', { selector: 'a' });
    expect(viewBudgetCTA).toBeInTheDocument();
    expect(viewBudgetCTA).toHaveAttribute('href', `/${enterpriseSlug}/admin/learner-credit/${mockBudgetUuid}`);

    // Aggregates
    expect(screen.getByText('Balance')).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText(formatPrice(mockBudgetAggregates.available))).toBeInTheDocument();
    if (isBnREnabled) {
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText(formatPrice(mockBudgetAggregates.pending))).toBeInTheDocument();
    } else {
      expect(screen.queryByText('Pending')).not.toBeInTheDocument();
    }
    expect(screen.getByText('Spent')).toBeInTheDocument();
    expect(screen.getByText(formatPrice(mockBudgetAggregates.spent))).toBeInTheDocument();
  });

  it('displays correctly for a retired Policy (enterprise-access) (%s)', () => {
    const mockBudgetAggregates = {
      total: 5000,
      spent: 200,
      pending: undefined,
      available: 4800,
    };
    const mockBudget = {
      id: mockBudgetUuid,
      name: mockBudgetDisplayName,
      start: '2022-01-01',
      end: '3023-01-01',
      source: BUDGET_TYPES.policy,
      aggregates: {
        available: mockBudgetAggregates.available,
        pending: mockBudgetAggregates.pending,
        spent: mockBudgetAggregates.spent,
      },
      isAssignable: false,
      enterpriseSlug,
      enterpriseUUID,
      isRetired: true,
      retiredAt: '2022-01-01',
    };

    useSubsidySummaryAnalyticsApi.mockReturnValue({
      isLoading: false,
      subsidySummary: undefined,
    });

    render(<BudgetCardWrapper original={mockBudget} />);

    // Assertions for budget card display
    expect(screen.getByText(mockBudgetDisplayName)).toBeInTheDocument();
    expect(screen.queryByText('Executive Education')).not.toBeInTheDocument();

    const formattedString = `Retired ${dayjs(mockBudget.retiredAt).format('MMMM D, YYYY')}`;
    const elementsWithTestId = screen.getAllByTestId('budget-date');
    const firstElementWithTestId = elementsWithTestId[0];
    expect(firstElementWithTestId).toHaveTextContent(formattedString);

    // Verify 'View budget' CTA
    const viewBudgetCTA = screen.getByText('View budget history', { selector: 'a' });
    expect(viewBudgetCTA).toBeInTheDocument(); // Ensure 'View budget' CTA is present
    expect(viewBudgetCTA).toHaveAttribute(
      'href',
      `/${enterpriseSlug}/admin/learner-credit/${mockBudgetUuid}`,
    );

    const balanceDetailSection = screen.getByTestId('balance-detail-section');

    // Assertions for aggregates display
    expect(within(balanceDetailSection).queryByText('Balance')).not.toBeInTheDocument();
    expect(within(balanceDetailSection).queryByText('Available')).not.toBeInTheDocument();
    expect(within(balanceDetailSection).getByText('Spent')).toBeInTheDocument();
    expect(within(balanceDetailSection).getByText(formatPrice(mockBudgetAggregates.spent))).toBeInTheDocument();
  });

  it.each([
    {
      status: BUDGET_STATUSES.active,
      shouldShow: true,
      start: '2022-01-01',
      end: '3023-01-01',
      retiredAt: null,
    },
    {
      status: BUDGET_STATUSES.retired,
      shouldShow: true,
      start: '2022-01-01',
      end: '3023-01-01',
      retiredAt: '2022-05-01',
    },
    {
      status: BUDGET_STATUSES.expiring,
      shouldShow: true,
      start: '2022-01-01',
      end: dayjs().add(30, 'day').toString(),
      retiredAt: null,
    },
    {
      status: BUDGET_STATUSES.scheduled,
      shouldShow: false,
      start: '3022-01-01',
      end: '3023-01-01',
      retiredAt: null,
    },
    {
      status: BUDGET_STATUSES.expired,
      shouldShow: true,
      start: '2022-01-01',
      end: '2023-01-01',
      retiredAt: null,
    },
  ])('only render aggregates section for appropriate statuses (%s)', (
    {
      shouldShow,
      start,
      end,
      retiredAt,
    },
  ) => {
    const mockBudgetAggregates = {
      total: 5000,
      spent: 200,
      pending: undefined,
      available: 4800,
    };
    const mockBudget = {
      id: mockBudgetUuid,
      name: mockBudgetDisplayName,
      start,
      end,
      source: BUDGET_TYPES.policy,
      aggregates: {
        available: mockBudgetAggregates.available,
        pending: mockBudgetAggregates.pending,
        spent: mockBudgetAggregates.spent,
      },
      isAssignable: false,
      enterpriseSlug,
      enterpriseUUID,
      isRetired: !!retiredAt,
      retiredAt,
    };

    useSubsidySummaryAnalyticsApi.mockReturnValue({
      isLoading: false,
      subsidySummary: undefined,
    });

    render(<BudgetCardWrapper original={mockBudget} />);

    const aggregatesSection = screen.queryByTestId('aggregates-section');

    if (shouldShow) {
      expect(aggregatesSection).toBeInTheDocument();
    } else {
      expect(aggregatesSection).not.toBeInTheDocument();
    }
  });
});
