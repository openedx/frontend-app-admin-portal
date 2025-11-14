import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import BudgetDetailRequestsTabContent from '../BudgetDetailRequestsTabContent';
import useBnrSubsidyRequests from '../data/hooks/useBnrSubsidyRequests';
import { useBudgetId } from '../data';
import EnterpriseAccessApiService from '../../../data/services/EnterpriseAccessApiService';
import { queryClient } from '../../test/testUtils';
import '@testing-library/jest-dom/extend-expect';

jest.mock('../data/hooks/useBnrSubsidyRequests');
jest.mock('../data', () => ({
  ...jest.requireActual('../data'),
  useBudgetId: jest.fn(),
  BNR_REQUEST_PAGE_SIZE: 10,
}));
jest.mock('../../../data/services/EnterpriseAccessApiService', () => ({
  approveBnrSubsidyRequest: jest.fn(),
  declineBnrSubsidyRequest: jest.fn(),
}));

const mockStore = configureMockStore([thunk]);

const defaultProps = {
  enterpriseId: 'test-enterprise-id',
};

const mockBnrRequests = {
  itemCount: 2,
  pageCount: 1,
  results: [
    {
      uuid: 'request-1',
      email: 'learner1@example.com',
      courseTitle: 'React Fundamentals',
      courseId: 'course-1',
      courseRunKey: 'course-v1:TestX+React101+2024',
      amount: 9900, // $99.00 in cents
      requestDate: '2025-08-01T10:00:00Z',
      requestStatus: 'requested',
      courseListPrice: '$99.00',
    },
    {
      uuid: 'request-2',
      email: 'learner2@example.com',
      courseTitle: 'Python Basics',
      courseId: 'course-2',
      courseRunKey: 'course-v1:TestX+Python101+2024',
      amount: 14900, // $149.00 in cents
      requestDate: '2025-08-02T10:00:00Z',
      requestStatus: 'approved',
      courseListPrice: '$149.00',
    },
  ],
};

const mockRequestsOverview = [
  { name: 'Requested', value: 'requested', number: 1 },
  { name: 'Approved', value: 'approved', number: 1 },
];

const defaultHookValues = {
  isLoading: false,
  bnrRequests: mockBnrRequests,
  requestsOverview: mockRequestsOverview,
  fetchBnrRequests: jest.fn(),
  refreshRequests: jest.fn(),
};

const defaultStore = {
  portalConfiguration: {
    enterpriseId: 'test-enterprise-id',
    enterpriseSlug: 'test-enterprise',
  },
};

