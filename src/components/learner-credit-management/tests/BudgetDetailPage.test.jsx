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
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import { act } from 'react-dom/test-utils';
import EnterpriseAccessApiService from '../../../data/services/EnterpriseAccessApiService';

import BudgetDetailPage from '../BudgetDetailPage';
import {
  useSubsidyAccessPolicy,
  useOfferRedemptions,
  useBudgetContentAssignments,
  useBudgetDetailActivityOverview,
  useIsLargeOrGreater,
  formatDate,
  DEFAULT_PAGE,
  PAGE_SIZE,
  formatPrice,
} from '../data';
import { EnterpriseSubsidiesContext } from '../../EnterpriseSubsidiesContext';
import {
  mockAssignableSubsidyAccessPolicy,
  mockPerLearnerSpendLimitSubsidyAccessPolicy,
  mockSubsidyAccessPolicyUUID,
  mockEnterpriseOfferId,
} from '../data/tests/constants';
import { getButtonElement, queryClient } from '../../test/testUtils';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

jest.mock('../data', () => ({
  ...jest.requireActual('../data'),
  useOfferRedemptions: jest.fn(),
  useBudgetContentAssignments: jest.fn(),
  useSubsidyAccessPolicy: jest.fn(),
  useBudgetDetailActivityOverview: jest.fn(),
  useIsLargeOrGreater: jest.fn().mockReturnValue(true),
  useCancelContentAssignments: jest.fn(),
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
const mockEmptyOfferRedemptions = {
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
};
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
  });

  it('renders page not found messaging if budget is a subsidy access policy, but the REST API returns a 404', () => {
    useParams.mockReturnValue({
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
      budgetId: 'a52e6548-649f-4576-b73f-c5c2bee25e9c',
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: { ...mockAssignableSubsidyAccessPolicy, displayName },
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
    { isLargeViewport: true },
    { isLargeViewport: false },
  ])('displays budget activity overview empty state', ({ isLargeViewport }) => {
    useIsLargeOrGreater.mockReturnValue(isLargeViewport);
    useParams.mockReturnValue({
      budgetId: 'a52e6548-649f-4576-b73f-c5c2bee25e9c',
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockAssignableSubsidyAccessPolicy,
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
  });

  it.each([
    {
      budgetId: mockEnterpriseOfferId,
      expectedUseOfferRedemptionsArgs: [enterpriseUUID, mockEnterpriseOfferId, null, true],
    },
    {
      budgetId: mockSubsidyAccessPolicyUUID,
      expectedUseOfferRedemptionsArgs: [enterpriseUUID, null, mockSubsidyAccessPolicyUUID, true],
    },
  ])('displays spend table in "Activity" tab with empty results (%s)', async ({
    budgetId,
    expectedUseOfferRedemptionsArgs,
  }) => {
    useParams.mockReturnValue({
      budgetId,
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: undefined,
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
    useOfferRedemptions.mockReturnValue({
      isLoading: false,
      offerRedemptions: mockEmptyOfferRedemptions,
      fetchOfferRedemptions: jest.fn(),
    });
    renderWithRouter(<BudgetDetailPageWrapper />);

    expect(useOfferRedemptions).toHaveBeenCalledTimes(1);
    expect(useOfferRedemptions).toHaveBeenCalledWith(...expectedUseOfferRedemptionsArgs);

    // Activity tab exists and is active
    expect(screen.getByText('Activity').getAttribute('aria-selected')).toBe('true');
    // Catalog tab does NOT exist since the budget is not assignable
    expect(screen.queryByText('Catalog')).not.toBeInTheDocument();

    // Spent table is visible within Activity tab contents
    const spentSection = within(screen.getByText('Spent').closest('section'));
    expect(spentSection.getByText('No results found')).toBeInTheDocument();
  });

  it('renders with assigned table empty state with spent table and catalog tab available for assignable budgets', async () => {
    useParams.mockReturnValue({
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockAssignableSubsidyAccessPolicy,
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
    useOfferRedemptions.mockReturnValue({
      isLoading: false,
      offerRedemptions: {
        itemCount: 2,
        pageCount: 1,
        results: [mockEnrollmentTransaction, mockEnrollmentTransactionWithReversal],
      },
      fetchOfferRedemptions: jest.fn(),
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
  });

  it('renders with assigned table data and handles table refresh', () => {
    useParams.mockReturnValue({
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockAssignableSubsidyAccessPolicy,
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
    useOfferRedemptions.mockReturnValue({
      isLoading: false,
      offerRedemptions: mockEmptyOfferRedemptions,
      fetchOfferRedemptions: jest.fn(),
    });
    renderWithRouter(<BudgetDetailPageWrapper />);

    // Assigned table is visible within Activity tab contents
    const assignedSection = within(screen.getByText('Assigned').closest('section'));
    expect(assignedSection.queryByText('No results found')).not.toBeInTheDocument();
    expect(assignedSection.getByText(mockLearnerEmail)).toBeInTheDocument();
    const viewCourseCTA = assignedSection.getByText(mockContentTitle, { selector: 'a' });
    expect(viewCourseCTA).toBeInTheDocument();
    expect(viewCourseCTA.getAttribute('href')).toEqual(`${process.env.ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}/course/${mockCourseKey}`);
    expect(assignedSection.getByText('-$199')).toBeInTheDocument();
    expect(assignedSection.getByText('Waiting for learner')).toBeInTheDocument();
    expect(assignedSection.getByText(`Assigned: ${formatDate('2023-10-27')}`)).toBeInTheDocument();

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
    expect(mockFetchContentAssignments).toHaveBeenCalledTimes(2); // should be called again on refresh
    expect(mockFetchContentAssignments).toHaveBeenLastCalledWith(expect.objectContaining(expectedTableFetchDataArgs));
  });

  it.each([
    { sortByColumnHeader: 'Amount', expectedSortBy: [{ id: 'amount', desc: false }] },
  ])('renders sortable assigned table data', async ({ sortByColumnHeader, expectedSortBy }) => {
    useParams.mockReturnValue({
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockAssignableSubsidyAccessPolicy,
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
    useOfferRedemptions.mockReturnValue({
      isLoading: false,
      offerRedemptions: mockEmptyOfferRedemptions,
      fetchOfferRedemptions: jest.fn(),
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
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockAssignableSubsidyAccessPolicy,
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
    useOfferRedemptions.mockReturnValue({
      isLoading: false,
      offerRedemptions: mockEmptyOfferRedemptions,
      fetchOfferRedemptions: jest.fn(),
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
      const filtersDropdown = screen.getByRole('group', { name: 'Status' });
      const filtersDropdownContainer = within(filtersDropdown);
      if (value.includes('waiting')) {
        const waitingForLearnerOption = filtersDropdownContainer.getByLabelText('Waiting for learner 1', { exact: false });
        expect(waitingForLearnerOption).toBeInTheDocument();
        userEvent.click(waitingForLearnerOption);

        await waitFor(() => {
          expect(waitingForLearnerOption).toBeChecked();
          expect(mockFetchContentAssignments).toHaveBeenCalledWith(
            expect.objectContaining(expectedTableFetchDataArgsAfterFilter),
          );
        });
      }
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
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockAssignableSubsidyAccessPolicy,
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
    useOfferRedemptions.mockReturnValue({
      isLoading: false,
      offerRedemptions: mockEmptyOfferRedemptions,
      fetchOfferRedemptions: jest.fn(),
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
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockAssignableSubsidyAccessPolicy,
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
    useOfferRedemptions.mockReturnValue({
      isLoading: false,
      offerRedemptions: mockEmptyOfferRedemptions,
      fetchOfferRedemptions: jest.fn(),
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
      errorReason: 'email_error',
    },
    {
      learnerState: 'failed',
      hasLearnerEmail: false,
      expectedChipStatus: 'Failed: Bad email',
      expectedModalPopupHeading: 'Failed: Bad email',
      expectedModalPopupContent: 'This course assignment failed because a notification to the learner could not be sent.',
      actions: [mockSuccessfulLinkedLearnerAction, mockFailedNotifiedAction],
      errorReason: 'email_error',
    },
    {
      learnerState: 'failed',
      hasLearnerEmail: true,
      expectedChipStatus: 'Failed: System',
      expectedModalPopupHeading: 'Failed: System',
      expectedModalPopupContent: 'Something went wrong behind the scenes.',
      actions: [mockFailedLinkedLearnerAction],
      errorReason: 'internal_api_error',
    },
    {
      learnerState: 'failed',
      hasLearnerEmail: true,
      expectedChipStatus: 'Failed: Cancellation',
      expectedModalPopupHeading: 'Failed: Cancellation',
      expectedModalPopupContent: 'Something went wrong behind the scenes.',
      actions: [mockFailedCancelledLearnerAction],
      errorReason: 'email_error',
    },
    {
      learnerState: 'failed',
      hasLearnerEmail: true,
      expectedChipStatus: 'Failed: Cancellation',
      expectedModalPopupHeading: 'Failed: Cancellation',
      expectedModalPopupContent: 'Something went wrong behind the scenes.',
      actions: [mockFailedCancelledLearnerAction],
      errorReason: 'internal_api_error',
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
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockAssignableSubsidyAccessPolicy,
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
    useOfferRedemptions.mockReturnValue({
      isLoading: false,
      offerRedemptions: mockEmptyOfferRedemptions,
      fetchOfferRedemptions: jest.fn(),
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

    // Modal popup is visible with expected text
    const modalPopupContents = within(screen.getByTestId('assignment-status-modalpopup-contents'));
    expect(modalPopupContents.getByText(expectedModalPopupHeading)).toBeInTheDocument();
    expect(modalPopupContents.getByText(expectedModalPopupContent, { exact: false })).toBeInTheDocument();
  });

  it.each([
    { displayName: null },
    { displayName: 'Test Budget Display Name' },
  ])('renders with catalog tab active on initial load for assignable budgets with %s display name', ({ displayName }) => {
    useParams.mockReturnValue({
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'catalog',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: { ...mockAssignableSubsidyAccessPolicy, displayName },
    });
    useBudgetDetailActivityOverview.mockReturnValueOnce({
      isLoading: false,
      data: mockEmptyStateBudgetDetailActivityOverview,
    });
    renderWithRouter(<BudgetDetailPageWrapper />);
    const expectedDisplayName = displayName ? `${displayName} catalog` : 'Overview';
    // Catalog tab exists and is active
    expect(screen.getByText('Catalog').getAttribute('aria-selected')).toBe('true');
    expect(screen.getByText(expectedDisplayName, { selector: 'h3' }));
  });

  it('hides catalog tab when budget is not assignable', () => {
    useParams.mockReturnValue({
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockPerLearnerSpendLimitSubsidyAccessPolicy,
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: {
        contentAssignments: undefined,
        spentTransactions: { count: 0 },
      },
    });
    useOfferRedemptions.mockReturnValue({
      isLoading: false,
      offerRedemptions: mockEmptyOfferRedemptions,
      fetchOfferRedemptions: jest.fn(),
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
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockAssignableSubsidyAccessPolicy,
    });
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      data: {
        contentAssignments: undefined,
        spentTransactions: { count: 0 },
      },
    });
    useOfferRedemptions.mockReturnValue({
      isLoading: false,
      offerRedemptions: mockEmptyOfferRedemptions,
      fetchOfferRedemptions: jest.fn(),
    });
    renderWithRouter(<BudgetDetailPageWrapper initialState={initialState} />);

    // Catalog tab does NOT exist
    expect(screen.queryByText('Catalog')).toBeFalsy();

    // Ensure no assignments-related empty states are rendered
    expect(screen.queryByText('No budget activity yet? Assign a course!')).not.toBeInTheDocument();
  });

  it('defaults to activity tab is no activeTabKey is provided', () => {
    useParams.mockReturnValue({
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: undefined,
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockAssignableSubsidyAccessPolicy,
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
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'invalid',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockAssignableSubsidyAccessPolicy,
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
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockAssignableSubsidyAccessPolicy,
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

    await waitFor(() => {
      expect(screen.getByTestId('budget-detail-catalog-tab-contents')).toBeInTheDocument();
    });
  });

  it('displays loading message while loading subsidy access policy metadata from API', () => {
    useParams.mockReturnValue({
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
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockAssignableSubsidyAccessPolicy,
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
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useOfferRedemptions.mockReturnValue({
      isLoading: false,
      offerRedemptions: mockEmptyOfferRedemptions,
      fetchOfferRedemptions: jest.fn(),
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockAssignableSubsidyAccessPolicy,
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

    const checkBox = screen.getByTestId('datatable-select-column-checkbox-cell');
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
    EnterpriseAccessApiService.cancelContentAssignments.mockResolvedValueOnce({ status: 200 });
    useParams.mockReturnValue({
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useOfferRedemptions.mockReturnValue({
      isLoading: false,
      offerRedemptions: mockEmptyOfferRedemptions,
      fetchOfferRedemptions: jest.fn(),
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockAssignableSubsidyAccessPolicy,
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
    const cancelRowAction = screen.getByTestId('datatable-select-column-checkbox-header');
    expect(cancelRowAction).toBeInTheDocument();
    userEvent.click(cancelRowAction);
    const cancelBulkActionButton = screen.getByText('Cancel (2)');
    expect(cancelBulkActionButton).toBeInTheDocument();
    userEvent.click(cancelBulkActionButton);
    const modalDialog = screen.getByRole('dialog');
    expect(modalDialog).toBeInTheDocument();
    const cancelDialogButton = screen.getByRole('button', { name: 'Cancel assignments (2)' });
    userEvent.click(cancelDialogButton);
    expect(
      EnterpriseAccessApiService.cancelContentAssignments,
    ).toHaveBeenCalled();
    await waitFor(
      () => act(() => expect(screen.getByText('Assignments canceled (2)')).toBeInTheDocument()),
    );
  });

  it('cancels a single assignment', async () => {
    EnterpriseAccessApiService.cancelContentAssignments.mockResolvedValueOnce({ status: 200 });
    useParams.mockReturnValue({
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'activity',
    });
    useOfferRedemptions.mockReturnValue({
      isLoading: false,
      offerRedemptions: mockEmptyOfferRedemptions,
      fetchOfferRedemptions: jest.fn(),
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockAssignableSubsidyAccessPolicy,
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
    const modalDialog = screen.getByRole('dialog');
    expect(modalDialog).toBeInTheDocument();
    const cancelDialogButton = screen.getByRole('button', { name: 'Cancel assignment' });
    userEvent.click(cancelDialogButton);
    await waitFor(
      () => act(() => expect(screen.getByText('Assignment canceled')).toBeInTheDocument()),
    );
  });
});
