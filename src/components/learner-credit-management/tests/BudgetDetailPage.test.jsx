import React from 'react';
import { useParams } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { renderWithRouter, sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { act } from 'react-dom/test-utils';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import dayjs from 'dayjs';
import EnterpriseAccessApiService from '../../../data/services/EnterpriseAccessApiService';

import BudgetDetailPage from '../BudgetDetailPage';
import {
  formatDate,
  formatPrice,
  useBudgetContentAssignments,
  useBudgetDetailActivityOverview,
  useBudgetRedemptions,
  useEnterpriseCustomer,
  useEnterpriseGroup,
  useEnterpriseGroupLearners,
  useEnterpriseRemovedGroupMembers,
  useEnterpriseOffer,
  useIsLargeOrGreater,
  useSubsidyAccessPolicy,
  useSubsidySummaryAnalyticsApi,
  DEFAULT_PAGE,
  PAGE_SIZE,
} from '../data';
import { EnterpriseSubsidiesContext } from '../../EnterpriseSubsidiesContext';
import {
  mockAssignableSubsidyAccessPolicy,
  mockAssignableSubsidyAccessPolicyWithNoUtilization,
  mockAssignableSubsidyAccessPolicyWithSpendNoAllocations,
  mockAssignableSubsidyAccessPolicyWithSpendNoRedeemed,
  mockEnterpriseOfferId,
  mockEnterpriseOfferMetadata,
  mockPerLearnerSpendLimitSubsidyAccessPolicy,
  mockSpendLimitNoGroupsSubsidyAccessPolicy,
  mockSubsidyAccessPolicyUUID,
  mockSubsidySummary,
} from '../data/tests/constants';
import { getButtonElement, queryClient } from '../../test/testUtils';

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
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
}));

jest.mock('../../../data/services/EnterpriseAccessApiService');

