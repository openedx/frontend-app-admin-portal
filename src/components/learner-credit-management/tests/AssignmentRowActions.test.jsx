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

import BudgetDetailPage from '../BudgetDetailPage';
import {
  useSubsidyAccessPolicy,
  useOfferRedemptions,
  useBudgetContentAssignments,
  useBudgetDetailActivityOverview,
} from '../data';
import { EnterpriseSubsidiesContext } from '../../EnterpriseSubsidiesContext';
import {
  mockAssignableSubsidyAccessPolicy,
  mockSubsidyAccessPolicyUUID,
} from '../data/tests/constants';
import { queryClient } from '../../test/testUtils';
import EnterpriseAccessApiService from '../../../data/services/EnterpriseAccessApiService';

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
      const remindRowAction = screen.getByTestId('remind-learner-test-uuid');
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

  it('correctly calls remind learner hook', async () => {
    const mockRemindAssignments = jest.spyOn(EnterpriseAccessApiService, 'remindAssignments');
    mockRemindAssignments.mockResolvedValue({ status: 200 });

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
    renderWithRouter(<BudgetDetailPageWrapper />);
    const remindRowAction = screen.getByTestId('remind-learner-test-uuid');
    expect(remindRowAction).toBeInTheDocument();
    userEvent.click(remindRowAction);
    await waitFor(() => expect(screen.getByText('Remind learner?')).toBeInTheDocument());
    userEvent.click(screen.getByText('Go back'));
    await waitFor(() => expect(screen.queryByText('Remind learner?')).toBeFalsy());

    userEvent.click(remindRowAction);
    await waitFor(() => expect(screen.getByText('Remind learner?')).toBeInTheDocument());
    userEvent.click(screen.getByText('Send reminder'));
    await waitFor(() => expect(mockRemindAssignments).toHaveBeenCalled());
  });
});
