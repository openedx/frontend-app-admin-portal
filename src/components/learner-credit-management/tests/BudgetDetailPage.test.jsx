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
} from '../data';
import { EnterpriseSubsidiesContext } from '../../EnterpriseSubsidiesContext';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({
    budgetId: '123',
    activeTabKey: 'activity',
  }),
}));

jest.mock('../data', () => ({
  ...jest.requireActual('../data'),
  useOfferRedemptions: jest.fn(),
  useBudgetContentAssignments: jest.fn(),
  useSubsidyAccessPolicy: jest.fn(),
}));

useSubsidyAccessPolicy.mockReturnValue({
  isInitialLoading: false,
  data: {
    uuid: 'test-budget-uuid',
    policyType: 'PerLearnerSpendCreditAccessPolicy',
    displayName: null,
    isAssignable: false,
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
    itemCount: 0,
    pageCount: 0,
    results: [],
  },
  fetchOfferRedemptions: jest.fn(),
});

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

const mockEnterpriseOfferId = '123';
const mockSubsidyAccessPolicyUUID = 'c17de32e-b80b-468f-b994-85e68fd32751';

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
    jest.clearAllMocks();
  });

  afterEach(() => {
    useParams.mockReturnValue({
      budgetId: '123',
      activeTabKey: 'activity',
    });
  });

  it.each([
    { displayName: null },
    { displayName: 'Test Budget Display Name' },
  ])('renders budget header data', ({ displayName }) => {
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: {
        uuid: 'a52e6548-649f-4576-b73f-c5c2bee25e9c',
        policyType: 'AssignedLearnerCreditAccessPolicy',
        displayName,
      },
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
    useOfferRedemptions.mockReturnValue({
      isLoading: false,
      offerRedemptions: {
        itemCount: 0,
        pageCount: 0,
        results: [],
      },
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

  it('renders with empty assigned table and catalog tab available for assignable budgets', () => {
    useParams.mockReturnValue({
      budgetId: 'a52e6548-649f-4576-b73f-c5c2bee25e9c',
      activeTabKey: 'activity',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: {
        uuid: 'a52e6548-649f-4576-b73f-c5c2bee25e9c',
        policyType: 'AssignedLearnerCreditAccessPolicy',
        isAssignable: true,
      },
    });
    renderWithRouter(<BudgetDetailPageWrapper />);

    // Assigned table is visible within Activity tab contents
    const assignedSection = within(screen.getByText('Assigned').closest('section'));
    expect(assignedSection.getByText('No results found')).toBeInTheDocument();

    // Catalog tab exists and is NOT active
    expect(screen.getByText('Catalog').getAttribute('aria-selected')).toBe('false');
  });

  it('renders with assigned table data', () => {
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: {
        uuid: 'a52e6548-649f-4576-b73f-c5c2bee25e9c',
        policyType: 'AssignedLearnerCreditAccessPolicy',
        isAssignable: true,
      },
    });
    const mockLearnerEmail = 'edx@example.com';
    const mockContentTitle = 'edx Demo';
    const mockCourseKey = 'edX+DemoX';
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
          },
        ],
        numPages: 1,
        currentPage: 1,
      },
    });
    renderWithRouter(<BudgetDetailPageWrapper />);

    // Assigned table is visible within Activity tab contents
    const assignedSection = within(screen.getByText('Assigned').closest('section'));
    expect(assignedSection.queryByText('No results found')).not.toBeInTheDocument();
    expect(assignedSection.getByText(mockLearnerEmail)).toBeInTheDocument();
    const viewCourseCTA = assignedSection.getByText('edx Demo', { selector: 'a' });
    expect(viewCourseCTA).toBeInTheDocument();
    expect(viewCourseCTA.getAttribute('href')).toEqual(`${process.env.ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}/course/${mockCourseKey}`);
  });

  it('renders with catalog tab active on initial load for assignable budgets', async () => {
    useParams.mockReturnValue({
      budgetId: 'a52e6548-649f-4576-b73f-c5c2bee25e9c',
      activeTabKey: 'catalog',
    });
    renderWithRouter(<BudgetDetailPageWrapper />);

    // Catalog tab exists and is active
    expect(screen.getByText('Catalog').getAttribute('aria-selected')).toBe('true');
  });

  it('hides catalog tab when budget is not assignable', () => {
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: {
        uuid: 'a52e6548-649f-4576-b73f-c5c2bee25e9c',
        policyType: 'PerLearnerSpendCreditAccessPolicy',
        isAssignable: false,
      },
    });
    renderWithRouter(<BudgetDetailPageWrapper />);

    // Catalog tab does NOT exist
    expect(screen.queryByText('Catalog')).toBeFalsy();
  });

  it('hides catalog tab when enterpriseFeatures.topDownAssignmentRealTimeLcm', () => {
    const initialState = {
      portalConfiguration: {
        ...initialStoreState.portalConfiguration,
        enterpriseFeatures: {
          topDownAssignmentRealTimeLcm: false,
        },
      },
    };
    renderWithRouter(<BudgetDetailPageWrapper initialState={initialState} />);

    // Catalog tab does NOT exist
    expect(screen.queryByText('Catalog')).toBeFalsy();
  });

  it('defaults to activity tab is no activeTabKey is provided', () => {
    useParams.mockReturnValue({
      budgetId: '123',
      activeTabKey: undefined,
    });
    renderWithRouter(<BudgetDetailPageWrapper />);

    // Activity tab exists and is active
    expect(screen.getByText('Activity').getAttribute('aria-selected')).toBe('true');
  });

  it('displays not found message is invalid activeTabKey is provided', () => {
    useParams.mockReturnValue({
      budgetId: '123',
      activeTabKey: 'invalid',
    });
    renderWithRouter(<BudgetDetailPageWrapper />);
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('something went wrong', { exact: false })).toBeInTheDocument();
  });

  it('handles user switching to catalog tab', async () => {
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: false,
      data: {
        uuid: 'a52e6548-649f-4576-b73f-c5c2bee25e9c',
        policyType: 'AssignedLearnerCreditAccessPolicy',
        isAssignable: true,
      },
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
    useSubsidyAccessPolicy.mockReturnValue({
      isInitialLoading: true,
      data: undefined,
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
});
