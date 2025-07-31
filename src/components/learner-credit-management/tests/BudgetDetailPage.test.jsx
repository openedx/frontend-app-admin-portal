import React from 'react';
import algoliasearch from 'algoliasearch/lite';
import { useParams } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { renderWithRouter, sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { act } from 'react-dom/test-utils';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import { faker } from '@faker-js/faker';
import dayjs from 'dayjs';

import EnterpriseAccessApiService from '../../../data/services/EnterpriseAccessApiService';
import BudgetDetailPage from '../BudgetDetailPage';
import {
  DEFAULT_PAGE,
  formatDate,
  formatPrice,
  PAGE_SIZE,
  useBudgetContentAssignments,
  useBudgetDetailActivityOverview,
  useBudgetRedemptions,
  useEnterpriseCustomer,
  useEnterpriseFlexGroups,
  useEnterpriseGroup,
  useEnterpriseGroupLearners,
  useEnterpriseOffer,
  useEnterpriseRemovedGroupMembers,
  useIsLargeOrGreater,
  useSubsidyAccessPolicy,
  useSubsidySummaryAnalyticsApi,
  useBudgetId,
} from '../data';
import {
  BUDGET_DETAIL_ACTIVITY_TAB,
  BUDGET_DETAIL_CATALOG_TAB,
} from '../data/constants';
import { EnterpriseSubsidiesContext } from '../../EnterpriseSubsidiesContext';
import {
  mockAssignableSubsidyAccessPolicy,
  mockAssignableSubsidyAccessPolicyWithNoUtilization,
  mockAssignableSubsidyAccessPolicyWithSpendNoAllocations,
  mockAssignableSubsidyAccessPolicyWithSpendNoRedeemed,
  mockEnterpriseOfferId,
  mockEnterpriseOfferMetadata,
  mockPerLearnerSpendLimitSubsidyAccessPolicy,
  mockPerLearnerSpendLimitSubsidyAccessPolicyWithBnrEnabled,
  mockSpendLimitNoGroupsSubsidyAccessPolicy,
  mockSubsidyAccessPolicyUUID,
  mockSubsidySummary,
} from '../data/tests/constants';
import { getButtonElement, queryClient } from '../../test/testUtils';
import { useAlgoliaSearch } from '../../algolia-search';
import useBnrSubsidyRequests from '../data/hooks/useBnrSubsidyRequests';

jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedUser: jest.fn(),
}));

const mockNavigate = jest.fn();

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: jest.fn(),
}));

jest.mock('../../algolia-search/useAlgoliaSearch');

jest.mock('../../EnterpriseSubsidiesContext/data/hooks', () => ({
  ...jest.requireActual('../../EnterpriseSubsidiesContext/data/hooks'),
  useEnterpriseBudgets: jest.fn(),
}));

jest.mock('../data', () => ({
  ...jest.requireActual('../data'),
  useBudgetContentAssignments: jest.fn(),
  useBudgetDetailActivityOverview: jest.fn(),
  useBudgetRedemptions: jest.fn(),
  useCancelContentAssignments: jest.fn(),
  useEnterpriseCustomer: jest.fn(),
  useEnterpriseGroup: jest.fn(),
  useEnterpriseGroupLearners: jest.fn(),
  useEnterpriseGroupMembersTableData: jest.fn(),
  useEnterpriseRemovedGroupMembers: jest.fn(),
  useEnterpriseOffer: jest.fn(),
  useIsLargeOrGreater: jest.fn().mockReturnValue(true),
  useSubsidyAccessPolicy: jest.fn(),
  useSubsidySummaryAnalyticsApi: jest.fn(),
  useEnterpriseFlexGroups: jest.fn(),
  useBudgetId: jest.fn(),
}));

jest.mock('../../../data/services/EnterpriseAccessApiService');

jest.mock('../data/hooks/useBnrSubsidyRequests');

const mockStore = configureMockStore([thunk]);
const getMockStore = (store) => mockStore(store);
const enterpriseSlug = 'test-enterprise';
const enterpriseUUID = '1234';
const initialStoreState = {
  portalConfiguration: {
    enterpriseId: enterpriseUUID,
    enterpriseSlug,
    enableLearnerPortal: true,
    enterpriseFeatures: {
      topDownAssignmentRealTimeLcm: true,
    },
  },
};

const mockLearnerEmail = 'edx@example.com';
const mockSecondLearnerEmail = 'edx001@example.com';
const mockCourseKey = 'edX+DemoX';
const mockContentTitle = 'edx Demo';

const mockEmptyStateBudgetDetailActivityOverview = {
  contentAssignments: { count: 0 },
  spentTransactions: { count: 0 },
};
const mockBudgetDetailActivityOverviewWithSpend = {
  contentAssignments: { count: 0 },
  spentTransactions: { count: 1 },
};
const mockEmptyBudgetRedemptions = {
  itemCount: 0,
  pageCount: 0,
  results: [],
};
const mockSuccessfulNotifiedAction = {
  uuid: 'test-assignment-action-uuid',
  actionType: 'notified',
  completedAt: '2023-10-27',
  errorReason: null,
};
const mockSuccessfulLinkedLearnerAction = {
  uuid: 'test-assignment-action-uuid',
  actionType: 'notified',
  completedAt: '2023-10-27',
  errorReason: null,
};
const mockFailedNotifiedAction = {
  ...mockSuccessfulNotifiedAction,
  completedAt: null,
  errorReason: 'email_error',
};
const mockFailedLinkedLearnerAction = {
  ...mockFailedNotifiedAction,
  actionType: 'learner_linked',
  errorReason: 'internal_api_error',
};
const mockLearnerContentAssignment = {
  uuid: 'test-uuid',
  learnerEmail: mockLearnerEmail,
  contentKey: mockCourseKey,
  contentTitle: mockContentTitle,
  contentQuantity: -19900,
  learnerState: 'waiting',
  recentAction: { actionType: 'assigned', timestamp: '2023-10-27' },
  actions: [mockSuccessfulLinkedLearnerAction, mockSuccessfulNotifiedAction],
  errorReason: null,
  assignmentConfiguration: expect.any(Object),
  earliestPossibleExpiration: { date: dayjs().add(5, 'days').toISOString() },
};
const createMockLearnerContentAssignment = () => ({
  ...mockLearnerContentAssignment,
  uuid: uuidv4(),
  learnerEmail: faker.internet.email(),
});
const mockEnrollmentTransactionReversal = {
  uuid: 'test-transaction-reversal-uuid',
  created: '2023-10-31',
};
const mockEnrollmentTransaction = {
  uuid: 'test-transaction-uuid',
  enrollmentDate: '2023-10-28',
  courseKey: mockCourseKey,
  courseTitle: mockContentTitle,
  userEmail: mockLearnerEmail,
  fulfillmentIdentifier: 'test-fulfillment-identifier',
  courseListPrice: 100,
  reversal: null,
};
const mockEnrollmentTransactionWithReversal = {
  ...mockEnrollmentTransaction,
  uuid: 'test-transaction-with-reversal-uuid',
  userEmail: mockSecondLearnerEmail,
  reversal: mockEnrollmentTransactionReversal,
};

const mockFailedCancelledLearnerAction = {
  actionType: 'cancelled',
  completedAt: null,
  errorReason: 'email_error',
};

const mockFailedReminderLearnerAction = {
  actionType: 'reminded',
  completedAt: null,
  errorReason: 'email_error',
};

const mockFailedRedemptionLearnerAction = {
  actionType: 'redeemed',
  completedAt: null,
  errorReason: 'enrollment_error',
};

const mockApprovedRequest = {
  uuid: 'test-approved-request-uuid',
  email: mockLearnerEmail,
  courseTitle: mockContentTitle,
  courseId: mockCourseKey,
  amount: 199,
  requestDate: 'Oct 27, 2023',
  requestStatus: 'approved',
  lastActionStatus: 'waiting_for_learner',
  lastActionErrorReason: undefined,
  latestAction: { status: 'approved', timestamp: '2023-10-27' },
};

const createMockApprovedRequest = () => ({
  ...mockApprovedRequest,
  uuid: uuidv4(),
  email: faker.internet.email(),
});

const mockEmptyApprovedRequests = {
  itemCount: 0,
  pageCount: 0,
  results: [],
};

const defaultEnterpriseSubsidiesContextValue = {
  isLoading: false,
};

const BudgetDetailPageWrapper = ({
  initialState = initialStoreState,
  enterpriseSubsidiesContextValue = defaultEnterpriseSubsidiesContextValue,
  ...rest
}) => {
  const store = getMockStore({ ...initialState });
  return (
    <QueryClientProvider client={queryClient()}>
      <IntlProvider locale="en">
        <Provider store={store}>
          <EnterpriseSubsidiesContext.Provider value={enterpriseSubsidiesContextValue}>
            <BudgetDetailPage {...rest} />
          </EnterpriseSubsidiesContext.Provider>
        </Provider>
      </IntlProvider>
    </QueryClientProvider>
  );
};

