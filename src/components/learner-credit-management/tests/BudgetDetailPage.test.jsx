import React from 'react';
import { useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import { act } from 'react-dom/test-utils';

import BudgetDetailPage from '../BudgetDetailPage';
import {
  useSubsidyAccessPolicy,
  useOfferRedemptions,
  useBudgetContentAssignments,
  useBudgetDetailActivityOverview,
  useIsLargeOrGreater,
  formatDate,
} from '../data';
import { EnterpriseSubsidiesContext } from '../../EnterpriseSubsidiesContext';
import {
  mockAssignableSubsidyAccessPolicy,
  mockPerLearnerSpendLimitSubsidyAccessPolicy,
  mockSubsidyAccessPolicyUUID,
  mockEnterpriseOfferId,
} from '../data/tests/constants';

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
}));

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

const mockFailedNotifiedAction = {
  ...mockSuccessfulNotifiedAction,
  completedAt: null,
  errorReason: 'bad_email',
};

const mockFailedLinkedLearnerAction = {
  ...mockFailedNotifiedAction,
  actionType: 'learner_linked',
  errorReason: 'internal_api_error',
};
const defaultEnterpriseSubsidiesContextValue = {
  isLoading: false,
};

const queryClient = new QueryClient();

const BudgetDetailPageWrapper = ({
  initialState = initialStoreState,
  enterpriseSubsidiesContextValue = defaultEnterpriseSubsidiesContextValue,
  ...rest
}) => {
  const store = getMockStore({ ...initialState });
  return (
    <QueryClientProvider client={queryClient}>
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
      expectedUseOfferRedemptionsArgs: [enterpriseUUID, mockEnterpriseOfferId, null],
    },
    {
      budgetId: mockSubsidyAccessPolicyUUID,
      expectedUseOfferRedemptionsArgs: [enterpriseUUID, null, mockSubsidyAccessPolicyUUID],
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
        contentAssignments: undefined,
        spentTransactions: { count: 1 },
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

  it('renders with assigned table empty state with spent table and catalog tab available for assignable budgets', () => {
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
        spentTransactions: { count: 1 },
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

    // Assigned table empty state is visible within Activity tab contents
    expect(screen.getByText('Assign more courses to maximize your budget.')).toBeInTheDocument();
    expect(screen.getByText('available balance of $10,000', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Assign courses', { selector: 'a' })).toBeInTheDocument();

    // Catalog tab exists and is NOT active
    expect(screen.getByText('Catalog').getAttribute('aria-selected')).toBe('false');
  });

  it('renders with assigned table data', () => {
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
            uuid: 'test-uuid',
            learnerEmail: mockLearnerEmail,
            contentKey: mockCourseKey,
            contentTitle: mockContentTitle,
            contentQuantity: -19900,
            learnerState: 'waiting',
            recentAction: { actionType: 'assigned', timestamp: '2023-10-27' },
            actions: [mockSuccessfulNotifiedAction],
          },
        ],
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
    const viewCourseCTA = assignedSection.getByText(mockContentTitle, { selector: 'a' });
    expect(viewCourseCTA).toBeInTheDocument();
    expect(viewCourseCTA.getAttribute('href')).toEqual(`${process.env.ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}/course/${mockCourseKey}`);
    expect(assignedSection.getByText('-$199')).toBeInTheDocument();
    expect(assignedSection.getByText('Waiting for learner')).toBeInTheDocument();
    expect(assignedSection.getByText(`Assigned: ${formatDate('2023-10-27')}`)).toBeInTheDocument();
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
        results: [
          {
            uuid: 'test-uuid',
            learnerEmail: mockLearnerEmail,
            contentKey: mockCourseKey,
            contentTitle: null,
            contentQuantity: -19900,
            learnerState: 'waiting',
            recentAction: { actionType: 'assigned', timestamp: '2023-10-27' },
            actions: [mockSuccessfulNotifiedAction],
          },
        ],
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
    },
    {
      learnerState: 'notifying',
      hasLearnerEmail: false,
      expectedChipStatus: 'Notifying learner',
      expectedModalPopupHeading: 'Notifying learner',
      expectedModalPopupContent: 'Our system is busy emailing the learner!',
      actions: [],
    },
    {
      learnerState: 'waiting',
      hasLearnerEmail: true,
      expectedChipStatus: 'Waiting for learner',
      expectedModalPopupHeading: `Waiting for ${mockLearnerEmail}`,
      expectedModalPopupContent: 'This learner must create an edX account and complete enrollment in the course',
      actions: [mockSuccessfulNotifiedAction],
    },
    {
      learnerState: 'waiting',
      hasLearnerEmail: false,
      expectedChipStatus: 'Waiting for learner',
      expectedModalPopupHeading: 'Waiting for learner',
      expectedModalPopupContent: 'This learner must create an edX account and complete enrollment in the course',
      actions: [mockSuccessfulNotifiedAction],
    },
    {
      learnerState: 'failed',
      hasLearnerEmail: true,
      expectedChipStatus: 'Failed: Bad email',
      expectedModalPopupHeading: 'Failed: Bad email',
      expectedModalPopupContent: `This course assignment failed because a notification to ${mockLearnerEmail} could not be sent.`,
      actions: [mockFailedNotifiedAction],
    },
    {
      learnerState: 'failed',
      hasLearnerEmail: false,
      expectedChipStatus: 'Failed: Bad email',
      expectedModalPopupHeading: 'Failed: Bad email',
      expectedModalPopupContent: 'This course assignment failed because a notification to the learner could not be sent.',
      actions: [mockFailedNotifiedAction],
    },
    {
      learnerState: 'failed',
      hasLearnerEmail: true,
      expectedChipStatus: 'Failed: System',
      expectedModalPopupHeading: 'Failed: System',
      expectedModalPopupContent: 'Something went wrong behind the scenes.',
      actions: [mockFailedLinkedLearnerAction],
    },
  ])('renders correct status chips with assigned table data (%s)', ({
    learnerState,
    hasLearnerEmail,
    expectedChipStatus,
    expectedModalPopupHeading,
    expectedModalPopupContent,
    actions,
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
            uuid: 'test-uuid',
            learnerEmail: hasLearnerEmail ? mockLearnerEmail : null,
            contentKey: mockCourseKey,
            contentQuantity: -19900,
            learnerState,
            recentAction: { actionType: 'assigned', timestamp: '2023-10-27' },
            actions,
          },
        ],
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

  it('renders with catalog tab active on initial load for assignable budgets', async () => {
    useParams.mockReturnValue({
      budgetId: mockSubsidyAccessPolicyUUID,
      activeTabKey: 'catalog',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: mockAssignableSubsidyAccessPolicy,
    });
    useBudgetDetailActivityOverview.mockReturnValueOnce({
      isLoading: false,
      data: mockEmptyStateBudgetDetailActivityOverview,
    });
    renderWithRouter(<BudgetDetailPageWrapper />);

    // Catalog tab exists and is active
    expect(screen.getByText('Catalog').getAttribute('aria-selected')).toBe('true');
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
});