const BudgetDetailRequestsTabContentWrapper = ({
  initialState = defaultStore,
  hookValues = defaultHookValues,
  ...props
}) => {
  const store = mockStore(initialState);

  // Setup hook mocks
  useBnrSubsidyRequests.mockReturnValue(hookValues);
  useBudgetId.mockReturnValue({
    subsidyAccessPolicyId: 'test-policy-id',
  });

  return (
    <MemoryRouter>
      <QueryClientProvider client={queryClient()}>
        <IntlProvider locale="en">
          <Provider store={store}>
            <BudgetDetailRequestsTabContent {...defaultProps} {...props} />
          </Provider>
        </IntlProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe('BudgetDetailRequestsTabContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the component with title and description', () => {
      render(<BudgetDetailRequestsTabContentWrapper />);

      expect(screen.getByText('Requests')).toBeInTheDocument();
      expect(screen.getByText('Approve or decline requests for learners.')).toBeInTheDocument();
    });

    it('should render the RequestsTable with data', async () => {
      render(<BudgetDetailRequestsTabContentWrapper />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      expect(screen.getByText('learner1@example.com')).toBeInTheDocument();
      expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
      expect(screen.getByText('learner2@example.com')).toBeInTheDocument();
      expect(screen.getByText('Python Basics')).toBeInTheDocument();
    });
  });

  describe('Approve and Decline Button Visibility', () => {
    it('should show approve and decline buttons when request is in requested state', async () => {
      render(<BudgetDetailRequestsTabContentWrapper />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      const approveButtons = screen.getAllByRole('button', { name: /approve/i });
      const declineButtons = screen.getAllByRole('button', { name: /decline/i });

      expect(approveButtons.length).toBeGreaterThan(0);
      expect(declineButtons.length).toBeGreaterThan(0);
    });

    it('should not show approve and decline buttons for approved requests', async () => {
      const hookValues = {
        ...defaultHookValues,
        bnrRequests: {
          itemCount: 1,
          pageCount: 1,
          results: [
            {
              uuid: 'approved-request',
              email: 'learner@example.com',
              courseTitle: 'Course Title',
              courseId: 'course-1',
              courseRunKey: 'course-v1:TestX+Test101+2024',
              amount: 9900,
              requestDate: '2025-08-01T10:00:00Z',
              requestStatus: 'approved',
              courseListPrice: '$99.00',
            },
          ],
        },
      };

      render(<BudgetDetailRequestsTabContentWrapper hookValues={hookValues} />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      expect(screen.queryByRole('button', { name: /approve/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /decline/i })).not.toBeInTheDocument();
    });

    it('should not show approve and decline buttons for declined requests', async () => {
      const hookValues = {
        ...defaultHookValues,
        bnrRequests: {
          itemCount: 1,
          pageCount: 1,
          results: [
            {
              uuid: 'declined-request',
              email: 'learner@example.com',
              courseTitle: 'Course Title',
              courseId: 'course-1',
              courseRunKey: 'course-v1:TestX+Test101+2024',
              amount: 9900,
              requestDate: '2025-08-01T10:00:00Z',
              requestStatus: 'declined',
              courseListPrice: '$99.00',
            },
          ],
        },
      };

      render(<BudgetDetailRequestsTabContentWrapper hookValues={hookValues} />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      expect(screen.queryByRole('button', { name: /approve/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /decline/i })).not.toBeInTheDocument();
    });
  });

  describe('Approve Modal Interactions', () => {
    it('should open approve modal when approve button is clicked', async () => {
      const user = userEvent.setup();
      render(<BudgetDetailRequestsTabContentWrapper />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      const approveButton = screen.getByRole('button', { name: /approve/i });
      await user.click(approveButton);

      await waitFor(() => {
        expect(screen.getByText('Approve enrollment request?')).toBeInTheDocument();
        expect(screen.getByText(/Approving an enrollment request cannot be undone/)).toBeInTheDocument();
        expect(screen.getByTestId('approve-subsidy-request-modal-approve-btn')).toBeInTheDocument();
        expect(screen.getByTestId('approve-subsidy-request-modal-close-btn')).toBeInTheDocument();
      });
    });

    it('should close approve modal when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<BudgetDetailRequestsTabContentWrapper />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      const approveButton = screen.getByRole('button', { name: /approve/i });
      await user.click(approveButton);

      await waitFor(() => {
        expect(screen.getByText('Approve enrollment request?')).toBeInTheDocument();
      });

      const closeButton = screen.getByTestId('approve-subsidy-request-modal-close-btn');
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Approve enrollment request?')).not.toBeInTheDocument();
      });
    });

    it('should call approve API and refresh requests on successful approval', async () => {
      const user = userEvent.setup();
      const mockRefreshRequests = jest.fn();
      const mockApproveRequest = jest.fn().mockResolvedValue({});

      EnterpriseAccessApiService.approveBnrSubsidyRequest.mockImplementation(mockApproveRequest);

      const hookValues = {
        ...defaultHookValues,
        refreshRequests: mockRefreshRequests,
      };

      render(<BudgetDetailRequestsTabContentWrapper hookValues={hookValues} />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      const approveButton = screen.getByRole('button', { name: /approve/i });
      await user.click(approveButton);

      await waitFor(() => {
        expect(screen.getByTestId('approve-subsidy-request-modal-approve-btn')).toBeInTheDocument();
      });

      const confirmButton = screen.getByTestId('approve-subsidy-request-modal-approve-btn');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockApproveRequest).toHaveBeenCalledWith({
          enterpriseId: 'test-enterprise-id',
          subsidyAccessPolicyId: 'test-policy-id',
          subsidyRequestUUIDs: ['request-1'],
        });
        expect(mockRefreshRequests).toHaveBeenCalledTimes(1);
        expect(screen.queryByText('Approve enrollment request?')).not.toBeInTheDocument();
      });
    });

    it('should show error alert when approve API fails', async () => {
      const user = userEvent.setup();
      const mockApproveRequest = jest.fn().mockRejectedValue(new Error('API Error'));

      EnterpriseAccessApiService.approveBnrSubsidyRequest.mockImplementation(mockApproveRequest);

      render(<BudgetDetailRequestsTabContentWrapper />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      const approveButton = screen.getByRole('button', { name: /approve/i });
      await user.click(approveButton);

      await waitFor(() => {
        expect(screen.getByTestId('approve-subsidy-request-modal-approve-btn')).toBeInTheDocument();
      });

      const confirmButton = screen.getByTestId('approve-subsidy-request-modal-approve-btn');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByTestId('approve-subsidy-request-modal-alert')).toBeInTheDocument();
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        expect(screen.getByText('Please try again.')).toBeInTheDocument();
      });
    });
  });

  describe('Decline Modal Interactions', () => {
    it('should open decline modal when decline button is clicked', async () => {
      const user = userEvent.setup();
      render(<BudgetDetailRequestsTabContentWrapper />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      const declineButton = screen.getByRole('button', { name: /decline/i });
      await user.click(declineButton);

      await waitFor(() => {
        expect(screen.getByText('Are you sure?')).toBeInTheDocument();
        expect(screen.getByText(/Declining an enrollment request cannot be undone/)).toBeInTheDocument();
        expect(screen.getByTestId('decline-subsidy-request-modal-decline-btn')).toBeInTheDocument();
        expect(screen.getByTestId('decline-subsidy-request-modal-close-btn')).toBeInTheDocument();
        expect(screen.getByTestId('decline-bnr-subsidy-request-modal-notify-learner-checkbox')).toBeInTheDocument();
        expect(screen.getByTestId('decline-subsidy-request-modal-unlink-learner-checkbox')).toBeInTheDocument();
      });
    });

    it('should call decline API with default options and refresh requests on successful decline', async () => {
      const user = userEvent.setup();
      const mockRefreshRequests = jest.fn();
      const mockDeclineRequest = jest.fn().mockResolvedValue({});

      EnterpriseAccessApiService.declineBnrSubsidyRequest.mockImplementation(mockDeclineRequest);

      const hookValues = {
        ...defaultHookValues,
        refreshRequests: mockRefreshRequests,
      };

      render(<BudgetDetailRequestsTabContentWrapper hookValues={hookValues} />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      const declineButton = screen.getByRole('button', { name: /decline/i });
      await user.click(declineButton);

      await waitFor(() => {
        expect(screen.getByTestId('decline-subsidy-request-modal-decline-btn')).toBeInTheDocument();
      });

      const confirmButton = screen.getByTestId('decline-subsidy-request-modal-decline-btn');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockDeclineRequest).toHaveBeenCalledWith({
          enterpriseId: 'test-enterprise-id',
          subsidyRequestUUID: 'request-1',
          sendNotification: true,
          unlinkUsersFromEnterprise: false,
        });
        expect(mockRefreshRequests).toHaveBeenCalledTimes(1);
        expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
      });
    });

    it('should call decline API with custom options when checkboxes are modified', async () => {
      const user = userEvent.setup();
      const mockDeclineRequest = jest.fn().mockResolvedValue({});

      EnterpriseAccessApiService.declineBnrSubsidyRequest.mockImplementation(mockDeclineRequest);

      render(<BudgetDetailRequestsTabContentWrapper />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      const declineButton = screen.getByRole('button', { name: /decline/i });
      await user.click(declineButton);

      await waitFor(() => {
        expect(screen.getByTestId('decline-bnr-subsidy-request-modal-notify-learner-checkbox')).toBeInTheDocument();
      });

      const notifyCheckbox = screen.getByTestId('decline-bnr-subsidy-request-modal-notify-learner-checkbox');
      const unlinkCheckbox = screen.getByTestId('decline-subsidy-request-modal-unlink-learner-checkbox');

      await user.click(notifyCheckbox);
      await user.click(unlinkCheckbox);

      const confirmButton = screen.getByTestId('decline-subsidy-request-modal-decline-btn');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockDeclineRequest).toHaveBeenCalledWith({
          enterpriseId: 'test-enterprise-id',
          subsidyRequestUUID: 'request-1',
          sendNotification: false,
          unlinkUsersFromEnterprise: true,
        });
      });
    });
  });

  describe('Loading and Empty States', () => {
    it('should handle empty state when no requests are available', async () => {
      const hookValues = {
        ...defaultHookValues,
        bnrRequests: {
          itemCount: 0,
          pageCount: 0,
          results: [],
        },
      };

      render(<BudgetDetailRequestsTabContentWrapper hookValues={hookValues} />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      expect(screen.getByText(/no results found/i)).toBeInTheDocument();
    });
  });

  describe('Table Features', () => {
    it('should handle table refresh functionality', async () => {
      const user = userEvent.setup();
      const mockRefreshRequests = jest.fn();

      const hookValues = {
        ...defaultHookValues,
        refreshRequests: mockRefreshRequests,
      };

      render(<BudgetDetailRequestsTabContentWrapper hookValues={hookValues} />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      expect(mockRefreshRequests).toHaveBeenCalledTimes(1);
    });
  });
});