const mockStore = configureMockStore([thunk]);
const getMockStore = store => mockStore(store);
const enterpriseSlug = 'test-enterprise';
const enterpriseUUID = '1234';
const initialStoreState = {
  portalConfiguration: {
    enterpriseId: enterpriseUUID,
    enterpriseSlug,
    enableLearnerPortal: true,
    enterpriseFeatures: {
      topDownAssignmentRealTimeLcm: true,
      enterpriseGroupsV1: true,
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
    jest.resetAllMocks();

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
        userEvent.click(screen.getByText('Utilization details'));

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
          enterpriseGroupsV1: false,
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
          enterpriseGroupsV1: true,
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
    userEvent.click(screen.getByText('Get started'));
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
    expect(screen.queryByText('No budget activity yet? Invite members to browse the catalog and enroll!')).toBeInTheDocument();

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
      budgetId: mockEnterpriseOfferId,
      isTopDownAssignmentEnabled: true,
      expectedUseOfferRedemptionsArgs: [enterpriseUUID, mockEnterpriseOfferId, null, true],
    },
    {
      budgetId: mockEnterpriseOfferId,
      isTopDownAssignmentEnabled: false,
      expectedUseOfferRedemptionsArgs: [enterpriseUUID, mockEnterpriseOfferId, null, false],
    },
    {
      budgetId: mockSubsidyAccessPolicyUUID,
      isTopDownAssignmentEnabled: true,
      expectedUseOfferRedemptionsArgs: [enterpriseUUID, null, mockSubsidyAccessPolicyUUID, true],
    },
    {
      budgetId: mockSubsidyAccessPolicyUUID,
      isTopDownAssignmentEnabled: false,
      expectedUseOfferRedemptionsArgs: [enterpriseUUID, null, mockSubsidyAccessPolicyUUID, false],
    },
  ])('displays spend table in "Activity" tab with empty results (%s) when enterpriseGroupsV1 feature is false', async ({
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
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: undefined,
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
          enterpriseGroupsV1: false,
        },
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

    userEvent.click(spentSection.queryAllByText(mockContentTitle, { selector: 'a' })[0]);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
  });

  it('renders with assigned table data and handles table refresh', () => {
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
    const selectAllCheckbox = assignedSection.queryAllByRole('checkbox')[0];
    userEvent.click(selectAllCheckbox);
    waitFor(() => {
      expect(getButtonElement(`Select all ${NUMBER_OF_ASSIGNMENTS_TO_GENERATE}`, { screenOverride: assignedSection })).toBeInTheDocument();
    });

    // Unselect the checkbox the "Refresh" table action appears
    userEvent.click(selectAllCheckbox);

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
    userEvent.click(refreshCTA);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
    expect(mockFetchContentAssignments).toHaveBeenCalledTimes(2); // should be called again on refresh
    expect(mockFetchContentAssignments).toHaveBeenLastCalledWith(expect.objectContaining(expectedTableFetchDataArgs));

    userEvent.click(viewCourseCTA);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(2);
  });

  it.each([
    { sortByColumnHeader: 'Amount', expectedSortBy: [{ id: 'amount', desc: false }] },
  ])('renders sortable assigned table data', async ({ sortByColumnHeader, expectedSortBy }) => {
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
    userEvent.click(amountColumnHeader);

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
      userEvent.click(filtersButton);
      waitFor(() => {
        const filtersDropdown = screen.getByRole('group', { name: 'Status' });
        const filtersDropdownContainer = within(filtersDropdown);
        if (value.includes('waiting')) {
          const waitingForLearnerOption = filtersDropdownContainer.getByLabelText('Waiting for learner 1', { exact: false });
          expect(waitingForLearnerOption).toBeInTheDocument();
          userEvent.click(waitingForLearnerOption);

          expect(waitingForLearnerOption).toBeChecked();
          expect(mockFetchContentAssignments).toHaveBeenCalledWith(
            expect.objectContaining(expectedTableFetchDataArgsAfterFilter),
          );
        }
      });
    }

    if (field === 'search') {
      const assignmentDetailsInputField = assignedSection.getByLabelText('Search by assignment details');
      userEvent.type(assignmentDetailsInputField, value);

      await waitFor(() => {
        expect(assignmentDetailsInputField).toHaveValue(value);
        expect(mockFetchContentAssignments).toHaveBeenCalledWith(
          expect.objectContaining(expectedTableFetchDataArgsAfterFilter),
        );
      });
    }
  });

  it.each([
    {
      columnHeader: 'Amount',
      columnId: 'amount',
    },
  ])('renders sortable assigned table data (%s)', async ({ columnHeader, columnId }) => {
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
    userEvent.click(orderedColumnHeader);
    expect(mockFetchContentAssignments).toHaveBeenCalledWith(
      expect.objectContaining(expectedTableFetchDataArgsAfterSortAsc),
    );
    userEvent.click(orderedColumnHeader);
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
  ])('renders correct status chips with assigned table data (%s)', ({
    learnerState,
    hasLearnerEmail,
    expectedChipStatus,
    expectedModalPopupHeading,
    expectedModalPopupContent,
    actions,
    errorReason,
  }) => {
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
    userEvent.click(statusChip);

    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);

    // Modal popup is visible with expected text
    const modalPopupContents = within(screen.getByTestId('assignment-status-modalpopup-contents'));
    expect(modalPopupContents.getByText(expectedModalPopupHeading)).toBeInTheDocument();
    expect(modalPopupContents.getByText(expectedModalPopupContent, { exact: false })).toBeInTheDocument();

    // Help Center link clicked and modal closed
    if (screen.queryByText('Help Center: Course Assignments')) {
      const helpCenterLink = screen.getByText('Help Center: Course Assignments');
      userEvent.click(helpCenterLink);
      expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(2);
      // Click chip to close modal
      userEvent.click(statusChip);
      expect(sendEnterpriseTrackEvent).toHaveBeenCalled();
    } else {
      userEvent.click(statusChip);
      waitFor(() => expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(2));
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
      userEvent.click(catalogTab);
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
    userEvent.click(checkBox);
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
    userEvent.click(cancelRowAction);
    const cancelBulkActionButton = screen.getByText('Cancel (2)');
    expect(cancelBulkActionButton).toBeInTheDocument();
    userEvent.click(cancelBulkActionButton);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
    const modalDialog = screen.getByRole('dialog');
    expect(modalDialog).toBeInTheDocument();
    const cancelDialogButton = getButtonElement('Cancel assignments (2)');
    userEvent.click(cancelDialogButton);
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
    userEvent.click(remindRowAction);
    const remindBulkActionButton = screen.getByText('Remind (2)');
    expect(remindBulkActionButton).toBeInTheDocument();
    userEvent.click(remindBulkActionButton);
    const modalDialog = screen.getByRole('dialog');
    expect(modalDialog).toBeInTheDocument();
    const remindDialogButton = getButtonElement('Send reminders (2)');
    userEvent.click(remindDialogButton);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
    await waitFor(
      () => expect(
        EnterpriseAccessApiService.remindAllContentAssignments,
      ).toHaveBeenCalled(),
    );
    await waitFor(
      () => expect(screen.getByText('Reminders sent (2)')).toBeInTheDocument(),
    );
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(2);
  });
  it('cancels a single assignment', async () => {
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
    userEvent.click(cancelIconButton);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
    const modalDialog = screen.getByRole('dialog');
    expect(modalDialog).toBeInTheDocument();
    const cancelDialogButton = getButtonElement('Cancel assignment');
    userEvent.click(cancelDialogButton);
    await waitFor(
      () => expect(screen.getByText('Assignment canceled')).toBeInTheDocument(),
    );
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(2);
  });
  it('reminds a single assignment', async () => {
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
    userEvent.click(remindIconButton);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
    const modalDialog = screen.getByRole('dialog');
    expect(modalDialog).toBeInTheDocument();
    const remindDialogButton = getButtonElement('Send reminder');
    userEvent.click(remindDialogButton);
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
          enterpriseGroupsV1: true,
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
      userEvent.hover(expiringAllocationTooltip);
      await waitFor(() => expect(screen.getByText('Enrollment deadline approaching')).toBeTruthy());
    }

    userEvent.hover(enrollByDateTooltip);
    await waitFor(() => expect(screen.getByText(
      'Failure to enroll by midnight of enrollment deadline date will release funds back into the budget',
    )).toBeTruthy());
  });
});
