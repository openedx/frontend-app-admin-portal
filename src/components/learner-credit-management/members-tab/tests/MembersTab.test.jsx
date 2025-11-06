import React from 'react';
import { useParams } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';

import BudgetDetailPage from '../../BudgetDetailPage';
import {
  useSubsidyAccessPolicy,
  useBudgetRedemptions,
  useBudgetDetailActivityOverview,
  useEnterpriseGroupLearners,
  useEnterpriseGroupMembersTableData,
  useEnterpriseOffer,
  useEnterpriseRemovedGroupMembers,
  useSubsidySummaryAnalyticsApi,
  useEnterpriseFlexGroups,
  useEnterpriseGroup,
} from '../../data';
import { EnterpriseSubsidiesContext } from '../../../EnterpriseSubsidiesContext';
import {
  mockAssignableSubsidyAccessPolicy,
} from '../../data/tests/constants';
import { queryClient } from '../../../test/testUtils';
import LmsApiService from '../../../../data/services/LmsApiService';
import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

jest.mock('../../data/hooks', () => ({
  ...jest.requireActual('../../data/hooks'),
  useBudgetRedemptions: jest.fn(),
  useBudgetContentAssignments: jest.fn(),
  useEnterpriseGroupLearners: jest.fn(),
  useEnterpriseGroupMembersTableData: jest.fn(),
  useSubsidyAccessPolicy: jest.fn(),
  useSubsidySummaryAnalyticsApi: jest.fn(),
  useEnterpriseOffer: jest.fn(),
  useBudgetDetailActivityOverview: jest.fn(),
  useIsLargeOrGreater: jest.fn().mockReturnValue(true),
  useCancelContentAssignments: jest.fn(),
  useEnterpriseRemovedGroupMembers: jest.fn(),
  useEnterpriseFlexGroups: jest.fn(),
  useEnterpriseGroup: jest.fn(),
}));

jest.mock('../../../../data/services/EnterpriseAccessApiService');
jest.mock('../../../../data/services/LmsApiService');

