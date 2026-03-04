import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import InviteAdminsTable from '../InviteAdminsTable';
import useEnterpriseAdminsTableData from '../data/hooks/useEnterpriseAdminsTableData';
import LmsApiService from '../../../data/services/LmsApiService';

/* =======================
   Mocks
======================= */

jest.mock('react-redux', () => ({
  connect: () => (Component) => Component,
}));

jest.mock('../data/hooks/useEnterpriseAdminsTableData');

jest.mock('../../../data/services/LmsApiService');

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

jest.mock('../OrgInviteAdminCard', () => function OrgInviteAdminCard({ onRemoveAdmin, original }) {
  return (
    <div data-testid="admin-card">
      <span>Admin Card - {original?.name}</span>
      <button
        type="button"
        data-testid="remove-admin-button"
        onClick={() => onRemoveAdmin(original)}
      >
        Remove
      </button>
    </div>
  );
});

jest.mock('@openedx/paragon', () => {
  const actual = jest.requireActual('@openedx/paragon');

  const MockDataTable = ({ children, isLoading }) => (
    <div data-testid="data-table" data-loading={isLoading}>
      {children}
    </div>
  );

  MockDataTable.FilterStatus = actual.DataTable.FilterStatus;
  MockDataTable.TableControlBar = function TableControlBar({ children }) {
    return <div data-testid="table-control-bar">{children}</div>;
  };
  MockDataTable.TableFooter = function TableFooter({ children }) {
    return <div data-testid="table-footer">{children}</div>;
  };

  const MockToast = ({ show, onClose, children }) => (
    show ? (
      <div data-testid="toast-message" role="alert">
        {children}
        <button type="button" data-testid="toast-close-button" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null
  );

  return {
    ...actual,
    DataTable: MockDataTable,
    CardView: ({ CardComponent }) => (
      <div data-testid="card-view">
        <CardComponent original={{
          id: 1, name: 'Test Admin', email: 'test@example.com', status: 'Admin',
        }}
        />
      </div>
    ),
    Toast: MockToast,
  };
});

/* =======================
   Helpers
======================= */

const messages = {
  'adminPortal.peopleManagement.inviteAdmin.title':
    "Your organization's admins",
  'adminPortal.peopleManagement.inviteAdmin.subtitle':
    'View all admins of your organization.',
  'adminPortal.peopleManagement.inviteAdmin.removeSuccess':
    'Admin removed',
};

const renderWithIntl = (ui) => render(
  <IntlProvider locale="en" messages={messages}>
    {ui}
  </IntlProvider>,
);

describe('InviteAdminsTable', () => {
  const mockFetchEnterpriseAdminsTableData = jest.fn();
  const defaultHookReturn = {
    isLoading: false,
    enterpriseAdminsTableData: {
      results: [],
      itemCount: 0,
      pageCount: 0,
    },
    fetchEnterpriseAdminsTableData: mockFetchEnterpriseAdminsTableData,
    fetchAllEnterpriseAdminsData: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseAdminsTableData.mockReturnValue(defaultHookReturn);
    LmsApiService.removeEnterpriseAdmin.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders header and subtitle using intl messages', () => {
    renderWithIntl(<InviteAdminsTable enterpriseId="test-enterprise" />);

    expect(
      screen.getByText("Your organization's admins"),
    ).toBeInTheDocument();

    expect(
      screen.getByText('View all admins of your organization.'),
    ).toBeInTheDocument();
  });

  it('renders DataTable', () => {
    renderWithIntl(<InviteAdminsTable enterpriseId="test-enterprise" />);

    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    useEnterpriseAdminsTableData.mockReturnValue({
      ...defaultHookReturn,
      isLoading: true,
    });

    renderWithIntl(<InviteAdminsTable enterpriseId="test-enterprise" />);

    const dataTable = screen.getByTestId('data-table');
    expect(dataTable).toBeInTheDocument();
    expect(dataTable).toHaveAttribute('data-loading', 'true');
  });

  it('renders admin cards when data exists', () => {
    useEnterpriseAdminsTableData.mockReturnValue({
      ...defaultHookReturn,
      enterpriseAdminsTableData: {
        results: [{
          id: 1, name: 'Test Admin', email: 'test@example.com', status: 'Admin',
        }],
        itemCount: 1,
        pageCount: 1,
      },
    });

    renderWithIntl(<InviteAdminsTable enterpriseId="test-enterprise" />);

    expect(screen.getByTestId('card-view')).toBeInTheDocument();
    expect(screen.getByTestId('admin-card')).toBeInTheDocument();
    expect(screen.getByText('Admin Card - Test Admin')).toBeInTheDocument();
  });

  it('renders empty table state when no data', () => {
    renderWithIntl(<InviteAdminsTable enterpriseId="test-enterprise" />);

    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  it('passes onRemoveAdmin handler to OrgInviteAdminCard', () => {
    useEnterpriseAdminsTableData.mockReturnValue({
      ...defaultHookReturn,
      enterpriseAdminsTableData: {
        results: [{
          id: 1, name: 'Test Admin', email: 'test@example.com', status: 'Admin',
        }],
        itemCount: 1,
        pageCount: 1,
      },
    });

    renderWithIntl(<InviteAdminsTable enterpriseId="test-enterprise" />);

    expect(screen.getByTestId('remove-admin-button')).toBeInTheDocument();
  });

  it('handles remove admin successfully with role data', async () => {
    const mockAdmin = {
      id: 1,
      name: 'Test Admin',
      email: 'test@example.com',
      status: 'Admin',
    };

    useEnterpriseAdminsTableData.mockReturnValue({
      ...defaultHookReturn,
      enterpriseAdminsTableData: {
        results: [mockAdmin],
        itemCount: 1,
        pageCount: 1,
      },
    });

    renderWithIntl(<InviteAdminsTable enterpriseId="test-enterprise-id" />);

    const removeButton = screen.getByTestId('remove-admin-button');
    await userEvent.click(removeButton);

    await waitFor(() => {
      expect(LmsApiService.removeEnterpriseAdmin).toHaveBeenCalledWith(
        'test-enterprise-id',
        1,
        { role: 'Admin' },
      );
    });

    await waitFor(() => {
      expect(mockFetchEnterpriseAdminsTableData).toHaveBeenCalledWith({
        pageIndex: 0,
        pageSize: 10,
        filters: [],
        sortBy: [{ id: 'name', desc: true }],
      });
    });
  });

  it('displays success toast after admin removal', async () => {
    const mockAdmin = {
      id: 1,
      name: 'Test Admin',
      email: 'test@example.com',
      status: 'Admin',
    };

    useEnterpriseAdminsTableData.mockReturnValue({
      ...defaultHookReturn,
      enterpriseAdminsTableData: {
        results: [mockAdmin],
        itemCount: 1,
        pageCount: 1,
      },
    });

    renderWithIntl(<InviteAdminsTable enterpriseId="test-enterprise-id" />);

    // Toast should not be visible initially
    expect(screen.queryByTestId('toast-message')).not.toBeInTheDocument();

    const removeButton = screen.getByTestId('remove-admin-button');
    await userEvent.click(removeButton);

    // Toast should appear after successful removal
    await waitFor(() => {
      expect(screen.getByTestId('toast-message')).toBeInTheDocument();
      expect(screen.getByText('Admin removed')).toBeInTheDocument();
    });
  });

  it('hides toast when close button is clicked', async () => {
    const mockAdmin = {
      id: 1,
      name: 'Test Admin',
      email: 'test@example.com',
      status: 'Admin',
    };

    useEnterpriseAdminsTableData.mockReturnValue({
      ...defaultHookReturn,
      enterpriseAdminsTableData: {
        results: [mockAdmin],
        itemCount: 1,
        pageCount: 1,
      },
    });

    renderWithIntl(<InviteAdminsTable enterpriseId="test-enterprise-id" />);

    const removeButton = screen.getByTestId('remove-admin-button');
    await userEvent.click(removeButton);

    // Wait for toast to appear
    await waitFor(() => {
      expect(screen.getByTestId('toast-message')).toBeInTheDocument();
    });

    // Click close button
    const closeButton = screen.getByTestId('toast-close-button');
    await userEvent.click(closeButton);

    // Toast should be hidden
    await waitFor(() => {
      expect(screen.queryByTestId('toast-message')).not.toBeInTheDocument();
    });
  });

  it('shows loading state during admin removal', async () => {
    const mockAdmin = {
      id: 1,
      name: 'Test Admin',
      email: 'test@example.com',
      status: 'Admin',
    };

    useEnterpriseAdminsTableData.mockReturnValue({
      ...defaultHookReturn,
      enterpriseAdminsTableData: {
        results: [mockAdmin],
        itemCount: 1,
        pageCount: 1,
      },
    });

    LmsApiService.removeEnterpriseAdmin.mockImplementation(
      () => {
        const promise = new Promise((resolve) => {
          setTimeout(resolve, 100);
        });
        return promise;
      },
    );

    renderWithIntl(<InviteAdminsTable enterpriseId="test-enterprise-id" />);

    const removeButton = screen.getByTestId('remove-admin-button');
    await userEvent.click(removeButton);

    const dataTable = screen.getByTestId('data-table');
    expect(dataTable).toHaveAttribute('data-loading', 'true');

    await waitFor(() => {
      expect(LmsApiService.removeEnterpriseAdmin).toHaveBeenCalled();
    });
  });

  it('handles remove admin error and logs it', async () => {
    const mockAdmin = {
      id: 1,
      name: 'Test Admin',
      email: 'test@example.com',
      status: 'Admin',
    };
    const mockError = new Error('API Error');

    useEnterpriseAdminsTableData.mockReturnValue({
      ...defaultHookReturn,
      enterpriseAdminsTableData: {
        results: [mockAdmin],
        itemCount: 1,
        pageCount: 1,
      },
    });

    LmsApiService.removeEnterpriseAdmin.mockRejectedValue(mockError);

    renderWithIntl(<InviteAdminsTable enterpriseId="test-enterprise-id" />);

    const removeButton = screen.getByTestId('remove-admin-button');
    await userEvent.click(removeButton);

    await waitFor(() => {
      expect(LmsApiService.removeEnterpriseAdmin).toHaveBeenCalledWith(
        'test-enterprise-id',
        1,
        { role: 'Admin' },
      );
    });

    await waitFor(() => {
      expect(logError).toHaveBeenCalledWith(mockError);
    });

    // Should not refresh data when there's an error
    expect(mockFetchEnterpriseAdminsTableData).not.toHaveBeenCalled();

    // Should not show success toast on error
    expect(screen.queryByTestId('toast-message')).not.toBeInTheDocument();
  });

  it('resets loading state after removal completes', async () => {
    const mockAdmin = {
      id: 1,
      name: 'Test Admin',
      email: 'test@example.com',
      status: 'Admin',
    };

    useEnterpriseAdminsTableData.mockReturnValue({
      ...defaultHookReturn,
      enterpriseAdminsTableData: {
        results: [mockAdmin],
        itemCount: 1,
        pageCount: 1,
      },
    });

    renderWithIntl(<InviteAdminsTable enterpriseId="test-enterprise-id" />);

    const removeButton = screen.getByTestId('remove-admin-button');
    await userEvent.click(removeButton);

    await waitFor(() => {
      expect(LmsApiService.removeEnterpriseAdmin).toHaveBeenCalled();
    });

    await waitFor(() => {
      const dataTable = screen.getByTestId('data-table');
      expect(dataTable).toHaveAttribute('data-loading', 'false');
    });
  });
});