describe('<BudgetDetailPage />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();

    getAuthenticatedUser.mockReturnValue({
      userId: 3,
    });

    // Mock useBudgetId to be dynamic based on useParams
    useBudgetId.mockImplementation(() => {
      const { budgetId } = useParams();
      const enterpriseOfferId = uuidValidate(budgetId) ? null : budgetId;
      const subsidyAccessPolicyId = uuidValidate(budgetId) ? budgetId : null;
      return {
        budgetId,
        enterpriseOfferId,
        subsidyAccessPolicyId,
      };
    });

    // Mock useEnterpriseBudgets to return an empty array to prevent the forEach error
    const { useEnterpriseBudgets } = jest.requireMock('../../EnterpriseSubsidiesContext/data/hooks');
    useEnterpriseBudgets.mockReturnValue({
      data: [],
    });

    useEnterpriseFlexGroups.mockReturnValue({
      data: [],
    });

    useSubsidySummaryAnalyticsApi.mockReturnValue({
      isLoading: false,
      subsidySummary: {},
    });

    useEnterpriseOffer.mockReturnValue({
      isLoading: false,
      data: {},
    });

    useEnterpriseGroup.mockReturnValue({
      data: {
        appliesToAllContexts: true,
        enterpriseCustomer: 'test-customer-uuid',
        name: 'test-name',
        uuid: 'test-uuid',
      },
    });

    useEnterpriseCustomer.mockReturnValue({
      data: {
        uuid: 'test-customer-uuid',
        activeIntegrations: ['BLACKBOARD'],
      },
    });

    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        enterpriseGroupLearners: {
          count: 40,
        },
      },
    });

    useAlgoliaSearch.mockReturnValue({
      isCatalogQueryFiltersEnabled: true,
      securedAlgoliaApiKey: 'mock-secured-algolia-api-key',
      isLoading: false,
      searchClient: algoliasearch('test-app-id', 'test-api-key'),
      catalogUuidsToCatalogQueryUuids: {
        [mockSubsidyAccessPolicyUUID]: 'test-catalog-query-uuid',
      },
    });

    useBnrSubsidyRequests.mockReturnValue({
      isLoading: false,
      bnrRequests: mockEmptyApprovedRequests,
      fetchBnrRequests: jest.fn(),
    });

    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: mockEmptyStateBudgetDetailActivityOverview,
    });

    useBudgetContentAssignments.mockReturnValue({
      isLoading: false,
      contentAssignments: {
        count: 0,
        results: [],
        numPages: 1,
      },
      fetchContentAssignments: jest.fn(),
    });

    useBudgetRedemptions.mockReturnValue({
      isLoading: false,
      budgetRedemptions: mockEmptyBudgetRedemptions,
      fetchBudgetRedemptions: jest.fn(),
    });
  });

  it('renders page not found messaging if budget is a subsidy access policy, but the REST API returns a 404', () => {
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: 'a52e6548-649f-4576-b73f-c5c2bee25e9c',
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      isError: true,
      error: { customAttributes: { httpErrorStatus: 404 } },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: mockEmptyStateBudgetDetailActivityOverview,
    });
    renderWithRouter(<BudgetDetailPageWrapper />);
    expect(screen.getByText('404', { selector: 'h1' }));
  });

  it.each([
    { displayName: null },
    { displayName: 'Test Budget Display Name' },
  ])('renders budget header data (%s)', ({ displayName }) => {
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: 'a52e6548-649f-4576-b73f-c5c2bee25e9c',
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: { ...mockAssignableSubsidyAccessPolicy, displayName },
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: mockEmptyStateBudgetDetailActivityOverview,
    });
    const expectedDisplayName = displayName || 'Overview';
    renderWithRouter(<BudgetDetailPageWrapper />);

    // Hero
    expect(screen.getByText('Learner Credit Management'));
    // Breadcrumb
    expect(screen.getByText(expectedDisplayName, { selector: 'li' }));
    // Page heading
    expect(screen.getByText(expectedDisplayName, { selector: 'h2' }));
  });

  it.each([
    {
      subsidyAccessPolicy: null,
      subsidySummary: null,
      expected: null,
      isLoading: true,
    },
    {
      subsidyAccessPolicy: null,
      subsidySummary: null,
      expected: null,
      isLoading: false,
    },
    {
      subsidyAccessPolicy: mockAssignableSubsidyAccessPolicy,
      subsidySummary: null,
      expected: {
        displayName: mockAssignableSubsidyAccessPolicy.displayName,
        spend: formatPrice(mockAssignableSubsidyAccessPolicy.aggregates.spendAvailableUsd),
        utilized: formatPrice(
          mockAssignableSubsidyAccessPolicy.aggregates.amountAllocatedUsd
          + mockAssignableSubsidyAccessPolicy.aggregates.amountRedeemedUsd,
        ),
        limit: formatPrice(mockAssignableSubsidyAccessPolicy.spendLimit / 100),
        allocated: formatPrice(mockAssignableSubsidyAccessPolicy.aggregates.amountAllocatedUsd),
        redeemed: formatPrice(mockAssignableSubsidyAccessPolicy.aggregates.amountRedeemedUsd),
      },
      isLoading: false,
    },
    {
      subsidyAccessPolicy: mockAssignableSubsidyAccessPolicyWithNoUtilization,
      subsidySummary: null,
      expected: {
        displayName: mockAssignableSubsidyAccessPolicyWithNoUtilization.displayName,
        spend: formatPrice(mockAssignableSubsidyAccessPolicyWithNoUtilization.aggregates.spendAvailableUsd),
        utilized: formatPrice(
          mockAssignableSubsidyAccessPolicyWithNoUtilization.aggregates.amountAllocatedUsd
          + mockAssignableSubsidyAccessPolicyWithNoUtilization.aggregates.amountRedeemedUsd,
        ),
        limit: formatPrice(mockAssignableSubsidyAccessPolicyWithNoUtilization.spendLimit / 100),
        allocated: formatPrice(mockAssignableSubsidyAccessPolicyWithNoUtilization.aggregates.amountAllocatedUsd),
        redeemed: formatPrice(mockAssignableSubsidyAccessPolicyWithNoUtilization.aggregates.amountRedeemedUsd),
      },
      isLoading: false,
    },
    {
      subsidyAccessPolicy: mockAssignableSubsidyAccessPolicyWithSpendNoAllocations,
      subsidySummary: null,
      expected: {
        displayName: mockAssignableSubsidyAccessPolicyWithSpendNoAllocations.displayName,
        spend: formatPrice(mockAssignableSubsidyAccessPolicyWithSpendNoAllocations.aggregates.spendAvailableUsd),
        utilized: formatPrice(
          mockAssignableSubsidyAccessPolicyWithSpendNoAllocations.aggregates.amountAllocatedUsd
          + mockAssignableSubsidyAccessPolicyWithSpendNoAllocations.aggregates.amountRedeemedUsd,
        ),
        limit: formatPrice(mockAssignableSubsidyAccessPolicyWithSpendNoAllocations.spendLimit / 100),
        allocated: formatPrice(mockAssignableSubsidyAccessPolicyWithSpendNoAllocations.aggregates.amountAllocatedUsd),
        redeemed: formatPrice(mockAssignableSubsidyAccessPolicyWithSpendNoAllocations.aggregates.amountRedeemedUsd),
      },
      isLoading: false,
    },
    {
      subsidyAccessPolicy: mockAssignableSubsidyAccessPolicyWithSpendNoRedeemed,
      subsidySummary: null,
      expected: {
        displayName: mockAssignableSubsidyAccessPolicyWithSpendNoRedeemed.displayName,
        spend: formatPrice(mockAssignableSubsidyAccessPolicyWithSpendNoRedeemed.aggregates.spendAvailableUsd),
        utilized: formatPrice(
          mockAssignableSubsidyAccessPolicyWithSpendNoRedeemed.aggregates.amountAllocatedUsd
          + mockAssignableSubsidyAccessPolicyWithSpendNoRedeemed.aggregates.amountRedeemedUsd,
        ),
        limit: formatPrice(mockAssignableSubsidyAccessPolicyWithSpendNoRedeemed.spendLimit / 100),
        allocated: formatPrice(mockAssignableSubsidyAccessPolicyWithSpendNoRedeemed.aggregates.amountAllocatedUsd),
        redeemed: formatPrice(mockAssignableSubsidyAccessPolicyWithSpendNoRedeemed.aggregates.amountRedeemedUsd),
      },
      isLoading: false,
    },
    {
      subsidyAccessPolicy: mockPerLearnerSpendLimitSubsidyAccessPolicy,
      subsidySummary: null,
      expected: {
        displayName: mockPerLearnerSpendLimitSubsidyAccessPolicy.displayName,
        spend: formatPrice(mockPerLearnerSpendLimitSubsidyAccessPolicy.aggregates.spendAvailableUsd),
        utilized: formatPrice(mockPerLearnerSpendLimitSubsidyAccessPolicy.aggregates.amountRedeemedUsd),
        limit: formatPrice(mockPerLearnerSpendLimitSubsidyAccessPolicy.spendLimit / 100),
        allocated: formatPrice(mockPerLearnerSpendLimitSubsidyAccessPolicy.aggregates.amountAllocatedUsd),
        redeemed: formatPrice(mockPerLearnerSpendLimitSubsidyAccessPolicy.aggregates.amountRedeemedUsd),
      },
      isLoading: false,
    },
    {
      subsidyAccessPolicy: null,
      subsidySummary: mockSubsidySummary,
      enterpriseOfferMetadata: mockEnterpriseOfferMetadata,
      expected: {
        displayName: mockEnterpriseOfferMetadata.displayName,
        spend: formatPrice(mockSubsidySummary.remainingFunds),
        utilized: formatPrice(mockSubsidySummary.redeemedFunds),
        limit: formatPrice(mockSubsidySummary.totalFunds),
        allocated: formatPrice(0),
        redeemed: formatPrice(mockSubsidySummary.redeemedFunds),
      },
      isLoading: false,
    },
  ])('render budget banner data (%s)', async ({
    subsidyAccessPolicy,
    subsidySummary,
    enterpriseOfferMetadata,
    expected,
    isLoading,
  }) => {
    const user = userEvent.setup();

    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: 'a52e6548-649f-4576-b73f-c5c2bee25e9c',
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      isLoading,
      data: subsidyAccessPolicy,
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useSubsidySummaryAnalyticsApi.mockReturnValue({
      isLoading,
      subsidySummary,
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: {
        contentAssignments: undefined,
        spentTransactions: { count: 0 },
      },
    });
    useEnterpriseOffer.mockReturnValue({
      isLoading: false,
      data: enterpriseOfferMetadata,
    });
    useBudgetRedemptions.mockReturnValue({
      isLoading: false,
      budgetRedemptions: mockEmptyBudgetRedemptions,
      fetchBudgetRedemptions: jest.fn(),
    });
    useEnterpriseRemovedGroupMembers.mockReturnValue({
      isRemovedMembersLoading: false,
      removedGroupMembersCount: 0,
    });
    renderWithRouter(<BudgetDetailPageWrapper />);

    if (isLoading) {
      expect(screen.getByTestId('budget-detail-skeleton'));
    }

    if (subsidyAccessPolicy?.isAssignable) {
      const redeemed = subsidyAccessPolicy.aggregates.amountRedeemedUsd;
      const allocated = subsidyAccessPolicy.aggregates.amountAllocatedUsd;

      const utilized = redeemed + allocated;

      if (utilized > 0) {
        await user.click(screen.getByText('Utilization details'));

        expect(screen.getByTestId('budget-utilization-amount')).toHaveTextContent(expected.utilized);
        expect(screen.getByTestId('budget-utilization-assigned')).toHaveTextContent(expected.allocated);
        expect(screen.getByTestId('budget-utilization-spent')).toHaveTextContent(expected.redeemed);

        if (allocated <= 0) {
          expect(screen.queryByText('View assigned activity')).not.toBeInTheDocument();
        }

        if (redeemed <= 0) {
          expect(screen.queryByText('View spent activity')).not.toBeInTheDocument();
        }
      }
    }

    if ((subsidyAccessPolicy || subsidySummary) && !isLoading) {
      expect(screen.getByText(expected.displayName, { selector: 'h2' }));

      expect(screen.getByTestId('budget-detail-available')).toHaveTextContent(expected.spend);
      expect(screen.getByTestId('budget-detail-utilized')).toHaveTextContent(`Utilized ${expected.utilized}`);
      expect(screen.getByTestId('budget-detail-limit')).toHaveTextContent(expected.limit);
    }
  });

  it('does not render bne zero state when the groups feature flag disabled', async () => {
    const initialState = {
      portalConfiguration: {
        ...initialStoreState.portalConfiguration,
        enterpriseFeatures: {
        },
      },
    };
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: 'a52e6548-649f-4576-b73f-c5c2bee25e9c',
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockPerLearnerSpendLimitSubsidyAccessPolicy,
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: mockEmptyStateBudgetDetailActivityOverview,
    });
    useBudgetRedemptions.mockReturnValue({
      isLoading: false,
      budgetRedemptions: mockEmptyBudgetRedemptions,
      fetchBudgetRedemptions: jest.fn(),
    });
    renderWithRouter(<BudgetDetailPageWrapper initialState={initialState} />);

    // Overview empty state (no content assignments, no spent transactions)
    expect(screen.queryByText('No budget activity yet? Invite members to browse the catalog and enroll!')).not.toBeInTheDocument();
  });

  it('does not render bne zero state when the customer does not have any group associations', async () => {
    const initialState = {
      portalConfiguration: {
        ...initialStoreState.portalConfiguration,
        enterpriseFeatures: {
        },
      },
    };
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: 'a52e6548-649f-4576-b73f-c5c2bee25e9c',
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockSpendLimitNoGroupsSubsidyAccessPolicy,
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: mockEmptyStateBudgetDetailActivityOverview,
    });
    useBudgetRedemptions.mockReturnValue({
      isLoading: false,
      budgetRedemptions: mockEmptyBudgetRedemptions,
      fetchBudgetRedemptions: jest.fn(),
    });
    renderWithRouter(<BudgetDetailPageWrapper initialState={initialState} />);

    // Overview empty state (no content assignments, no spent transactions)
    expect(screen.queryByText('No budget activity yet? Invite members to browse the catalog and enroll!')).not.toBeInTheDocument();
  });

  it.each([
    { isLargeViewport: true },
    { isLargeViewport: false },
  ])('displays assignable budget activity overview empty state', async ({ isLargeViewport }) => {
    const user = userEvent.setup();
    useIsLargeOrGreater.mockReturnValue(isLargeViewport);
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: 'a52e6548-649f-4576-b73f-c5c2bee25e9c',
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockAssignableSubsidyAccessPolicy,
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: mockEmptyStateBudgetDetailActivityOverview,
    });
    renderWithRouter(<BudgetDetailPageWrapper />);

    // Overview empty state (no content assignments, no spent transactions)
    expect(screen.getByText('No budget activity yet? Assign a course!')).toBeInTheDocument();
    const illustrationTestIds = ['find-the-right-course-illustration', 'name-your-learners-illustration', 'confirm-spend-illustration'];
    illustrationTestIds.forEach(testId => expect(screen.getByTestId(testId)).toBeInTheDocument());
    expect(screen.getByText('Get started', { selector: 'a' })).toBeInTheDocument();
    await user.click(screen.getByText('Get started'));
    await waitFor(() => expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1));
  });

  it.each([
    { isLargeViewport: true },
    { isLargeViewport: false },
  ])('displays bnr budget activity overview empty state', async ({ isLargeViewport }) => {
    useIsLargeOrGreater.mockReturnValue(isLargeViewport);
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: 'a52e6548-649f-4576-b73f-c5c2bee25e9c',
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockPerLearnerSpendLimitSubsidyAccessPolicy,
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useEnterpriseGroup.mockReturnValue({
      data: {
        appliesToAllContexts: false,
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: mockEmptyStateBudgetDetailActivityOverview,
    });
    useBudgetRedemptions.mockReturnValue({
      isLoading: false,
      budgetRedemptions: mockEmptyBudgetRedemptions,
      fetchBudgetRedemptions: jest.fn(),
    });
    useEnterpriseRemovedGroupMembers.mockReturnValue({
      isRemovedMembersLoading: false,
      removedGroupMembersCount: 0,
    });
    renderWithRouter(<BudgetDetailPageWrapper />);

    // Overview empty state (no content assignments, no spent transactions)
    expect(screen.getByText('No budget activity yet? Invite members to browse the catalog and enroll!')).toBeInTheDocument();
    const illustrationTestIds = ['name-your-members-illustration', 'members-browse-illustration', 'enroll-and-spend-illustration'];
    illustrationTestIds.forEach(testId => expect(screen.getByTestId(testId)).toBeInTheDocument());
    expect(screen.getByText('Get started', { selector: 'a' })).toBeInTheDocument();
  });

  it.each([
    { isLargeViewport: true },
    { isLargeViewport: false },
  ])('displays learner credit bnr budget activity overview empty state', async ({ isLargeViewport }) => {
    useIsLargeOrGreater.mockReturnValue(isLargeViewport);
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: 'a52e6548-649f-4576-b73f-c5c2bee25e9d',
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: {
        ...mockPerLearnerSpendLimitSubsidyAccessPolicy,
        bnrEnabled: true,
      },
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useEnterpriseGroup.mockReturnValue({
      data: {
        appliesToAllContexts: false,
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: mockEmptyStateBudgetDetailActivityOverview,
    });
    useBudgetRedemptions.mockReturnValue({
      isLoading: false,
      budgetRedemptions: mockEmptyBudgetRedemptions,
      fetchBudgetRedemptions: jest.fn(),
    });
    useEnterpriseRemovedGroupMembers.mockReturnValue({
      isRemovedMembersLoading: false,
      removedGroupMembersCount: 0,
    });
    renderWithRouter(<BudgetDetailPageWrapper />);

    // Overview empty state (no content assignments)
    expect(screen.getByText('No budget activity yet? Invite learners to browse the catalog and request content!')).toBeInTheDocument();
    const illustrationTestIds = ['find-course-illustration', 'invite-learner-illustration', 'approve-request-illustration'];
    illustrationTestIds.forEach(testId => expect(screen.getByTestId(testId)).toBeInTheDocument());
    expect(screen.getByText('Get started', { selector: 'a' })).toBeInTheDocument();
  });

  it('still render bne zero state if there are members but no spend', async () => {
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: 'a52e6548-649f-4576-b73f-c5c2bee25e9c',
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockPerLearnerSpendLimitSubsidyAccessPolicy,
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 1,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: {
          enterpriseGroupMembershipUuid: 'cde2e374-032f-4c08-8c0d-bf3205fa7c7e',
          learnerId: 4382,
          memberDetails: { userEmail: 'foobar@test.com', userName: 'ayy lmao' },
        },
      },
    });
    useEnterpriseRemovedGroupMembers.mockReturnValue({
      isRemovedMembersLoading: false,
      removedGroupMembersCount: 0,
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: mockEmptyStateBudgetDetailActivityOverview,
    });
    useBudgetRedemptions.mockReturnValue({
      isLoading: false,
      budgetRedemptions: mockEmptyBudgetRedemptions,
      fetchBudgetRedemptions: jest.fn(),
    });
    useEnterpriseGroup.mockReturnValue({
      data: {
        appliesToAllContexts: false,
      },
    });
    renderWithRouter(<BudgetDetailPageWrapper />);

    // Overview empty state (no content assignments, no spent transactions)
    expect(screen.getByText('No budget activity yet? Invite members to browse the catalog and enroll!')).toBeInTheDocument();

    expect(screen.getByText('Invite more members', { selector: 'a' })).toBeInTheDocument();
  });

  it('does not display bnr budget activity overview empty state and displays empty spent table', async () => {
    useIsLargeOrGreater.mockReturnValue(true);
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: 'a52e6548-649f-4576-b73f-c5c2bee25e9c',
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockPerLearnerSpendLimitSubsidyAccessPolicy,
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useEnterpriseGroup.mockReturnValue({
      data: {
        appliesToAllContexts: true,
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: mockEmptyStateBudgetDetailActivityOverview,
    });
    useBudgetRedemptions.mockReturnValue({
      isLoading: false,
      budgetRedemptions: mockEmptyBudgetRedemptions,
      fetchBudgetRedemptions: jest.fn(),
    });
    const storeState = {
      ...initialStoreState,
      portalConfiguration: {
        ...initialStoreState.portalConfiguration,
        enterpriseFeatures: {
          ...initialStoreState.portalConfiguration.enterpriseFeatures,
          topDownAssignmentRealTimeLcm: false,
        },
      },
    };
    renderWithRouter(<BudgetDetailPageWrapper initialState={storeState} />);

    // Display spent table when there is no spent activity but appliesToAllContext is true
    expect(screen.getByText('Search by enrollment details')).toBeInTheDocument();
    expect(screen.queryByText('Invite more members', { selector: 'a' })).not.toBeInTheDocument();
  });

  it.each([
    {
      subsidyAccessPolicy: null,
      enterpriseOfferMetadata: mockEnterpriseOfferMetadata,
      budgetId: mockEnterpriseOfferId,
      isTopDownAssignmentEnabled: true,
      expectedUseOfferRedemptionsArgs: [enterpriseUUID, mockEnterpriseOfferId, null, true],
    },
    {
      subsidyAccessPolicy: null,
      enterpriseOfferMetadata: mockEnterpriseOfferMetadata,
      budgetId: mockEnterpriseOfferId,
      isTopDownAssignmentEnabled: false,
      expectedUseOfferRedemptionsArgs: [enterpriseUUID, mockEnterpriseOfferId, null, false],
    },
    {
      subsidyAccessPolicy: mockPerLearnerSpendLimitSubsidyAccessPolicy,
      enterpriseOfferMetadata: null,
      budgetId: mockSubsidyAccessPolicyUUID,
      isTopDownAssignmentEnabled: true,
      expectedUseOfferRedemptionsArgs: [enterpriseUUID, null, mockSubsidyAccessPolicyUUID, true],
    },
    {
      subsidyAccessPolicy: mockAssignableSubsidyAccessPolicy,
      enterpriseOfferMetadata: null,
      budgetId: mockSubsidyAccessPolicyUUID,
      isTopDownAssignmentEnabled: false,
      expectedUseOfferRedemptionsArgs: [enterpriseUUID, null, mockSubsidyAccessPolicyUUID, false],
    },
  ])('displays spend table in "Activity" tab with empty results (%s)', async ({
    subsidyAccessPolicy,
    enterpriseOfferMetadata,
    budgetId,
    isTopDownAssignmentEnabled,
    expectedUseOfferRedemptionsArgs,
  }) => {
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId,
      activeTabKey: 'activity',
    });
    useSubsidySummaryAnalyticsApi.mockReturnValue({
      isLoading: false,
      subsidySummary: (enterpriseOfferMetadata) ? mockSubsidySummary : undefined,
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: (subsidyAccessPolicy) || undefined,
    });
    useEnterpriseOffer.mockReturnValue({
      isLoading: false,
      data: (enterpriseOfferMetadata) || undefined,
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: {
        contentAssignments: { count: 1 },
        spentTransactions: { count: 0 },
      },
    });
    useBudgetContentAssignments.mockReturnValue({
      isLoading: false,
      contentAssignments: {
        count: 0,
        results: [],
        numPages: 1,
      },
      fetchContentAssignments: jest.fn(),
    });
    useBudgetRedemptions.mockReturnValue({
      isLoading: false,
      budgetRedemptions: mockEmptyBudgetRedemptions,
      fetchBudgetRedemptions: jest.fn(),
    });

    const storeState = {
      ...initialStoreState,
      portalConfiguration: {
        ...initialStoreState.portalConfiguration,
        enterpriseFeatures: {
          ...initialStoreState.portalConfiguration.enterpriseFeatures,
          topDownAssignmentRealTimeLcm: isTopDownAssignmentEnabled,
        },
        disableExpiryMessagingForLearnerCredit: false,
      },
    };
    renderWithRouter(<BudgetDetailPageWrapper initialState={storeState} />);

    expect(useBudgetRedemptions).toHaveBeenCalledTimes(1);
    expect(useBudgetRedemptions).toHaveBeenCalledWith(...expectedUseOfferRedemptionsArgs);

    // Activity tab exists and is active
    expect(screen.getByText('Activity').getAttribute('aria-selected')).toBe('true');
    // Catalog tab does NOT exist since the budget is not assignable
    expect(screen.queryByText('Catalog')).not.toBeInTheDocument();

    // Spent table and messaging is visible within Activity tab contents
    const spentSection = within(screen.getByTestId('spent-section'));
    expect(spentSection.getByText('No results found')).toBeInTheDocument();
    expect(spentSection.getByText('Spent activity is driven by completed enrollments.', { exact: false })).toBeInTheDocument();
    const isSubsidyAccessPolicyWithAnalyticsApi = (
      budgetId === mockSubsidyAccessPolicyUUID && !isTopDownAssignmentEnabled
    );
    if (budgetId === mockEnterpriseOfferId || isSubsidyAccessPolicyWithAnalyticsApi) {
      // This copy is only present when the "Spent" table is backed by the
      // analytics API (i.e., budget is an enterprise offer or a subsidy access
      // policy with the LC2 feature flag disabled).
      expect(spentSection.getByText('Enrollment data is automatically updated every 12 hours.', { exact: false })).toBeInTheDocument();
    }
  });

  it('renders with assigned table empty state with spent table and catalog tab available for assignable budgets', async () => {
    const user = userEvent.setup();
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockAssignableSubsidyAccessPolicy,
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: {
        contentAssignments: { count: 0 },
        spentTransactions: { count: 2 },
      },
    });
    useBudgetContentAssignments.mockReturnValue({
      isLoading: false,
      contentAssignments: {
        count: 0,
        results: [],
        numPages: 1,
      },
      fetchContentAssignments: jest.fn(),
    });
    useBudgetRedemptions.mockReturnValue({
      isLoading: false,
      budgetRedemptions: {
        itemCount: 2,
        pageCount: 1,
        results: [mockEnrollmentTransaction, mockEnrollmentTransactionWithReversal],
      },
      fetchBudgetRedemptions: jest.fn(),
    });
    renderWithRouter(<BudgetDetailPageWrapper />);

    // Assigned table empty state is visible within Activity tab contents
    expect(screen.getByText('Assign more courses to maximize your budget.')).toBeInTheDocument();
    expect(screen.getByText('available balance of $10,000', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Assign courses', { selector: 'a' })).toBeInTheDocument();

    // Catalog tab exists and is NOT active
    expect(screen.getByText('Catalog').getAttribute('aria-selected')).toBe('false');

    // Spend table renders rows of data
    const spentSection = within(screen.getByText('Spent').closest('section'));
    expect(spentSection.queryByText('No results found')).not.toBeInTheDocument();
    expect(spentSection.getByText(mockLearnerEmail)).toBeInTheDocument();
    expect(spentSection.getByText(mockSecondLearnerEmail)).toBeInTheDocument();
    expect(spentSection.queryAllByText(mockContentTitle, { selector: 'a' })).toHaveLength(2);
    expect(spentSection.queryAllByText(`-${formatPrice(mockEnrollmentTransaction.courseListPrice)}`)).toHaveLength(2);

    // Includes reversal messaging on table row, when appropriate
    const transactionRowWithReversal = within(spentSection.getByText(mockSecondLearnerEmail).closest('tr'));
    expect(transactionRowWithReversal.getByText(`Refunded on ${formatDate(mockEnrollmentTransactionReversal.created)}`)).toBeInTheDocument();
    expect(transactionRowWithReversal.getByText(`+${formatPrice(mockEnrollmentTransaction.courseListPrice)}`)).toBeInTheDocument();

    await user.click(spentSection.queryAllByText(mockContentTitle, { selector: 'a' })[0]);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
  });

  it('renders with assigned table data and handles table refresh', async () => {
    const user = userEvent.setup();
    const NUMBER_OF_ASSIGNMENTS_TO_GENERATE = 60;
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockAssignableSubsidyAccessPolicy,
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: {
        contentAssignments: { count: NUMBER_OF_ASSIGNMENTS_TO_GENERATE },
        spentTransactions: { count: 0 },
      },
    });
    const mockFetchContentAssignments = jest.fn();
    // Max page size is 25 rows. Generate one assignment with a known learner email and the others with random emails.
    const mockAssignmentsList = [
      mockLearnerContentAssignment,
      ...Array.from({ length: PAGE_SIZE - 1 }, createMockLearnerContentAssignment),
    ];
    useBudgetContentAssignments.mockReturnValue({
      isLoading: false,
      contentAssignments: {
        count: NUMBER_OF_ASSIGNMENTS_TO_GENERATE,
        results: mockAssignmentsList,
        learnerStateCounts: [{ learnerState: 'waiting', count: NUMBER_OF_ASSIGNMENTS_TO_GENERATE }],
        numPages: Math.floor(NUMBER_OF_ASSIGNMENTS_TO_GENERATE / PAGE_SIZE),
        currentPage: 1,
      },
      fetchContentAssignments: mockFetchContentAssignments,
    });
    useBudgetRedemptions.mockReturnValue({
      isLoading: false,
      budgetRedemptions: mockEmptyBudgetRedemptions,
      fetchBudgetRedemptions: jest.fn(),
    });
    renderWithRouter(<BudgetDetailPageWrapper />);

    // Assigned table is visible within Activity tab contents
    const assignedSection = within(screen.getByText('Assigned').closest('section'));
    expect(assignedSection.queryByText('No results found')).not.toBeInTheDocument();
    expect(assignedSection.getByText(mockLearnerEmail)).toBeInTheDocument();
    const viewCourseCTA = assignedSection.queryAllByText(mockContentTitle, { selector: 'a' })[0];
    expect(viewCourseCTA).toBeInTheDocument();
    expect(viewCourseCTA.getAttribute('href')).toEqual(`${process.env.ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}/course/${mockCourseKey}`);
    expect(assignedSection.queryAllByText('-$199')).toHaveLength(PAGE_SIZE);
    expect(assignedSection.queryAllByText('Waiting for learner')).toHaveLength(PAGE_SIZE);
    expect(assignedSection.queryAllByText(`Assigned: ${formatDate('2023-10-27')}`)).toHaveLength(PAGE_SIZE);

    // Assert the "Select all X" label count is correct, after selecting a row. This verifies the
    // temporary patch of Paragon is working as intended. If this test fails, it may mean Paragon
    // was upgraded to a version that does not yet contain a fix for the underlying bug related to
    // the incorrect "Select all X" count.
    const selectAllCheckbox = screen.queryAllByRole('checkbox')[0];
    await user.click(selectAllCheckbox);

    await waitFor(() => {
      expect(getButtonElement(`Select all ${NUMBER_OF_ASSIGNMENTS_TO_GENERATE}`, { screenOverride: assignedSection })).toBeInTheDocument();
    });

    const selectAllCheckbox2 = screen.queryAllByRole('checkbox')[0];
    // Unselect the checkbox the "Refresh" table action appears
    await user.click(selectAllCheckbox2);

    const expectedTableFetchDataArgs = {
      pageIndex: DEFAULT_PAGE,
      pageSize: PAGE_SIZE,
      filters: [],
      sortBy: [{ id: 'recentAction', desc: true }], // default table sort order
    };
    expect(mockFetchContentAssignments).toHaveBeenCalledTimes(1); // called once on initial render
    expect(mockFetchContentAssignments).toHaveBeenCalledWith(expect.objectContaining(expectedTableFetchDataArgs));

    // Verify "Refresh" behavior
    const refreshCTA = assignedSection.getByText('Refresh', { selector: 'button' });
    expect(refreshCTA).toBeInTheDocument();
    await user.click(refreshCTA);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
    expect(mockFetchContentAssignments).toHaveBeenCalledTimes(2); // should be called again on refresh
    expect(mockFetchContentAssignments).toHaveBeenLastCalledWith(expect.objectContaining(expectedTableFetchDataArgs));

    await user.click(viewCourseCTA);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(2);
  }, 30000);

  it('cancels a approved learner credit request', async () => {
    const user = userEvent.setup();
    EnterpriseAccessApiService.cancelApprovedBnrSubsidyRequest.mockResolvedValueOnce({ status: 200 });
    const NUMBER_OF_APPROVE_REQUEST_TO_GENERATE = 60;
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockPerLearnerSpendLimitSubsidyAccessPolicyWithBnrEnabled,
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: {
        approvedBnrRequests: { count: NUMBER_OF_APPROVE_REQUEST_TO_GENERATE },
        contentAssignments: undefined,
        spentTransactions: { count: 0 },
      },
    });
    const mockFetchLearnerCreditRequests = jest.fn();
    // Max page size is 25 rows. Generate one assignment with a known learner email and the others with random emails.
    const mockRequestsList = [
      mockApprovedRequest, // Use the mockApprovedRequest with known values
      ...Array.from({ length: PAGE_SIZE - 1 }, createMockApprovedRequest),
    ];
    useBnrSubsidyRequests.mockReturnValue({
      isLoading: false,
      bnrRequests: {
        itemCount: NUMBER_OF_APPROVE_REQUEST_TO_GENERATE,
        results: mockRequestsList,
        pageCount: Math.floor(NUMBER_OF_APPROVE_REQUEST_TO_GENERATE / PAGE_SIZE),
      },
      fetchBnrRequests: mockFetchLearnerCreditRequests,
    });
    useBudgetRedemptions.mockReturnValue({
      isLoading: false,
      budgetRedemptions: mockEmptyBudgetRedemptions,
      fetchBudgetRedemptions: jest.fn(),
    });
    useEnterpriseRemovedGroupMembers.mockReturnValue({
      isRemovedMembersLoading: false,
      removedGroupMembersCount: 0,
    });
    renderWithRouter(<BudgetDetailPageWrapper />);

    await waitFor(() => {
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    // First, open the dropdown menu
    const dropdownToggle = screen.getByTestId('dropdown-toggle-test-approved-request-uuid');
    expect(dropdownToggle).toBeInTheDocument();
    await user.click(dropdownToggle);

    // Then find and click the cancel approval item
    const cancelIconButton = screen.getByTestId('cancel-approval-test-approved-request-uuid');
    expect(cancelIconButton).toBeInTheDocument();
    await user.click(cancelIconButton);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);

    const modalDialog = screen.getByRole('dialog');
    expect(modalDialog).toBeInTheDocument();
    expect(screen.getByText('Cancel approval?')).toBeInTheDocument();

    const cancelDialogButton = getButtonElement('Cancel approval');
    await user.click(cancelDialogButton);

    await waitFor(() => {
      expect(EnterpriseAccessApiService.cancelApprovedBnrSubsidyRequest).toHaveBeenCalledWith({
        enterpriseId: enterpriseUUID,
        subsidyRequestUUID: 'test-approved-request-uuid',
      });
    });

    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(2);
  }, 30000);

  it('reminds an approved learner credit request', async () => {
    const user = userEvent.setup();
    EnterpriseAccessApiService.remindApprovedBnrSubsidyRequest.mockResolvedValueOnce({ status: 200 });
    const NUMBER_OF_APPROVE_REQUEST_TO_GENERATE = 60;
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockPerLearnerSpendLimitSubsidyAccessPolicyWithBnrEnabled,
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: {
        approvedBnrRequests: { count: NUMBER_OF_APPROVE_REQUEST_TO_GENERATE },
        contentAssignments: undefined,
        spentTransactions: { count: 0 },
      },
    });
    const mockFetchLearnerCreditRequests = jest.fn();
    // Max page size is 25 rows. Generate one assignment with a known learner email and the others with random emails.
    const mockRequestsList = [
      mockApprovedRequest, // Use the mockApprovedRequest with known values
      ...Array.from({ length: PAGE_SIZE - 1 }, createMockApprovedRequest),
    ];
    useBnrSubsidyRequests.mockReturnValue({
      isLoading: false,
      bnrRequests: {
        itemCount: NUMBER_OF_APPROVE_REQUEST_TO_GENERATE,
        results: mockRequestsList,
        pageCount: Math.floor(NUMBER_OF_APPROVE_REQUEST_TO_GENERATE / PAGE_SIZE),
      },
      fetchBnrRequests: mockFetchLearnerCreditRequests,
    });
    useBudgetRedemptions.mockReturnValue({
      isLoading: false,
      budgetRedemptions: mockEmptyBudgetRedemptions,
      fetchBudgetRedemptions: jest.fn(),
    });
    useEnterpriseRemovedGroupMembers.mockReturnValue({
      isRemovedMembersLoading: false,
      removedGroupMembersCount: 0,
    });
    renderWithRouter(<BudgetDetailPageWrapper />);

    await waitFor(() => {
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    // First, open the dropdown menu
    const dropdownToggle = screen.getByTestId('dropdown-toggle-test-approved-request-uuid');
    expect(dropdownToggle).toBeInTheDocument();
    await user.click(dropdownToggle);

    // Then find and click the remind approval item
    const remindIconButton = screen.getByTestId('remind-approval-test-approved-request-uuid');
    expect(remindIconButton).toBeInTheDocument();
    await user.click(remindIconButton);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);

    const modalDialog = screen.getByRole('dialog');
    expect(modalDialog).toBeInTheDocument();
    expect(screen.getByText('Remind learner?')).toBeInTheDocument();

    const remindDialogButton = getButtonElement('Send reminder');
    await user.click(remindDialogButton);

    await waitFor(() => {
      expect(EnterpriseAccessApiService.remindApprovedBnrSubsidyRequest).toHaveBeenCalledWith({
        subsidyRequestUUID: 'test-approved-request-uuid',
        enterpriseId: enterpriseUUID,
      });
    });

    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(2);
  }, 30000);

  it('renders with approved requests table data and verifies first field data', async () => {
    const NUMBER_OF_APPROVE_REQUEST_TO_GENERATE = 60;
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockPerLearnerSpendLimitSubsidyAccessPolicyWithBnrEnabled,
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: {
        approvedBnrRequests: { count: NUMBER_OF_APPROVE_REQUEST_TO_GENERATE },
        contentAssignments: undefined,
        spentTransactions: { count: 0 },
      },
    });
    const mockFetchLearnerCreditRequests = jest.fn();
    // Max page size is 25 rows. Generate one assignment with a known learner email and the others with random emails.
    const mockRequestsList = [
      mockApprovedRequest, // Use the mockApprovedRequest with known values
      ...Array.from({ length: PAGE_SIZE - 1 }, createMockApprovedRequest),
    ];
    useBnrSubsidyRequests.mockReturnValue({
      isLoading: false,
      bnrRequests: {
        itemCount: NUMBER_OF_APPROVE_REQUEST_TO_GENERATE,
        results: mockRequestsList,
        pageCount: Math.floor(NUMBER_OF_APPROVE_REQUEST_TO_GENERATE / PAGE_SIZE),
      },
      fetchBnrRequests: mockFetchLearnerCreditRequests,
    });
    useBudgetRedemptions.mockReturnValue({
      isLoading: false,
      budgetRedemptions: mockEmptyBudgetRedemptions,
      fetchBudgetRedemptions: jest.fn(),
    });
    useEnterpriseRemovedGroupMembers.mockReturnValue({
      isRemovedMembersLoading: false,
      removedGroupMembersCount: 0,
    });
    renderWithRouter(<BudgetDetailPageWrapper />);

    await waitFor(() => {
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    const pendingSection = within(
      screen.getByText('Pending').closest('section'),
    );

    expect(pendingSection.getByText('Request details')).toBeInTheDocument();
    expect(pendingSection.getByText('Amount')).toBeInTheDocument();
    expect(pendingSection.getByText('Status')).toBeInTheDocument();
    expect(pendingSection.getByText('Recent action')).toBeInTheDocument();

    const tableElement = pendingSection.getByRole('table');
    const firstDataRow = within(tableElement).getAllByRole('row')[1]; // Skip header row
    const firstRowCells = within(firstDataRow).getAllByRole('cell');

    const requestDetailsCell = firstRowCells[0];
    expect(within(requestDetailsCell).getByText(mockLearnerEmail)).toBeInTheDocument();
    expect(within(requestDetailsCell).getByText(mockContentTitle)).toBeInTheDocument();

    const amountCell = firstRowCells[1];
    expect(within(amountCell).getByText('-$1.99')).toBeInTheDocument();

    const statusCell = firstRowCells[2];
    expect(
      within(statusCell).getByRole('button', { name: 'Waiting for learner' }),
    ).toBeInTheDocument();

    const recentActionCell = firstRowCells[3];
    expect(within(recentActionCell).getByText('Approved: Oct 27, 2023')).toBeInTheDocument();
  }, 30000);

  it.skip.each([
    { sortByColumnHeader: 'Amount', expectedSortBy: [{ id: 'amount', desc: false }] },
    { sortByColumnHeader: 'Recent action', expectedSortBy: [{ id: 'recentAction', desc: true }] },
  ])('renders sortable approved requests table data', async ({ sortByColumnHeader, expectedSortBy }) => {
    const user = userEvent.setup();
    const NUMBER_OF_APPROVE_REQUEST_TO_GENERATE = 60;
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockPerLearnerSpendLimitSubsidyAccessPolicyWithBnrEnabled,
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: {
        approvedBnrRequests: { count: NUMBER_OF_APPROVE_REQUEST_TO_GENERATE },
        contentAssignments: undefined,
        spentTransactions: { count: 0 },
      },
    });
    const mockFetchLearnerCreditRequests = jest.fn();
    const mockRequestsList = [
      mockApprovedRequest,
      ...Array.from({ length: PAGE_SIZE - 1 }, createMockApprovedRequest),
    ];
    useBnrSubsidyRequests.mockReturnValue({
      isLoading: false,
      bnrRequests: {
        itemCount: NUMBER_OF_APPROVE_REQUEST_TO_GENERATE,
        results: mockRequestsList,
        pageCount: Math.floor(NUMBER_OF_APPROVE_REQUEST_TO_GENERATE / PAGE_SIZE),
      },
      fetchBnrRequests: mockFetchLearnerCreditRequests,
    });
    useBudgetRedemptions.mockReturnValue({
      isLoading: false,
      budgetRedemptions: mockEmptyBudgetRedemptions,
      fetchBudgetRedemptions: jest.fn(),
    });
    useEnterpriseRemovedGroupMembers.mockReturnValue({
      isRemovedMembersLoading: false,
      removedGroupMembersCount: 0,
    });
    renderWithRouter(<BudgetDetailPageWrapper />);

    const pendingSection = within(screen.getByText('Pending').closest('section'));
    const expectedDefaultTableFetchDataArgs = {
      pageIndex: DEFAULT_PAGE,
      pageSize: PAGE_SIZE,
      filters: [{ id: 'requestStatus', value: ['approved'] }], // default filter for approved requests
      sortBy: [{ id: 'recentAction', desc: true }], // default table sort order
    };
    const expectedDefaultTableFetchDataArgsAfterSort = {
      ...expectedDefaultTableFetchDataArgs,
      sortBy: expectedSortBy,
    };

    expect(mockFetchLearnerCreditRequests).toHaveBeenCalledTimes(1); // called once on initial render
    expect(mockFetchLearnerCreditRequests).toHaveBeenCalledWith(
      expect.objectContaining(expectedDefaultTableFetchDataArgs),
    );

    const columnHeader = pendingSection.getByText(sortByColumnHeader);
    await user.click(columnHeader);

    expect(mockFetchLearnerCreditRequests).toHaveBeenCalledWith(
      expect.objectContaining(expectedDefaultTableFetchDataArgsAfterSort),
    );
  });

  it('renders approved requests table with empty filter choices when no status counts', async () => {
    const NUMBER_OF_APPROVE_REQUEST_TO_GENERATE = 10;
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockPerLearnerSpendLimitSubsidyAccessPolicyWithBnrEnabled,
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: {
        approvedBnrRequests: { count: NUMBER_OF_APPROVE_REQUEST_TO_GENERATE },
        contentAssignments: undefined,
        spentTransactions: { count: 0 },
      },
    });
    const mockFetchLearnerCreditRequests = jest.fn();
    const mockRequestsListWithoutStatus = [
      {
        ...mockApprovedRequest,
        lastActionStatus: null, // No status to test empty filter choices
      },
      ...Array.from({ length: PAGE_SIZE - 1 }, () => ({
        ...createMockApprovedRequest(),
        lastActionStatus: null,
      })),
    ];
    useBnrSubsidyRequests.mockReturnValue({
      isLoading: false,
      bnrRequests: {
        itemCount: NUMBER_OF_APPROVE_REQUEST_TO_GENERATE,
        results: mockRequestsListWithoutStatus,
        pageCount: Math.floor(NUMBER_OF_APPROVE_REQUEST_TO_GENERATE / PAGE_SIZE),
      },
      fetchBnrRequests: mockFetchLearnerCreditRequests,
    });
    useBudgetRedemptions.mockReturnValue({
      isLoading: false,
      budgetRedemptions: mockEmptyBudgetRedemptions,
      fetchBudgetRedemptions: jest.fn(),
    });
    useEnterpriseRemovedGroupMembers.mockReturnValue({
      isRemovedMembersLoading: false,
      removedGroupMembersCount: 0,
    });
    renderWithRouter(<BudgetDetailPageWrapper />);

    await waitFor(() => {
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    const pendingSection = within(screen.getByText('Pending').closest('section'));
    expect(pendingSection.getByRole('table')).toBeInTheDocument();
  });

  it('renders approved requests table with refresh action and tests click', async () => {
    const user = userEvent.setup();
    const NUMBER_OF_APPROVE_REQUEST_TO_GENERATE = 5;
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockPerLearnerSpendLimitSubsidyAccessPolicyWithBnrEnabled,
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: {
        approvedBnrRequests: { count: NUMBER_OF_APPROVE_REQUEST_TO_GENERATE },
        contentAssignments: undefined,
        spentTransactions: { count: 0 },
      },
    });
    const mockFetchLearnerCreditRequests = jest.fn();
    useBnrSubsidyRequests.mockReturnValue({
      isLoading: false,
      bnrRequests: {
        itemCount: NUMBER_OF_APPROVE_REQUEST_TO_GENERATE,
        results: [mockApprovedRequest],
        pageCount: 1,
      },
      fetchBnrRequests: mockFetchLearnerCreditRequests,
    });
    useBudgetRedemptions.mockReturnValue({
      isLoading: false,
      budgetRedemptions: mockEmptyBudgetRedemptions,
      fetchBudgetRedemptions: jest.fn(),
    });
    useEnterpriseRemovedGroupMembers.mockReturnValue({
      isRemovedMembersLoading: false,
      removedGroupMembersCount: 0,
    });

    renderWithRouter(<BudgetDetailPageWrapper />);

    await waitFor(() => {
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    expect(screen.getByText('Refresh')).toBeInTheDocument();

    const refreshButton = screen.getByText('Refresh');
    await user.click(refreshButton);
    expect(mockFetchLearnerCreditRequests).toHaveBeenCalledTimes(2);
  });

  it('renders approved requests table with empty filter choices when no status counts (tests line 61)', async () => {
    const NUMBER_OF_APPROVE_REQUEST_TO_GENERATE = 5;
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockPerLearnerSpendLimitSubsidyAccessPolicyWithBnrEnabled,
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: {
        approvedBnrRequests: { count: NUMBER_OF_APPROVE_REQUEST_TO_GENERATE },
        contentAssignments: undefined,
        spentTransactions: { count: 0 },
      },
    });
    const mockFetchLearnerCreditRequests = jest.fn();

    useBnrSubsidyRequests.mockReturnValue({
      isLoading: false,
      bnrRequests: {
        itemCount: NUMBER_OF_APPROVE_REQUEST_TO_GENERATE,
        results: [mockApprovedRequest],
        pageCount: 1,
        requestStatusCounts: null,
      },
      fetchBnrRequests: mockFetchLearnerCreditRequests,
    });
    useBudgetRedemptions.mockReturnValue({
      isLoading: false,
      budgetRedemptions: mockEmptyBudgetRedemptions,
      fetchBudgetRedemptions: jest.fn(),
    });
    useEnterpriseRemovedGroupMembers.mockReturnValue({
      isRemovedMembersLoading: false,
      removedGroupMembersCount: 0,
    });

    renderWithRouter(<BudgetDetailPageWrapper />);

    await waitFor(() => {
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    const pendingSection = within(screen.getByText('Pending').closest('section'));
    expect(pendingSection.getByRole('table')).toBeInTheDocument();
  });

  it('renders failed cancellation status chip and handles interactions (tests lines 12, 16, 23, 31)', async () => {
    const user = userEvent.setup();
    const NUMBER_OF_APPROVE_REQUEST_TO_GENERATE = 1;
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockPerLearnerSpendLimitSubsidyAccessPolicyWithBnrEnabled,
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: {
        approvedBnrRequests: { count: NUMBER_OF_APPROVE_REQUEST_TO_GENERATE },
        contentAssignments: undefined,
        spentTransactions: { count: 0 },
      },
    });
    const mockFetchLearnerCreditRequests = jest.fn();

    const mockFailedCancellationRequest = {
      ...mockApprovedRequest,
      lastActionErrorReason: 'failed_cancellation',
      latestAction: {
        ...mockApprovedRequest.latestAction,
        errorReason: 'failed_cancellation',
      },
    };
    useBnrSubsidyRequests.mockReturnValue({
      isLoading: false,
      bnrRequests: {
        itemCount: NUMBER_OF_APPROVE_REQUEST_TO_GENERATE,
        results: [mockFailedCancellationRequest],
        pageCount: 1,
      },
      fetchBnrRequests: mockFetchLearnerCreditRequests,
    });
    useBudgetRedemptions.mockReturnValue({
      isLoading: false,
      budgetRedemptions: mockEmptyBudgetRedemptions,
      fetchBudgetRedemptions: jest.fn(),
    });
    useEnterpriseRemovedGroupMembers.mockReturnValue({
      isRemovedMembersLoading: false,
      removedGroupMembersCount: 0,
    });

    renderWithRouter(<BudgetDetailPageWrapper />);

    await waitFor(() => {
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    const failedCancellationChip = screen.getByText('Failed: Cancellation');
    expect(failedCancellationChip).toBeInTheDocument();

    await user.click(failedCancellationChip);

    await waitFor(() => {
      expect(screen.getByText('This approved request was not canceled. Something went wrong behind the scenes.')).toBeInTheDocument();
    });

    expect(screen.getByText('Help Center')).toBeInTheDocument();
  });

  it('renders failed redemption status chip and handles interactions', async () => {
    const user = userEvent.setup();
    const NUMBER_OF_APPROVE_REQUEST_TO_GENERATE = 1;
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockPerLearnerSpendLimitSubsidyAccessPolicyWithBnrEnabled,
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: {
        approvedBnrRequests: { count: NUMBER_OF_APPROVE_REQUEST_TO_GENERATE },
        contentAssignments: undefined,
        spentTransactions: { count: 0 },
      },
    });
    const mockFetchLearnerCreditRequests = jest.fn();

    const mockFailedRedemptionRequest = {
      ...mockApprovedRequest,
      lastActionErrorReason: 'failed_redemption',
      latestAction: {
        ...mockApprovedRequest.latestAction,
        errorReason: 'failed_redemption',
      },
    };
    useBnrSubsidyRequests.mockReturnValue({
      isLoading: false,
      bnrRequests: {
        itemCount: NUMBER_OF_APPROVE_REQUEST_TO_GENERATE,
        results: [mockFailedRedemptionRequest],
        pageCount: 1,
      },
      fetchBnrRequests: mockFetchLearnerCreditRequests,
    });
    useBudgetRedemptions.mockReturnValue({
      isLoading: false,
      budgetRedemptions: mockEmptyBudgetRedemptions,
      fetchBudgetRedemptions: jest.fn(),
    });
    useEnterpriseRemovedGroupMembers.mockReturnValue({
      isRemovedMembersLoading: false,
      removedGroupMembersCount: 0,
    });

    renderWithRouter(<BudgetDetailPageWrapper />);

    await waitFor(() => {
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    const failedRedemptionChip = screen.getByText('Failed: Redemption');
    expect(failedRedemptionChip).toBeInTheDocument();

    await user.click(failedRedemptionChip);

    await waitFor(() => {
      expect(screen.getByText('Something went wrong behind the scenes when the learner attempted to redeem the requested course. Associated Learner credit funds have been released into your available balance.')).toBeInTheDocument();
    });

    expect(screen.getByText('Help Center')).toBeInTheDocument();
  });

  it('renders request status cells with different statuses', async () => {
    const NUMBER_OF_APPROVE_REQUEST_TO_GENERATE = 3;
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockPerLearnerSpendLimitSubsidyAccessPolicyWithBnrEnabled,
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: {
        approvedBnrRequests: { count: NUMBER_OF_APPROVE_REQUEST_TO_GENERATE },
        contentAssignments: undefined,
        spentTransactions: { count: 0 },
      },
    });
    const mockFetchLearnerCreditRequests = jest.fn();
    const mockRequestsWithDifferentStatuses = [
      {
        ...mockApprovedRequest,
        lastActionStatus: 'reminded',
      },
      {
        ...createMockApprovedRequest(),
        lastActionStatus: 'refunded',
        lastActionErrorReason: 'failed_cancellation',
      },
      {
        ...createMockApprovedRequest(),
        lastActionStatus: 'completed',
      },
    ];
    useBnrSubsidyRequests.mockReturnValue({
      isLoading: false,
      bnrRequests: {
        itemCount: NUMBER_OF_APPROVE_REQUEST_TO_GENERATE,
        results: mockRequestsWithDifferentStatuses,
        pageCount: 1,
      },
      fetchBnrRequests: mockFetchLearnerCreditRequests,
    });
    useBudgetRedemptions.mockReturnValue({
      isLoading: false,
      budgetRedemptions: mockEmptyBudgetRedemptions,
      fetchBudgetRedemptions: jest.fn(),
    });
    useEnterpriseRemovedGroupMembers.mockReturnValue({
      isRemovedMembersLoading: false,
      removedGroupMembersCount: 0,
    });
    renderWithRouter(<BudgetDetailPageWrapper />);

    await waitFor(() => {
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    // Verify basic table structure and status rendering
    const pendingSection = within(screen.getByText('Pending').closest('section'));
    expect(pendingSection.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByText('Waiting for learner')).toHaveLength(2);
    expect(screen.getAllByText('Failed: Cancellation')).toHaveLength(1);
  });

  it('handles approved requests table pagination correctly', async () => {
    const NUMBER_OF_APPROVE_REQUEST_TO_GENERATE = 50;
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockPerLearnerSpendLimitSubsidyAccessPolicyWithBnrEnabled,
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: {
        approvedBnrRequests: { count: NUMBER_OF_APPROVE_REQUEST_TO_GENERATE },
        contentAssignments: undefined,
        spentTransactions: { count: 0 },
      },
    });
    const mockFetchLearnerCreditRequests = jest.fn();
    const mockRequestsList = Array.from({ length: PAGE_SIZE }, () => createMockApprovedRequest());
    useBnrSubsidyRequests.mockReturnValue({
      isLoading: false,
      bnrRequests: {
        itemCount: NUMBER_OF_APPROVE_REQUEST_TO_GENERATE,
        results: mockRequestsList,
        pageCount: 2,
      },
      fetchBnrRequests: mockFetchLearnerCreditRequests,
    });
    useBudgetRedemptions.mockReturnValue({
      isLoading: false,
      budgetRedemptions: mockEmptyBudgetRedemptions,
      fetchBudgetRedemptions: jest.fn(),
    });
    useEnterpriseRemovedGroupMembers.mockReturnValue({
      isRemovedMembersLoading: false,
      removedGroupMembersCount: 0,
    });

    renderWithRouter(<BudgetDetailPageWrapper />);

    await waitFor(() => {
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    // Verify table with pagination
    const pendingSection = within(screen.getByText('Pending').closest('section'));
    expect(pendingSection.getByRole('table')).toBeInTheDocument();
    expect(pendingSection.getAllByRole('row')).toHaveLength(PAGE_SIZE + 1); // +1 for header row
  });

  it('handles approved requests table loading state', async () => {
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockPerLearnerSpendLimitSubsidyAccessPolicyWithBnrEnabled,
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: {
        approvedBnrRequests: { count: 1 },
        contentAssignments: undefined,
        spentTransactions: { count: 0 },
      },
    });
    const mockFetchLearnerCreditRequests = jest.fn();
    useBnrSubsidyRequests.mockReturnValue({
      isLoading: true, // Test loading state
      bnrRequests: {
        itemCount: 0,
        results: [],
        pageCount: 0,
      },
      fetchBnrRequests: mockFetchLearnerCreditRequests,
    });
    useBudgetRedemptions.mockReturnValue({
      isLoading: false,
      budgetRedemptions: mockEmptyBudgetRedemptions,
      fetchBudgetRedemptions: jest.fn(),
    });
    useEnterpriseRemovedGroupMembers.mockReturnValue({
      isRemovedMembersLoading: false,
      removedGroupMembersCount: 0,
    });
    renderWithRouter(<BudgetDetailPageWrapper />);

    await waitFor(() => {
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    // Verify loading state is handled (table should still render with loading indicator)
    const pendingSection = within(screen.getByText('Pending').closest('section'));
    expect(pendingSection.getByRole('table')).toBeInTheDocument();
  });

  it('renders budget detail activity tab contents with different states', async () => {
    // Test when there are no approved requests but there are assignments
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockAssignableSubsidyAccessPolicy, // Use assignable policy instead of BNR
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: {
        contentAssignments: { count: 5 },
        spentTransactions: { count: 2 },
      },
    });
    useBudgetContentAssignments.mockReturnValue({
      isLoading: false,
      contentAssignments: {
        count: 5,
        results: [mockLearnerContentAssignment],
        learnerStateCounts: [{ learnerState: 'waiting', count: 1 }],
        numPages: 1,
        currentPage: 1,
      },
      fetchContentAssignments: jest.fn(),
    });
    useBudgetRedemptions.mockReturnValue({
      isLoading: false,
      budgetRedemptions: mockEmptyBudgetRedemptions,
      fetchBudgetRedemptions: jest.fn(),
    });
    useEnterpriseRemovedGroupMembers.mockReturnValue({
      isRemovedMembersLoading: false,
      removedGroupMembersCount: 0,
    });
    renderWithRouter(<BudgetDetailPageWrapper />);

    await waitFor(() => {
      // Should render assigned section instead of pending for assignable budget
      expect(screen.getByText('Assigned')).toBeInTheDocument();
    });

    // Verify that no pending section is shown for non-BNR budget
    expect(screen.queryByText('Pending')).not.toBeInTheDocument();
  });

  it.each([
    { sortByColumnHeader: 'Amount', expectedSortBy: [{ id: 'amount', desc: false }] },
  ])('renders sortable assigned table data', async ({ sortByColumnHeader, expectedSortBy }) => {
    const user = userEvent.setup();
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockAssignableSubsidyAccessPolicy,
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: {
        contentAssignments: { count: 1 },
        spentTransactions: { count: 0 },
      },
    });
    const mockFetchContentAssignments = jest.fn();
    useBudgetContentAssignments.mockReturnValue({
      isLoading: false,
      contentAssignments: {
        count: 1,
        results: [mockLearnerContentAssignment],
        learnerStateCounts: [{ learnerState: 'waiting', count: 1 }],
        numPages: 1,
        currentPage: 1,
      },
      fetchContentAssignments: mockFetchContentAssignments,
    });
    useBudgetRedemptions.mockReturnValue({
      isLoading: false,
      budgetRedemptions: mockEmptyBudgetRedemptions,
      fetchBudgetRedemptions: jest.fn(),
    });
    renderWithRouter(<BudgetDetailPageWrapper />);

    const assignedSection = within(screen.getByText('Assigned').closest('section'));
    const expectedDefaultTableFetchDataArgs = {
      pageIndex: DEFAULT_PAGE,
      pageSize: PAGE_SIZE,
      filters: [],
      sortBy: [{ id: 'recentAction', desc: true }], // default table sort order
    };
    const expectedDefaultTableFetchDataArgsAfterSort = {
      ...expectedDefaultTableFetchDataArgs,
      sortBy: expectedSortBy,
    };

    expect(mockFetchContentAssignments).toHaveBeenCalledTimes(1); // called once on initial render
    expect(mockFetchContentAssignments).toHaveBeenCalledWith(
      expect.objectContaining(expectedDefaultTableFetchDataArgs),
    );

    // Verify amount column sort
    const amountColumnHeader = assignedSection.getByText(sortByColumnHeader);
    await user.click(amountColumnHeader);

    expect(mockFetchContentAssignments).toHaveBeenCalledWith(
      expect.objectContaining(expectedDefaultTableFetchDataArgsAfterSort),
    );
  });

  it.each([
    {
      filterBy: {
        field: 'status',
        value: ['waiting'],
      },
      expectedFilters: [{ id: 'learnerState', value: ['waiting'] }],
    },
    {
      filterBy: {
        field: 'search',
        value: mockLearnerEmail,
      },
      expectedFilters: [{ id: 'assignmentDetails', value: mockLearnerEmail }],
    },
  ])('renders filterable assigned table data (%s)', async ({
    filterBy,
    expectedFilters,
  }) => {
    const user = userEvent.setup();
    const { field, value } = filterBy;

    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockAssignableSubsidyAccessPolicy,
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: {
        contentAssignments: { count: 1 },
        spentTransactions: { count: 0 },
      },
    });
    const mockFetchContentAssignments = jest.fn();
    useBudgetContentAssignments.mockReturnValue({
      isLoading: false,
      contentAssignments: {
        count: 1,
        results: [mockLearnerContentAssignment],
        learnerStateCounts: [{ learnerState: 'waiting', count: 1 }],
        numPages: 1,
        currentPage: 1,
      },
      fetchContentAssignments: mockFetchContentAssignments,
    });
    useBudgetRedemptions.mockReturnValue({
      isLoading: false,
      budgetRedemptions: mockEmptyBudgetRedemptions,
      fetchBudgetRedemptions: jest.fn(),
    });
    renderWithRouter(<BudgetDetailPageWrapper />);

    const assignedSection = within(screen.getByText('Assigned').closest('section'));
    const expectedDefaultTableFetchDataArgs = {
      pageIndex: DEFAULT_PAGE,
      pageSize: PAGE_SIZE,
      filters: [],
      sortBy: [{ id: 'recentAction', desc: true }], // default table sort order
    };
    const expectedTableFetchDataArgsAfterFilter = {
      ...expectedDefaultTableFetchDataArgs,
      filters: expectedFilters,
    };
    expect(mockFetchContentAssignments).toHaveBeenCalledTimes(1); // called once on initial render
    expect(mockFetchContentAssignments).toHaveBeenCalledWith(
      expect.objectContaining(expectedDefaultTableFetchDataArgs),
    );

    if (field === 'status') {
      const filtersButton = getButtonElement('Filters', { screenOverride: assignedSection });
      await user.click(filtersButton);
      await waitFor(async () => {
        const filtersDropdown = screen.getAllByRole('group', { name: 'Status' })[0];
        const filtersDropdownContainer = within(filtersDropdown);
        if (value.includes('waiting')) {
          const waitingForLearnerOption = filtersDropdownContainer.getByLabelText('Waiting for learner 1', { exact: false });
          expect(waitingForLearnerOption).toBeInTheDocument();
          await user.click(waitingForLearnerOption);

          expect(waitingForLearnerOption).toBeChecked();
          expect(mockFetchContentAssignments).toHaveBeenCalledWith(
            expect.objectContaining(expectedTableFetchDataArgsAfterFilter),
          );
        }
      });
    }

    if (field === 'search') {
      const assignmentDetailsInputField = assignedSection.getByLabelText('Search by assignment details');
      await user.type(assignmentDetailsInputField, value);

      await waitFor(() => {
        expect(assignmentDetailsInputField).toHaveValue(value);
        expect(mockFetchContentAssignments).toHaveBeenCalledWith(
          expect.objectContaining(expectedTableFetchDataArgsAfterFilter),
        );
      });
    }
  }, 15000);

  it.each([
    {
      columnHeader: 'Amount',
      columnId: 'amount',
    },
  ])('renders sortable assigned table data (%s)', async ({ columnHeader, columnId }) => {
    const user = userEvent.setup();
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockAssignableSubsidyAccessPolicy,
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: {
        contentAssignments: { count: 1 },
        spentTransactions: { count: 0 },
      },
    });
    const mockFetchContentAssignments = jest.fn();
    useBudgetContentAssignments.mockReturnValue({
      isLoading: false,
      contentAssignments: {
        count: 1,
        results: [mockLearnerContentAssignment],
        learnerStateCounts: [{ learnerState: 'waiting', count: 1 }],
        numPages: 1,
        currentPage: 1,
      },
      fetchContentAssignments: mockFetchContentAssignments,
    });
    useBudgetRedemptions.mockReturnValue({
      isLoading: false,
      budgetRedemptions: mockEmptyBudgetRedemptions,
      fetchBudgetRedemptions: jest.fn(),
    });
    renderWithRouter(<BudgetDetailPageWrapper />);

    const assignedSection = within(screen.getByText('Assigned').closest('section'));
    const expectedDefaultTableFetchDataArgs = {
      pageIndex: DEFAULT_PAGE,
      pageSize: PAGE_SIZE,
      filters: [],
      sortBy: [{ id: 'recentAction', desc: true }], // default table sort order
    };
    const expectedTableFetchDataArgsAfterSortAsc = {
      ...expectedDefaultTableFetchDataArgs,
      sortBy: [{ id: columnId, desc: false }],
    };
    const expectedTableFetchDataArgsAfterSortDesc = {
      ...expectedDefaultTableFetchDataArgs,
      sortBy: [{ id: columnId, desc: true }],
    };
    expect(mockFetchContentAssignments).toHaveBeenCalledTimes(1); // called once on initial render
    expect(mockFetchContentAssignments).toHaveBeenCalledWith(
      expect.objectContaining(expectedDefaultTableFetchDataArgs),
    );

    const orderedColumnHeader = assignedSection.getByText(columnHeader);
    await user.click(orderedColumnHeader);
    expect(mockFetchContentAssignments).toHaveBeenCalledWith(
      expect.objectContaining(expectedTableFetchDataArgsAfterSortAsc),
    );
    await user.click(orderedColumnHeader);
    expect(mockFetchContentAssignments).toHaveBeenCalledWith(
      expect.objectContaining(expectedTableFetchDataArgsAfterSortDesc),
    );
  });

  it('renders with assigned table data "View Course" hyperlink default when content title is null', () => {
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockAssignableSubsidyAccessPolicy,
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: {
        contentAssignments: { count: 1 },
        spentTransactions: { count: 0 },
      },
    });
    useBudgetContentAssignments.mockReturnValue({
      isLoading: false,
      contentAssignments: {
        count: 1,
        results: [{ ...mockLearnerContentAssignment, contentTitle: null }],
        learnerStateCounts: [{ learnerState: 'waiting', count: 1 }],
        numPages: 1,
        currentPage: 1,
      },
      fetchContentAssignments: jest.fn(),
    });
    useBudgetRedemptions.mockReturnValue({
      isLoading: false,
      budgetRedemptions: mockEmptyBudgetRedemptions,
      fetchBudgetRedemptions: jest.fn(),
    });
    renderWithRouter(<BudgetDetailPageWrapper />);

    // Assigned table is visible within Activity tab contents
    const assignedSection = within(screen.getByText('Assigned').closest('section'));
    expect(assignedSection.queryByText('No results found')).not.toBeInTheDocument();
    expect(assignedSection.getByText(mockLearnerEmail)).toBeInTheDocument();
    const viewCourseCTA = assignedSection.getByText('View Course', { selector: 'a' });
    expect(viewCourseCTA).toBeInTheDocument();
    expect(viewCourseCTA.getAttribute('href')).toEqual(`${process.env.ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}/course/${mockCourseKey}`);
  });

  it('renders with incomplete assignments table data, when budget is retired', async () => {
    const user = userEvent.setup();
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: {
        ...mockAssignableSubsidyAccessPolicy,
        retired: true,
        isRetiredOrExpired: true,
      },
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: {
        contentAssignments: { count: 1 },
        spentTransactions: { count: 0 },
      },
    });
    useBudgetContentAssignments.mockReturnValue({
      isLoading: false,
      contentAssignments: {
        count: 1,
        results: [{ ...mockLearnerContentAssignment, contentTitle: null }],
        learnerStateCounts: [{ learnerState: 'waiting', count: 1 }],
        numPages: 1,
        currentPage: 1,
      },
      fetchContentAssignments: jest.fn(),
    });
    useBudgetRedemptions.mockReturnValue({
      isLoading: false,
      budgetRedemptions: mockEmptyBudgetRedemptions,
      fetchBudgetRedemptions: jest.fn(),
    });
    renderWithRouter(<BudgetDetailPageWrapper />);

    const assignedSection = within(screen.getByText('Incomplete assignments').closest('section'));

    expect(assignedSection.queryByText('Refresh', { selector: 'button' })).not.toBeInTheDocument();
    expect(assignedSection.queryByTestId('remind-assignment-test-uuid')).not.toBeInTheDocument();
    expect(assignedSection.queryByTestId('cancel-assignment-test-uuid')).not.toBeInTheDocument();

    const incompleteStatusChips = assignedSection.queryAllByText('Incomplete');

    expect(incompleteStatusChips).toHaveLength(1);
    expect(assignedSection.queryAllByText('-$199')).toHaveLength(1);
    expect(assignedSection.queryAllByText(`Assigned: ${formatDate('2023-10-27')}`)).toHaveLength(1);

    incompleteStatusChips[0].style.pointerEvents = 'auto';

    await user.click(incompleteStatusChips[0]);

    await waitFor(() => {
      expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('assignment-status-modalpopup-contents')).toBeInTheDocument();
    });

    // Modal popup is visible with expected text
    const modalPopupContents = within(screen.getByTestId('assignment-status-modalpopup-contents'));
    expect(modalPopupContents.getByText('Incomplete assignment')).toBeInTheDocument();
    expect(modalPopupContents.getByText('This budget became inactive before the learner enrolled.', { exact: false })).toBeInTheDocument();

    // Help Center link clicked
    const helpCenterLink = modalPopupContents.getByText('Help Center: Course Assignments');
    await user.click(helpCenterLink);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(2);

    await user.click(incompleteStatusChips[0]);

    // Contacting your support link clicked and modal closed
    const contactSupport = modalPopupContents.getByText('contacting support.');
    await user.click(contactSupport);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(4);
  });

  it.each([
    {
      learnerState: 'notifying',
      hasLearnerEmail: true,
      expectedChipStatus: 'Notifying learner',
      expectedModalPopupHeading: `Notifying ${mockLearnerEmail}`,
      expectedModalPopupContent: `Our system is busy emailing ${mockLearnerEmail}!`,
      actions: [],
      errorReason: null,
    },
    {
      learnerState: 'notifying',
      hasLearnerEmail: false,
      expectedChipStatus: 'Notifying learner',
      expectedModalPopupHeading: 'Notifying learner',
      expectedModalPopupContent: 'Our system is busy emailing the learner!',
      actions: [],
      errorReason: null,
    },
    {
      learnerState: 'waiting',
      hasLearnerEmail: true,
      expectedChipStatus: 'Waiting for learner',
      expectedModalPopupHeading: `Waiting for ${mockLearnerEmail}`,
      expectedModalPopupContent: 'This learner must create an edX account and complete enrollment in the course',
      actions: [mockSuccessfulLinkedLearnerAction, mockSuccessfulNotifiedAction],
      errorReason: null,
    },
    {
      learnerState: 'waiting',
      hasLearnerEmail: false,
      expectedChipStatus: 'Waiting for learner',
      expectedModalPopupHeading: 'Waiting for learner',
      expectedModalPopupContent: 'This learner must create an edX account and complete enrollment in the course',
      actions: [mockSuccessfulLinkedLearnerAction, mockSuccessfulNotifiedAction],
      errorReason: null,
    },
    {
      learnerState: 'failed',
      hasLearnerEmail: true,
      expectedChipStatus: 'Failed: Bad email',
      expectedModalPopupHeading: 'Failed: Bad email',
      expectedModalPopupContent: `This course assignment failed because a notification to ${mockLearnerEmail} could not be sent.`,
      actions: [mockSuccessfulLinkedLearnerAction, mockFailedNotifiedAction],
      errorReason: {
        errorReason: 'email_error',
        actionType: 'notified',
      },
    },
    {
      learnerState: 'failed',
      hasLearnerEmail: false,
      expectedChipStatus: 'Failed: Bad email',
      expectedModalPopupHeading: 'Failed: Bad email',
      expectedModalPopupContent: 'This course assignment failed because a notification to the learner could not be sent.',
      actions: [mockSuccessfulLinkedLearnerAction, mockFailedNotifiedAction],
      errorReason: {
        errorReason: 'email_error',
        actionType: 'notified',
      },
    },
    {
      learnerState: 'failed',
      hasLearnerEmail: true,
      expectedChipStatus: 'Failed: System',
      expectedModalPopupHeading: 'Failed: System',
      expectedModalPopupContent: 'Something went wrong behind the scenes.',
      actions: [mockFailedLinkedLearnerAction],
      errorReason: {
        errorReason: 'internal_api_error',
        actionType: 'notified',
      },
    },
    // This test case is weird because we always serialize the latest failed action into error_reason in the assignment
    // API response.  Nevertheless, keep it in just to cover potential backend serializer bugs.
    {
      learnerState: 'failed',
      hasLearnerEmail: true,
      expectedChipStatus: 'Failed: System',
      expectedModalPopupHeading: 'Failed: System',
      expectedModalPopupContent: 'Something went wrong behind the scenes.',
      actions: [mockFailedLinkedLearnerAction],
      errorReason: null,
    },
    {
      learnerState: 'failed',
      hasLearnerEmail: true,
      expectedChipStatus: 'Failed: Cancellation',
      expectedModalPopupHeading: 'Failed: Cancellation',
      expectedModalPopupContent: 'Something went wrong behind the scenes.',
      actions: [mockFailedCancelledLearnerAction],
      errorReason: {
        errorReason: 'email_error',
        actionType: 'cancelled',
      },
    },
    {
      learnerState: 'failed',
      hasLearnerEmail: true,
      expectedChipStatus: 'Failed: Cancellation',
      expectedModalPopupHeading: 'Failed: Cancellation',
      expectedModalPopupContent: 'Something went wrong behind the scenes.',
      actions: [mockFailedCancelledLearnerAction],
      errorReason: {
        errorReason: 'internal_api_error',
        actionType: 'cancelled',
      },
    },
    {
      learnerState: 'failed',
      hasLearnerEmail: true,
      expectedChipStatus: 'Failed: Reminder',
      expectedModalPopupHeading: 'Failed: Reminder',
      expectedModalPopupContent: 'Something went wrong behind the scenes.',
      actions: [mockFailedReminderLearnerAction],
      errorReason: {
        errorReason: 'internal_api_error',
        actionType: 'reminded',
      },
    },
    {
      learnerState: 'failed',
      hasLearnerEmail: true,
      expectedChipStatus: 'Failed: Redemption',
      expectedModalPopupHeading: 'Failed: Redemption',
      expectedModalPopupContent: (
        'Something went wrong behind the scenes when the learner attempted to redeem this course assignment. '
        + 'Associated Learner credit funds have been released into your available balance.'
      ),
      actions: [mockSuccessfulLinkedLearnerAction, mockSuccessfulNotifiedAction, mockFailedRedemptionLearnerAction],
      errorReason: {
        actionType: mockFailedRedemptionLearnerAction.actionType,
        errorReason: mockFailedRedemptionLearnerAction.errorReason,
      },
    },
  ])('renders correct status chips with assigned table data (%s)', async ({
    learnerState,
    hasLearnerEmail,
    expectedChipStatus,
    expectedModalPopupHeading,
    expectedModalPopupContent,
    actions,
    errorReason,
  }) => {
    const user = userEvent.setup();
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockAssignableSubsidyAccessPolicy,
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: {
        contentAssignments: { count: 1 },
        spentTransactions: { count: 0 },
      },
    });
    useBudgetContentAssignments.mockReturnValue({
      isLoading: false,
      contentAssignments: {
        count: 1,
        results: [
          {
            ...mockLearnerContentAssignment,
            learnerEmail: hasLearnerEmail ? mockLearnerEmail : null,
            learnerState,
            actions,
            errorReason,
          },
        ],
        learnerStateCounts: [{ learnerState, count: 1 }],
        numPages: 1,
        currentPage: 1,
      },
      fetchContentAssignments: jest.fn(),
    });
    useBudgetRedemptions.mockReturnValue({
      isLoading: false,
      budgetRedemptions: mockEmptyBudgetRedemptions,
      fetchBudgetRedemptions: jest.fn(),
    });
    renderWithRouter(<BudgetDetailPageWrapper />);

    // Assigned table is visible within Activity tab contents
    const assignedSection = within(screen.getByText('Assigned').closest('section'));
    if (hasLearnerEmail) {
      expect(assignedSection.getByText(mockLearnerEmail)).toBeInTheDocument();
    } else {
      expect(assignedSection.getByText('Email hidden')).toBeInTheDocument();
    }
    const statusChip = assignedSection.getByText(expectedChipStatus);
    expect(statusChip).toBeInTheDocument();

    statusChip.style.pointerEvents = 'auto';

    await user.click(statusChip);

    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);

    // Modal popup is visible with expected text
    const modalPopupContents = within(screen.getByTestId('assignment-status-modalpopup-contents'));
    expect(modalPopupContents.getByText(expectedModalPopupHeading)).toBeInTheDocument();
    expect(modalPopupContents.getByText(expectedModalPopupContent, { exact: false })).toBeInTheDocument();

    // Help Center link clicked and modal closed
    if (screen.queryByText('Help Center: Course Assignments')) {
      const helpCenterLink = screen.getByText('Help Center: Course Assignments');
      await user.click(helpCenterLink);
      expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(2);
      // Click chip to close modal
      await user.click(statusChip);
      expect(sendEnterpriseTrackEvent).toHaveBeenCalled();
    } else {
      await waitFor(() => {
        user.click(statusChip);
        expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(2);
      });
    }
  });

  it.each([
    { displayName: null },
    { displayName: 'Test Budget Display Name' },
  ])('renders with catalog tab active on initial load for assignable budgets with %s display name', ({ displayName }) => {
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'catalog',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: { ...mockAssignableSubsidyAccessPolicy, displayName },
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useBudgetDetailActivityOverview.mockReturnValueOnce({
      isLoading: false,
      data: mockEmptyStateBudgetDetailActivityOverview,
    });
    renderWithRouter(<BudgetDetailPageWrapper />);
    const expectedDisplayName = displayName ? `${displayName} catalog` : 'Overview';
    // Catalog tab exists and is active
    expect(screen.getByText('Catalog')).toBeInTheDocument();
    expect(screen.getByText('Catalog').getAttribute('aria-selected')).toBe('true');
    expect(screen.getByText(expectedDisplayName, { selector: 'h3' }));
  });

  it('hides catalog tab when budget is not assignable', () => {
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockPerLearnerSpendLimitSubsidyAccessPolicy,
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: {
        contentAssignments: undefined,
        spentTransactions: { count: 0 },
      },
    });
    useBudgetRedemptions.mockReturnValue({
      isLoading: false,
      budgetRedemptions: mockEmptyBudgetRedemptions,
      fetchBudgetRedemptions: jest.fn(),
    });
    useEnterpriseRemovedGroupMembers.mockReturnValue({
      isRemovedMembersLoading: false,
      removedGroupMembersCount: 0,
    });
    renderWithRouter(<BudgetDetailPageWrapper />);

    // Catalog tab does NOT exist
    expect(screen.queryByText('Catalog')).toBeFalsy();

    // Ensure no assignments-related empty states are rendered
    expect(screen.queryByText('No budget activity yet? Assign a course!')).not.toBeInTheDocument();
  });

  it('hides catalog tab when enterpriseFeatures.topDownAssignmentRealTimeLcm is disabled', () => {
    const initialState = {
      portalConfiguration: {
        ...initialStoreState.portalConfiguration,
        enterpriseFeatures: {
          topDownAssignmentRealTimeLcm: false,
        },
      },
    };
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockAssignableSubsidyAccessPolicy,
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: {
        contentAssignments: undefined,
        spentTransactions: { count: 0 },
      },
    });
    useBudgetRedemptions.mockReturnValue({
      isLoading: false,
      budgetRedemptions: mockEmptyBudgetRedemptions,
      fetchBudgetRedemptions: jest.fn(),
    });
    useEnterpriseGroup.mockReturnValue({
      data: {
        appliesToAllContexts: true,
      },
    });
    renderWithRouter(<BudgetDetailPageWrapper initialState={initialState} />);

    // Catalog tab does NOT exist
    expect(screen.queryByText('Catalog')).toBeFalsy();

    // Ensure no assignments-related empty states are rendered
    expect(screen.queryByText('No budget activity yet? Assign a course!')).not.toBeInTheDocument();
  });

  it('defaults to activity tab is no activeTabKey is provided', () => {
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: undefined,
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockAssignableSubsidyAccessPolicy,
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: {
        contentAssignments: undefined,
        spentTransactions: { count: 0 },
      },
    });
    renderWithRouter(<BudgetDetailPageWrapper />);

    // Activity tab exists and is active
    expect(screen.getByText('Activity').getAttribute('aria-selected')).toBe('true');
  });

  it('displays not found message is invalid activeTabKey is provided', () => {
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'invalid',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockAssignableSubsidyAccessPolicy,
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: mockEmptyStateBudgetDetailActivityOverview,
    });
    renderWithRouter(<BudgetDetailPageWrapper />);
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('something went wrong', { exact: false })).toBeInTheDocument();
  });

  it('handles user switching to catalog tab', async () => {
    const user = userEvent.setup();
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockAssignableSubsidyAccessPolicy,
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: mockEmptyStateBudgetDetailActivityOverview,
    });
    renderWithRouter(<BudgetDetailPageWrapper />);
    const catalogTab = screen.getByText('Catalog');

    await act(async () => {
      await user.click(catalogTab);
    });

    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.getByTestId('budget-detail-catalog-tab-contents')).toBeInTheDocument();
    });
  });

  it('displays loading message while loading subsidy access policy metadata from API', () => {
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: true,
      data: undefined,
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: mockEmptyStateBudgetDetailActivityOverview,
    });
    renderWithRouter(
      <BudgetDetailPageWrapper
        enterpriseUUID={enterpriseUUID}
        enterpriseSlug={enterpriseSlug}
        enterpriseSubsidiesContextValue={{
          ...defaultEnterpriseSubsidiesContextValue,
          isLoading: true,
        }}
      />,
    );

    expect(screen.getByText('loading budget details')).toBeInTheDocument();
  });

  it.each([
    { isActivityOverviewLoading: true },
    { isActivityOverviewLoading: false },
  ])('displays loading skeletons while fetching budget detail activity overview data from API endpoints (%s)', ({ isActivityOverviewLoading }) => {
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockAssignableSubsidyAccessPolicy,
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: isActivityOverviewLoading,
      data: undefined,
    });
    renderWithRouter(<BudgetDetailPageWrapper />);

    expect(screen.getByText('loading budget activity overview')).toBeInTheDocument();
  });

  it.each([
    {
      learnerState: 'waiting',
      shouldDisplayRemindAction: true,
    },
    {
      learnerState: 'notifying',
      shouldDisplayRemindAction: false,
    },
  ])('displays remind and cancel row and bulk actions when appropriate (%s)', async ({ learnerState, shouldDisplayRemindAction }) => {
    const user = userEvent.setup();
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useBudgetRedemptions.mockReturnValue({
      isLoading: false,
      budgetRedemptions: mockEmptyBudgetRedemptions,
      fetchBudgetRedemptions: jest.fn(),
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockAssignableSubsidyAccessPolicy,
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: {
        contentAssignments: { count: 1 },
        spentTransactions: { count: 0 },
      },
    });
    useBudgetContentAssignments.mockReturnValue({
      isLoading: false,
      contentAssignments: {
        count: 1,
        results: [
          {
            ...mockLearnerContentAssignment,
            learnerState,
          },
        ],
        learnerStateCounts: [{ learnerState, count: 1 }],
        numPages: 1,
        currentPage: 1,
      },
      fetchContentAssignments: jest.fn(),
    });
    renderWithRouter(<BudgetDetailPageWrapper />);
    const cancelRowAction = screen.getByTestId('cancel-assignment-test-uuid');
    expect(cancelRowAction).toBeInTheDocument();
    if (shouldDisplayRemindAction) {
      const remindRowAction = screen.getByTestId('remind-assignment-test-uuid');
      expect(remindRowAction).toBeInTheDocument();
    }
    // 2 checkboxes exist; the first is the "Select all" checkbox; the 2nd is the checkbox for the first row
    const checkBox = screen.getAllByRole('checkbox')[1];
    expect(checkBox).toBeInTheDocument();
    await user.click(checkBox);
    expect(await screen.findByText('Cancel (1)')).toBeInTheDocument();
    if (shouldDisplayRemindAction) {
      expect(await screen.findByText('Remind (1)')).toBeInTheDocument();
    } else {
      const remindButton = await screen.findByText('Remind (0)');
      expect(remindButton).toBeInTheDocument();
      expect(remindButton).toBeDisabled();
    }
  });

  it('cancels assignments in bulk', async () => {
    const user = userEvent.setup();
    EnterpriseAccessApiService.cancelAllContentAssignments.mockResolvedValueOnce({ status: 200 });
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useBudgetRedemptions.mockReturnValue({
      isLoading: false,
      budgetRedemptions: mockEmptyBudgetRedemptions,
      fetchBudgetRedemptions: jest.fn(),
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockAssignableSubsidyAccessPolicy,
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: {
        contentAssignments: { count: 1 },
        spentTransactions: { count: 0 },
      },
    });
    useBudgetContentAssignments.mockReturnValue({
      isLoading: false,
      contentAssignments: {
        count: 2,
        results: [
          {
            uuid: 'test-uuid1',
            contentKey: mockCourseKey,
            contentQuantity: -19900,
            learnerState: 'waiting',
            recentAction: { actionType: 'assigned', timestamp: '2023-10-27' },
            actions: [mockSuccessfulNotifiedAction],
            errorReason: null,
            state: 'allocated',
            earliestPossibleExpiration: { date: dayjs().add(5, 'days').toISOString() },
          },
          {
            uuid: 'test-uuid2',
            contentKey: mockCourseKey,
            contentQuantity: -29900,
            learnerState: 'waiting',
            recentAction: { actionType: 'assigned', timestamp: '2023-11-27' },
            actions: [mockSuccessfulNotifiedAction],
            errorReason: null,
            state: 'allocated',
            earliestPossibleExpiration: { date: dayjs().add(5, 'days').toISOString() },
          },
        ],
        learnerStateCounts: [
          { learnerState: 'waiting', count: 1 },
          { learnerState: 'waiting', count: 1 },
        ],
        numPages: 1,
        currentPage: 1,
      },
      fetchContentAssignments: jest.fn(),
    });
    renderWithRouter(<BudgetDetailPageWrapper />);
    const cancelRowAction = screen.getByTitle('Toggle All Current Page Rows Selected');
    expect(cancelRowAction).toBeInTheDocument();
    await user.click(cancelRowAction);
    const cancelBulkActionButton = screen.getByText('Cancel (2)');
    expect(cancelBulkActionButton).toBeInTheDocument();
    await user.click(cancelBulkActionButton);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
    const modalDialog = screen.getByRole('dialog');
    expect(modalDialog).toBeInTheDocument();
    const cancelDialogButton = getButtonElement('Cancel assignments (2)');
    await user.click(cancelDialogButton);
    await waitFor(
      () => expect(
        EnterpriseAccessApiService.cancelAllContentAssignments,
      ).toHaveBeenCalled(),
    );
    await waitFor(
      () => expect(screen.getByText('Assignments canceled (2)')).toBeInTheDocument(),
    );
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(2);
  });

  it('reminds assignments in bulk', async () => {
    const user = userEvent.setup();
    EnterpriseAccessApiService.remindAllContentAssignments.mockResolvedValueOnce({ status: 202 });
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useBudgetRedemptions.mockReturnValue({
      isLoading: false,
      budgetRedemptions: mockEmptyBudgetRedemptions,
      fetchBudgetRedemptions: jest.fn(),
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockAssignableSubsidyAccessPolicy,
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: {
        contentAssignments: { count: 1 },
        spentTransactions: { count: 0 },
      },
    });
    useBudgetContentAssignments.mockReturnValue({
      isLoading: false,
      contentAssignments: {
        count: 3,
        results: [
          {
            uuid: 'test-uuid1',
            contentKey: mockCourseKey,
            contentQuantity: -19900,
            learnerState: 'waiting',
            recentAction: { actionType: 'assigned', timestamp: '2023-10-27' },
            actions: [mockSuccessfulNotifiedAction],
            errorReason: null,
            state: 'allocated',
            earliestPossibleExpiration: { date: dayjs().add(5, 'days').toISOString() },
          },
          {
            uuid: 'test-uuid2',
            contentKey: mockCourseKey,
            contentQuantity: -29900,
            learnerState: 'waiting',
            recentAction: { actionType: 'assigned', timestamp: '2023-11-27' },
            actions: [mockSuccessfulNotifiedAction],
            errorReason: null,
            state: 'allocated',
            earliestPossibleExpiration: { date: dayjs().add(5, 'days').toISOString() },
          },
          {
            uuid: 'test-uuid3',
            contentKey: mockCourseKey,
            contentQuantity: -29900,
            learnerState: 'notifying',
            recentAction: { actionType: 'assigned', timestamp: '2023-11-27' },
            actions: [mockSuccessfulNotifiedAction],
            errorReason: null,
            state: 'allocated',
            earliestPossibleExpiration: { date: dayjs().add(5, 'days').toISOString() },
          },
        ],
        learnerStateCounts: [
          { learnerState: 'waiting', count: 2 },
          { learnerState: 'notifying', count: 1 },
        ],
        numPages: 1,
        currentPage: 1,
      },
      fetchContentAssignments: jest.fn(),
    });
    renderWithRouter(<BudgetDetailPageWrapper />);
    const remindRowAction = screen.getByTitle('Toggle All Current Page Rows Selected');
    expect(remindRowAction).toBeInTheDocument();
    await user.click(remindRowAction);
    const remindBulkActionButton = screen.getByText('Remind (2)');
    expect(remindBulkActionButton).toBeInTheDocument();
    await user.click(remindBulkActionButton);
    await waitFor(() => expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1));
    const modalDialog = screen.getByRole('dialog');
    expect(modalDialog).toBeInTheDocument();
    const remindDialogButton = getButtonElement('Send reminders (2)');
    await user.click(remindDialogButton);
    await waitFor(() => expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(2));
    await waitFor(
      () => expect(
        EnterpriseAccessApiService.remindAllContentAssignments,
      ).toHaveBeenCalled(),
    );
    await waitFor(
      () => expect(screen.getByText('Reminders sent (2)')).toBeInTheDocument(),
    );
  });

  it('cancels a single assignment', async () => {
    const user = userEvent.setup();
    EnterpriseAccessApiService.cancelContentAssignments.mockResolvedValueOnce({ status: 200 });
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useBudgetRedemptions.mockReturnValue({
      isLoading: false,
      budgetRedemptions: mockEmptyBudgetRedemptions,
      fetchBudgetRedemptions: jest.fn(),
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockAssignableSubsidyAccessPolicy,
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: {
        contentAssignments: { count: 1 },
        spentTransactions: { count: 0 },
      },
    });
    useBudgetContentAssignments.mockReturnValue({
      isLoading: false,
      contentAssignments: {
        count: 1,
        results: [
          {
            uuid: 'test-uuid',
            contentKey: mockCourseKey,
            contentQuantity: -19900,
            learnerState: 'waiting',
            recentAction: { actionType: 'assigned', timestamp: '2023-10-27' },
            actions: [mockSuccessfulNotifiedAction],
            errorReason: null,
            state: 'allocated',
            earliestPossibleExpiration: { date: dayjs().add(5, 'days').toISOString() },
          },
        ],
        learnerStateCounts: [{ learnerState: 'waiting', count: 1 }],
        numPages: 1,
        currentPage: 1,
      },
      fetchContentAssignments: jest.fn(),
    });
    renderWithRouter(<BudgetDetailPageWrapper />);
    const cancelIconButton = screen.getByTestId('cancel-assignment-test-uuid');
    expect(cancelIconButton).toBeInTheDocument();
    await user.click(cancelIconButton);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
    const modalDialog = screen.getByRole('dialog');
    expect(modalDialog).toBeInTheDocument();
    const cancelDialogButton = getButtonElement('Cancel assignment');
    await user.click(cancelDialogButton);
    await waitFor(
      () => expect(screen.getByText('Assignment canceled')).toBeInTheDocument(),
    );
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(2);
  });

  it('reminds a single assignment', async () => {
    const user = userEvent.setup();
    EnterpriseAccessApiService.remindContentAssignments.mockResolvedValueOnce({ status: 200 });
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useBudgetRedemptions.mockReturnValue({
      isLoading: false,
      budgetRedemptions: mockEmptyBudgetRedemptions,
      fetchBudgetRedemptions: jest.fn(),
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockAssignableSubsidyAccessPolicy,
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: {
        contentAssignments: { count: 1 },
        spentTransactions: { count: 0 },
      },
    });
    useBudgetContentAssignments.mockReturnValue({
      isLoading: false,
      contentAssignments: {
        count: 1,
        results: [
          {
            uuid: 'test-uuid',
            contentKey: mockCourseKey,
            contentQuantity: -19900,
            learnerState: 'waiting',
            recentAction: { actionType: 'assigned', timestamp: '2023-10-27' },
            actions: [mockSuccessfulNotifiedAction],
            errorReason: null,
            state: 'allocated',
            earliestPossibleExpiration: { date: dayjs().add(5, 'days').toISOString() },
          },
        ],
        learnerStateCounts: [{ learnerState: 'waiting', count: 1 }],
        numPages: 1,
        currentPage: 1,
      },
      fetchContentAssignments: jest.fn(),
    });
    renderWithRouter(<BudgetDetailPageWrapper />);
    const remindIconButton = screen.getByTestId('remind-assignment-test-uuid');
    expect(remindIconButton).toBeInTheDocument();
    await user.click(remindIconButton);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
    const modalDialog = screen.getByRole('dialog');
    expect(modalDialog).toBeInTheDocument();
    const remindDialogButton = getButtonElement('Send reminder');
    await user.click(remindDialogButton);
    await waitFor(
      () => expect(screen.getByText('Reminder sent')).toBeInTheDocument(),
    );
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(2);
  });

  it('displays the custom integrated channel budget card', () => {
    const initialState = {
      portalConfiguration: {
        ...initialStoreState.portalConfiguration,
        enterpriseFeatures: {
        },
      },
    };
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: true,
      data: undefined,
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: mockEmptyStateBudgetDetailActivityOverview,
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockAssignableSubsidyAccessPolicy,
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: mockEmptyStateBudgetDetailActivityOverview,
    });
    useBudgetRedemptions.mockReturnValue({
      isLoading: false,
      budgetRedemptions: mockEmptyBudgetRedemptions,
      fetchBudgetRedemptions: jest.fn(),
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 1,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: {
          enterpriseGroupMembershipUuid: 'cde2e374-032f-4c08-8c0d-bf3205fa7c7e',
          learnerId: 4382,
          memberDetails: { userEmail: 'foobar@test.com', userName: 'ayy lmao' },
        },
      },
    });
    useEnterpriseRemovedGroupMembers.mockReturnValue({
      isRemovedMembersLoading: false,
      removedGroupMembersCount: 0,
    });
    renderWithRouter(
      <BudgetDetailPageWrapper
        initialState={initialState}
      />,
    );
    expect(screen.getByText('• Enroll via Integrated Learning Platform')).toBeInTheDocument();
    expect(screen.getByText('Manage edX in your integrated learning platform')).toBeInTheDocument();
  });
  it.each([
    {
      modifiedDayOffset: 5,
    },
    {
      modifiedDayOffset: 15,
    },
  ])('displays upcoming expiring allocation (%s)', async ({ modifiedDayOffset }) => {
    const user = userEvent.setup();
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useBudgetRedemptions.mockReturnValue({
      isLoading: false,
      budgetRedemptions: mockEmptyBudgetRedemptions,
      fetchBudgetRedemptions: jest.fn(),
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockAssignableSubsidyAccessPolicy,
    });
    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: {
        contentAssignments: { count: 1 },
        spentTransactions: { count: 0 },
      },
    });
    useBudgetContentAssignments.mockReturnValue({
      isLoading: false,
      contentAssignments: {
        count: 3,
        results: [
          {
            uuid: 'test-uuid1',
            contentKey: mockCourseKey,
            contentQuantity: -19900,
            learnerState: 'waiting',
            recentAction: { actionType: 'assigned', timestamp: '2023-10-27' },
            actions: [mockSuccessfulNotifiedAction],
            errorReason: null,
            state: 'allocated',
            earliestPossibleExpiration: { date: dayjs().add(modifiedDayOffset, 'days').toISOString() },
          },
          {
            uuid: 'test-uuid2',
            contentKey: mockCourseKey,
            contentQuantity: -29900,
            learnerState: 'waiting',
            recentAction: { actionType: 'assigned', timestamp: '2023-11-27' },
            actions: [mockSuccessfulNotifiedAction],
            errorReason: null,
            state: 'allocated',
            earliestPossibleExpiration: { date: dayjs().add(12, 'days').toISOString() },
          },
          {
            uuid: 'test-uuid3',
            contentKey: mockCourseKey,
            contentQuantity: -29900,
            learnerState: 'notifying',
            recentAction: { actionType: 'assigned', timestamp: '2023-11-27' },
            actions: [mockSuccessfulNotifiedAction],
            errorReason: null,
            state: 'allocated',
            earliestPossibleExpiration: { date: dayjs().add(15, 'days').toISOString() },
          },
        ],
        learnerStateCounts: [
          { learnerState: 'waiting', count: 3 },
        ],
        numPages: 1,
        currentPage: 1,
      },
      fetchContentAssignments: jest.fn(),
    });
    renderWithRouter(<BudgetDetailPageWrapper />);
    const enrollByDateTooltip = screen.getByTestId('enroll-by-date-tooltip');
    const expiringAllocationTooltip = screen.queryByTestId('upcoming-allocation-expiration-tooltip');

    expect(screen.getByText('Enroll-by date')).toBeTruthy();

    if (expiringAllocationTooltip) {
      await user.hover(expiringAllocationTooltip);
      await waitFor(() => expect(screen.getByText('Enrollment deadline approaching')).toBeTruthy());
    }

    await user.hover(enrollByDateTooltip);
    await waitFor(() => expect(screen.getByText(
      'Failure to enroll by the enrollment deadline will release funds back into the budget',
    )).toBeTruthy());
  });

  it('renders Browse & Request budget type when bnrEnabled is true', () => {
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      budgetId: 'a52e6548-649f-4576-b73f-c5c2bee25e9c',
      activeTabKey: 'activity',
    });

    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: {
        ...mockAssignableSubsidyAccessPolicy,
        bnrEnabled: true,
        isAssignable: false,
      },
    });

    useEnterpriseCustomer.mockReturnValue({
      data: {
        uuid: 'test-customer-uuid',
        activeIntegrations: [],
      },
    });

    useEnterpriseGroup.mockReturnValue({
      data: {
        appliesToAllContexts: true,
        enterpriseCustomer: 'test-customer-uuid',
        name: 'test-name',
        uuid: 'test-uuid',
      },
    });

    useEnterpriseGroupLearners.mockReturnValue({
      data: {
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });

    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: mockEmptyStateBudgetDetailActivityOverview,
    });

    useBudgetRedemptions.mockReturnValue({
      isLoading: false,
      budgetRedemptions: mockEmptyBudgetRedemptions,
      fetchBudgetRedemptions: jest.fn(),
    });

    renderWithRouter(<BudgetDetailPageWrapper />);

    expect(screen.getByText('Browse & Request', { exact: false })).toBeInTheDocument();
  });

  describe('when there are no assignments but there is spend', () => {
    test.each([
      [
        'retired',
        {
          ...mockAssignableSubsidyAccessPolicy,
          retired: true,
        },
      ],
      [
        'expired',
        {
          ...mockAssignableSubsidyAccessPolicy,
          subsidyExpirationDatetime: dayjs().subtract(1, 'day').toISOString(),
        },
      ],
    ])('should NOT show assign more courses empty state for a %s budget', async (status, budgetData) => {
      useParams.mockReturnValue({ budgetId: mockSubsidyAccessPolicyUUID, enterpriseSlug, enterpriseAppPage: 'learner-credit' });
      useSubsidyAccessPolicy.mockReturnValue({
        isLoading: false,
        data: budgetData,
      });
      useBudgetDetailActivityOverview.mockReturnValue({
        isLoading: false,
        data: mockBudgetDetailActivityOverviewWithSpend,
      });
      useBudgetContentAssignments.mockReturnValue({
        isLoading: false,
        contentAssignments: { results: [], learnerStateCounts: [] },
      });
      useBudgetRedemptions.mockReturnValue({
        isLoading: false,
        budgetRedemptions: mockEmptyBudgetRedemptions,
        fetchBudgetRedemptions: jest.fn(),
      });

      renderWithRouter(<BudgetDetailPageWrapper />);
      await waitFor(() => {
        expect(screen.queryByText('Assign more courses')).not.toBeInTheDocument();
      });
    });

    it('should show assign more courses empty state for an active budget', async () => {
      useParams.mockReturnValue({ budgetId: mockSubsidyAccessPolicyUUID, enterpriseSlug, enterpriseAppPage: 'learner-credit' });
      useSubsidyAccessPolicy.mockReturnValue({
        isLoading: false,
        data: {
          ...mockAssignableSubsidyAccessPolicy,
          retired: false,
          subsidyExpirationDatetime: dayjs().add(1, 'year').toISOString(),
        },
      });
      useBudgetDetailActivityOverview.mockReturnValue({
        isLoading: false,
        data: mockBudgetDetailActivityOverviewWithSpend,
      });
      useBudgetContentAssignments.mockReturnValue({
        isLoading: false,
        contentAssignments: { results: [], learnerStateCounts: [] },
      });
      useBudgetRedemptions.mockReturnValue({
        isLoading: false,
        budgetRedemptions: mockEmptyBudgetRedemptions,
        fetchBudgetRedemptions: jest.fn(),
      });

      renderWithRouter(<BudgetDetailPageWrapper />);
      await waitFor(() => {
        expect(screen.getByText('Assign more courses to maximize your budget.')).toBeInTheDocument();
        expect(screen.getByText('available balance of $10,000', { exact: false })).toBeInTheDocument();
        expect(screen.getByText('Assign courses', { selector: 'a' })).toBeInTheDocument();
      });
    });
  });

  describe('tab redirection for expired and retired budgets', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    const testCases = [
      {
        status: 'expired',
        mockPolicyData: {
          ...mockAssignableSubsidyAccessPolicy,
          endDate: dayjs().subtract(1, 'day').format(),
          isRetired: false,
          isRetiredOrExpired: true,
        },
      },
      {
        status: 'retired',
        mockPolicyData: {
          ...mockAssignableSubsidyAccessPolicy,
          isRetired: true,
          isRetiredOrExpired: true,
        },
      },
    ];

    it.each(testCases)('should redirect from catalog to activity tab for $status budgets', async ({ mockPolicyData }) => {
      useParams.mockReturnValue({
        enterpriseSlug,
        enterpriseAppPage: 'learner-credit',
        budgetId: mockSubsidyAccessPolicyUUID,
        activeTabKey: BUDGET_DETAIL_CATALOG_TAB,
      });

      useSubsidyAccessPolicy.mockReturnValue({
        isLoading: false,
        isError: false,
        data: mockPolicyData,
      });

      renderWithRouter(<BudgetDetailPageWrapper />);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          `/${enterpriseSlug}/admin/learner-credit/${mockSubsidyAccessPolicyUUID}/${BUDGET_DETAIL_ACTIVITY_TAB}`,
        );
      });
    });
  });
});