jest.mock('file-saver', () => ({
  ...jest.requireActual('react-router-dom'),
  saveAs: jest.fn(),
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

const mockEmptyStateBudgetDetailActivityOverview = {
  contentAssignments: { count: 0 },
  spentTransactions: { count: 0 },
};
const mockEmptyBudgetRedemptions = {
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

describe('MembersTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useSubsidySummaryAnalyticsApi.mockReturnValue({
      isLoading: false,
      subsidySummary: {},
    });

    useEnterpriseOffer.mockReturnValue({
      isLoading: false,
      data: {},
    });

    useEnterpriseRemovedGroupMembers.mockReturnValue({
      isRemovedMembersLoading: false,
      removedGroupMembersCount: 0,
    });

    useEnterpriseFlexGroups.mockReturnValue({
      data: {}, isLoading: false,
    });

    useEnterpriseGroup.mockReturnValue({
      data: {}, isLoading: false,
    });
  });

  it('does not render members tab if no members exist', async () => {
    const initialState = {
      portalConfiguration: {
        ...initialStoreState.portalConfiguration,
      },
    };
    useParams.mockReturnValue({
      enterpriseSlug: 'test-enterprise-slug',
      enterpriseAppPage: 'test-enterprise-page',
      activeTabKey: 'activity',
      budgetId: 'a52e6548-649f-4576-b73f-c5c2bee25e9c',
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
        count: 0,
        currentPage: 1,
        next: null,
        numPages: 1,
        results: [],
      },
    });
    renderWithRouter(<BudgetDetailPageWrapper initialState={initialState} />);
    await waitFor(() => expect(screen.queryByTestId('group-members-tab')).not.toBeInTheDocument());
  });
  it('does renders the members tab if members exist', async () => {
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
      activeTabKey: 'activity',
      budgetId: 'test-budget-id',
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
    renderWithRouter(<BudgetDetailPageWrapper initialState={initialState} />);
    await waitFor(() => expect(screen.queryByTestId('group-members-tab')).toBeInTheDocument());
  });
  it('renders group members table data fetched by useEnterpriseGroupMembersTableData', async () => {
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
      activeTabKey: 'members',
      budgetId: 'test-budget-id',
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
    useEnterpriseGroupMembersTableData.mockReturnValue({
      isLoading: false,
      enterpriseGroupMembersTableData: {
        itemCount: 1,
        pageCount: 1,
        results: [{
          memberDetails: { userEmail: 'foobar@test.com', userName: 'ayy lmao' },
          status: 'pending',
          recentAction: 'Pending: April 02, 2024',
          enrollmentCount: 0,
        }],
      },
      fetchEnterpriseGroupMembersTableData: jest.fn(),
    });
    renderWithRouter(<BudgetDetailPageWrapper initialState={initialState} />);
    await waitFor(() => expect(screen.queryByText('foobar@test.com')).toBeInTheDocument());
  });
  it('passes proper sorting and filter args to fetchEnterpriseGroupMembersData', async () => {
    const user = userEvent.setup();
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
      activeTabKey: 'members',
      budgetId: 'test-budget-id',
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
      removedGroupMembersCount: 1,
    });
    const mockFetchEnterpriseGroupMembersTableData = jest.fn();
    useEnterpriseGroupMembersTableData.mockReturnValue({
      isLoading: false,
      enterpriseGroupMembersTableData: {
        itemCount: 1,
        pageCount: 1,
        results: [{
          memberDetails: { userEmail: 'foobar@test.com', userName: 'ayy lmao' },
          status: 'pending',
          recentAction: 'Pending: April 02, 2024',
          enrollmentCount: 0,
        }],
      },
      fetchEnterpriseGroupMembersTableData: mockFetchEnterpriseGroupMembersTableData,
    });
    renderWithRouter(<BudgetDetailPageWrapper initialState={initialState} />);
    await user.type(screen.getByText('Search by member details'), 'foobar');
    await waitFor(() => expect(mockFetchEnterpriseGroupMembersTableData).toHaveBeenCalledWith({
      filters: [{ id: 'memberDetails', value: 'foobar' }],
      pageIndex: 0,
      pageSize: 10,
      sortBy: [{ desc: true, id: 'memberDetails' }],
    }));

    await user.click(screen.getByTestId('members-table-status-column-header'));
    await waitFor(() => expect(mockFetchEnterpriseGroupMembersTableData).toHaveBeenCalledWith({
      filters: [{ id: 'memberDetails', value: 'foobar' }],
      pageIndex: 0,
      pageSize: 10,
      sortBy: [{ desc: false, id: 'status' }],
    }));

    const removeToggle = screen.getByTestId('show-removed-toggle');
    await user.click(removeToggle);
    expect(screen.getByText('Show removed (1)')).toBeInTheDocument();
    await waitFor(() => expect(mockFetchEnterpriseGroupMembersTableData).toHaveBeenCalledWith({
      filters: [
        { id: 'memberDetails', value: 'foobar' },
        { id: 'status', value: true },
      ],
      pageIndex: 0,
      pageSize: 10,
      sortBy: [{ desc: false, id: 'status' }],
    }));

    await user.click(screen.getByTestId('members-table-enrollments-column-header'));
    await waitFor(() => expect(mockFetchEnterpriseGroupMembersTableData).toHaveBeenCalledWith({
      filters: [
        { id: 'memberDetails', value: 'foobar' },
        { id: 'status', value: true },
      ],
      pageIndex: 0,
      pageSize: 10,
      sortBy: [{ desc: false, id: 'enrollmentCount' }],
    }));
  });
  it('remove learner flow', async () => {
    const user = userEvent.setup();
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
      activeTabKey: 'members',
      budgetId: 'test-budget-id',
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
          memberDetails: { userEmail: 'dukesilver@test.com', userName: 'duke silver' },
        },
      },
    });
    useEnterpriseGroupMembersTableData.mockReturnValue({
      isLoading: false,
      enterpriseGroupMembersTableData: {
        itemCount: 2,
        pageCount: 1,
        results: [{
          memberDetails: { userEmail: 'dukesilver@test.com', userName: 'duke silver' },
          status: 'pending',
          recentAction: 'Pending: April 02, 2024',
          enrollmentCount: 0,
        }],
      },
      fetchEnterpriseGroupMembersTableData: jest.fn(),
    });
    const mockRemoveSpy = jest.spyOn(LmsApiService, 'removeEnterpriseLearnersFromGroup');
    LmsApiService.removeEnterpriseLearnersFromGroup.mockResolvedValue({ status: 200 });

    renderWithRouter(<BudgetDetailPageWrapper initialState={initialState} />);
    await waitFor(() => expect(screen.queryByText('dukesilver@test.com')).toBeInTheDocument());
    const selectFirstCheckbox = screen.queryAllByRole('checkbox')[1];
    await user.click(selectFirstCheckbox);
    const removeButton = screen.queryByText('Remove (1)');
    expect(removeButton).toBeInTheDocument();
    await user.click(removeButton);
    // remove modal opens
    expect(screen.queryByText('Remove member?')).toBeInTheDocument();
    await user.click(screen.queryByText('Go back'));
    expect(screen.queryByText('Remove member?')).not.toBeInTheDocument();
    await user.click(removeButton);

    const modalRemoveButton = screen.getByTestId('modal-remove-button');
    await user.click(modalRemoveButton);
    expect(mockRemoveSpy).toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByText('1 member successfully removed')).toBeInTheDocument());
  });
  it('remove learner flow for multiple users', async () => {
    const user = userEvent.setup();
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
      activeTabKey: 'members',
      budgetId: mockAssignableSubsidyAccessPolicy.uuid,
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
          memberDetails: { userEmail: 'dukesilver@test.com', userName: 'duke silver' },
        },
      },
    });
    useEnterpriseGroupMembersTableData.mockReturnValue({
      isLoading: false,
      enterpriseGroupMembersTableData: {
        itemCount: 2,
        pageCount: 1,
        results: [{
          memberDetails: { userEmail: 'dukesilver@test.com', userName: 'duke silver' },
          status: 'pending',
          recentAction: 'Pending: April 02, 2024',
          enrollmentCount: 0,
        },
        {
          memberDetails: { userEmail: 'tammy2@test.com', userName: 'tammy 2' },
          status: 'pending',
          recentAction: 'Pending: April 02, 2024',
          enrollmentCount: 0,
        }],
      },
      fetchEnterpriseGroupMembersTableData: jest.fn(),
    });
    const mockRemoveSpy = jest.spyOn(LmsApiService, 'removeEnterpriseLearnersFromGroup');
    LmsApiService.removeEnterpriseLearnersFromGroup.mockResolvedValue({ status: 200 });

    renderWithRouter(<BudgetDetailPageWrapper initialState={initialState} />);
    await waitFor(() => expect(screen.queryByText('dukesilver@test.com')).toBeInTheDocument());
    const selectAllCheckbox = screen.queryAllByRole('checkbox')[0];
    await user.click(selectAllCheckbox);

    const removeButton = screen.queryByText('Remove (2)');
    expect(removeButton).toBeInTheDocument();
    await user.click(removeButton);

    expect(screen.queryByText('Remove members?')).toBeInTheDocument();
    const modalRemoveButton = screen.getByTestId('modal-remove-button');
    expect(modalRemoveButton).toHaveTextContent('Remove (2)');
    await user.click(modalRemoveButton);
    expect(mockRemoveSpy).toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByText('2 members successfully removed')).toBeInTheDocument());

    // Because there is only one page of data, and the whole page is selected,
    // the request should be to remove the entire org
    expect(LmsApiService.removeEnterpriseLearnersFromGroup).toHaveBeenCalledWith(
      mockAssignableSubsidyAccessPolicy.groupAssociations[0],
      { remove_all: true, catalog_uuid: mockAssignableSubsidyAccessPolicy.catalogUuid },
    );
  });
  it('remove learner flow with the kabob menu', async () => {
    const user = userEvent.setup();
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
      activeTabKey: 'members',
      budgetId: 'test-budget-id',
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
          memberDetails: { userEmail: 'dukesilver@test.com', userName: 'duke silver' },
        },
      },
    });
    useEnterpriseGroupMembersTableData.mockReturnValue({
      isLoading: false,
      enterpriseGroupMembersTableData: {
        itemCount: 2,
        pageCount: 1,
        results: [{
          memberDetails: { userEmail: 'dukesilver@test.com', userName: 'duke silver' },
          status: 'pending',
          recentAction: 'Pending: April 02, 2024',
          enrollmentCount: 0,
        }],
      },
      fetchEnterpriseGroupMembersTableData: jest.fn(),
    });
    const mockRemoveSpy = jest.spyOn(LmsApiService, 'removeEnterpriseLearnersFromGroup');
    LmsApiService.removeEnterpriseLearnersFromGroup.mockResolvedValue({ status: 200 });

    renderWithRouter(<BudgetDetailPageWrapper initialState={initialState} />);
    const kabobMenu = screen.queryByTestId('kabob-menu-dropdown');
    await user.click(kabobMenu);
    const removeDropdownOption = screen.queryByText('Remove member');
    await user.click(removeDropdownOption);

    await waitFor(() => expect(screen.queryByText('Remove member?')).toBeInTheDocument());
    const modalRemoveButton = screen.getByTestId('modal-remove-button');
    expect(modalRemoveButton).toHaveTextContent('Remove member');
    await user.click(modalRemoveButton);
    expect(mockRemoveSpy).toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByText('1 member successfully removed')).toBeInTheDocument());
  });
  it('error in remove learner flow', async () => {
    const user = userEvent.setup();
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
      activeTabKey: 'members',
      budgetId: 'test-budget-id',
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
          memberDetails: { userEmail: 'dukesilver@test.com', userName: 'duke silver' },
        },
      },
    });
    useEnterpriseGroupMembersTableData.mockReturnValue({
      isLoading: false,
      enterpriseGroupMembersTableData: {
        itemCount: 2,
        pageCount: 1,
        results: [{
          memberDetails: { userEmail: 'dukesilver@test.com', userName: 'duke silver' },
          status: 'pending',
          recentAction: 'Pending: April 02, 2024',
          enrollmentCount: 0,
        }],
      },
      fetchEnterpriseGroupMembersTableData: jest.fn(),
    });
    LmsApiService.removeEnterpriseLearnersFromGroup.mockRejectedValueOnce(new Error('oops all berries!'));

    renderWithRouter(<BudgetDetailPageWrapper initialState={initialState} />);
    await waitFor(() => expect(screen.queryByText('dukesilver@test.com')).toBeInTheDocument());
    const selectFirstCheckbox = screen.queryAllByRole('checkbox')[1];
    await user.click(selectFirstCheckbox);
    const removeButton = screen.queryByText('Remove (1)');
    expect(removeButton).toBeInTheDocument();
    await user.click(removeButton);

    expect(screen.queryByText('Remove member?')).toBeInTheDocument();
    const modalRemoveButton = screen.getByTestId('modal-remove-button');
    await user.click(modalRemoveButton);
    await waitFor(() => expect(screen.queryByText('There was an error with your request. Please try again.')).toBeInTheDocument());
  });
  it('displays members download button that makes requests to fetch member data with queries', async () => {
    const user = userEvent.setup();
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
      activeTabKey: 'members',
      budgetId: mockAssignableSubsidyAccessPolicy.uuid,
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
      removedGroupMembersCount: 1,
    });
    const mockFetchEnterpriseGroupMembersTableData = jest.fn();
    const mockGroupData = {
      isLoading: false,
      enterpriseGroupMembersTableData: {
        itemCount: 100,
        pageCount: 1,
        results: [{
          memberDetails: { userEmail: 'foobar@test.com', userName: 'ayy lmao' },
          status: 'pending',
          recentAction: 'Pending: April 02, 2024',
          enrollmentCount: 1,
        }],
      },
      fetchEnterpriseGroupMembersTableData: mockFetchEnterpriseGroupMembersTableData,
    };
    useEnterpriseGroupMembersTableData.mockReturnValue(mockGroupData);
    EnterpriseAccessApiService.fetchSubsidyHydratedGroupMembersData.mockResolvedValue('a,b,c,\nd,e,f');
    renderWithRouter(<BudgetDetailPageWrapper initialState={initialState} />);
    await user.type(screen.getByText('Search by member details'), 'foobar');
    await user.click(screen.getByTestId('members-table-enrollments-column-header'));

    const removeToggle = screen.getByTestId('show-removed-toggle');
    await user.click(removeToggle);
    expect(screen.getByText('Show removed (1)')).toBeInTheDocument();

    const toggleAllRowsSelected = screen.getByTitle('Toggle All Current Page Rows Selected');
    await user.click(toggleAllRowsSelected);

    const downloadButton = screen.getByText('Download (1)');
    expect(downloadButton).toBeInTheDocument();

    await user.click(downloadButton);
    expect(EnterpriseAccessApiService.fetchSubsidyHydratedGroupMembersData).toHaveBeenCalledWith(
      mockAssignableSubsidyAccessPolicy.uuid,
      {
        format_csv: true,
        traverse_pagination: true,
        group_uuid: mockAssignableSubsidyAccessPolicy.groupAssociations[0],
        user_query: 'foobar',
        sort_by: 'enrollment_count',
        show_removed: true,
        is_reversed: true,
      },
      ['foobar@test.com'],
    );
  });
  it.each([
    {
      status: 'pending',
      popoverLabel: 'Waiting for member',
      popoverAssertionMessages: [
        'Waiting for dukesilver@test.com',
        'This member must accept their invitation to browse this budget\'s catalog and enroll using their '
        + 'member permissions by logging in or creating an account within 90 days.',
      ],
    },
    {
      status: 'removed',
      popoverLabel: 'Removed',
      popoverAssertionMessages: [
        'Member removed',
        'This member has been successfully removed and can not browse this budget\'s '
        + 'catalog and enroll using their member permissions.',
      ],
    },
    {
      status: 'accepted',
      popoverLabel: 'Accepted',
      popoverAssertionMessages: [
        'Invitation accepted',
        'This member has successfully accepted the member invitation and can '
        + 'now browse this budget\'s catalog and enroll using their member permissions.',
      ],
    },
    {
      status: 'internal_api_error',
      popoverLabel: 'Failed: System',
      popoverAssertionMessages: [
        'Something went wrong behind the scenes.',
      ],
    },
    {
      status: 'email_error',
      popoverLabel: 'Failed: Bad email',
      popoverAssertionMessages: [
        'This member invitation failed because a notification to dukesilver@test.com '
        + 'could not be sent.',
      ],
    },
  ])(
    'test member status popovers, (%s)',
    async ({
      popoverLabel,
      popoverAssertionMessages,
      status,
    }) => {
      const user = userEvent.setup();
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
        activeTabKey: 'members',
        budgetId: 'test-budget-id',
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
            memberDetails: { userEmail: 'dukesilver@test.com', userName: 'duke silver' },
          },
        },
      });
      useEnterpriseGroupMembersTableData.mockReturnValue({
        isLoading: false,
        enterpriseGroupMembersTableData: {
          itemCount: 5,
          pageCount: 1,
          results: [{
            memberDetails: { userEmail: 'dukesilver@test.com', userName: 'duke silver' },
            status,
            recentAction: 'Pending: April 02, 2024',
            enrollmentCount: 0,
          },
          ],
        },
        fetchEnterpriseGroupMembersTableData: jest.fn(),
      });
      renderWithRouter(<BudgetDetailPageWrapper initialState={initialState} />);
      await waitFor(() => expect(screen.queryByText('dukesilver@test.com')).toBeInTheDocument());
      const popoverElement = screen.getByText(popoverLabel);
      popoverElement.style.pointerEvents = 'auto';
      await user.click(popoverElement);
      await waitFor(() => {
        popoverAssertionMessages.forEach((message) => {
          expect(screen.getByText(message)).toBeInTheDocument();
        });
      });
    },

    // Increase the timeout from the default (5000 ms) to 9000 ms to give
    // github actions a little more time to run this heavy/flaky test.
    // FIXME: Longer term, we should break up this test so that there are not
    // so many sequential click + waitFor.
    9000,
  );
  it('download learner flow for multiple selected pages of users', async () => {
    const user = userEvent.setup();
    // Setup
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
      activeTabKey: 'members',
      budgetId: mockAssignableSubsidyAccessPolicy.uuid,
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
        count: 100,
        currentPage: 1,
        next: null,
        numPages: 4,
        results: {
          enterpriseGroupMembershipUuid: 'cde2e374-032f-4c08-8c0d-bf3205fa7c7e',
          learnerId: 4382,
          memberDetails: { userEmail: 'dukesilver@test.com', userName: 'duke silver' },
        },
      },
    });
    useEnterpriseGroupMembersTableData.mockReturnValue({
      isLoading: false,
      enterpriseGroupMembersTableData: {
        // Item count tells the table whether or not there are more records that are not displayed by results
        itemCount: 100,
        pageCount: 4,
        results: [{
          memberDetails: { userEmail: 'dukesilver@test.com', userName: 'duke silver' },
          status: 'pending',
          recentAction: 'Pending: April 02, 2024',
          enrollmentCount: 0,
        },
        {
          memberDetails: { userEmail: 'tammy2@test.com', userName: 'tammy 2' },
          status: 'pending',
          recentAction: 'Pending: April 02, 2024',
          enrollmentCount: 0,
        }],
      },
      fetchEnterpriseGroupMembersTableData: jest.fn(),
    });
    EnterpriseAccessApiService.fetchSubsidyHydratedGroupMembersData.mockResolvedValue({ status: 200 });
    const mockDownloadSpy = jest.spyOn(EnterpriseAccessApiService, 'fetchSubsidyHydratedGroupMembersData');

    renderWithRouter(<BudgetDetailPageWrapper initialState={initialState} />);
    await waitFor(() => expect(screen.queryByText('dukesilver@test.com')).toBeInTheDocument());

    // Select all the records on the current page
    const selectAllCheckbox = screen.queryAllByRole('checkbox')[0];
    await user.click(selectAllCheckbox);

    // Download the results
    const downloadButton = screen.queryByText('Download (2)');
    await user.click(downloadButton);
    // Expect the mock to have been called once
    expect(mockDownloadSpy).toHaveBeenCalledTimes(1);
    // Expect the fetch members call to have been made with the emails of the records selected on the current page
    expect(EnterpriseAccessApiService.fetchSubsidyHydratedGroupMembersData).toHaveBeenCalledWith(
      mockAssignableSubsidyAccessPolicy.uuid,
      {
        format_csv: true,
        traverse_pagination: true,
        group_uuid: mockAssignableSubsidyAccessPolicy.groupAssociations[0],
        sort_by: 'member_details',
      },
      ['dukesilver@test.com', 'tammy2@test.com'],
    );

    // Value correlates to the itemCount coming from ``useEnterpriseGroupMembersTableData``
    // Click the select all to apply the selection to all records passed the currently selected page
    const selectAllButton = screen.queryByText('Select all 100');

    await user.click(selectAllButton);
    await user.click(downloadButton);
    // Expect an additional call to the mock
    expect(mockDownloadSpy).toHaveBeenCalledTimes(2);
    // Expect the call to fetch member records to be made without any email specification, indicating a fetch of all
    expect(EnterpriseAccessApiService.fetchSubsidyHydratedGroupMembersData).toHaveBeenCalledWith(
      mockAssignableSubsidyAccessPolicy.uuid,
      {
        format_csv: true,
        traverse_pagination: true,
        group_uuid: mockAssignableSubsidyAccessPolicy.groupAssociations[0],
        sort_by: 'member_details',
      },
      null,
    );
  });
});
