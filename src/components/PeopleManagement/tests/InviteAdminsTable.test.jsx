import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import { axe } from 'jest-axe';
import InviteAdminsTable from '../InviteAdminsTable';
import useEnterpriseAdminsTableData from '../data/hooks/useEnterpriseAdminsTableData';
import LmsApiService from '../../../data/services/LmsApiService';
import { accessibilitySettings } from '../../../../tests/accessibility-settings';

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

  const MockDataTable = ({ children, isLoading, tableActions }) => (
    <div data-testid="data-table" data-loading={isLoading}>
      {tableActions && <div data-testid="table-actions">{tableActions}</div>}
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

jest.mock('../AddAdminModal', () => function AddAdminModal({
  isOpen, onClose, enterpriseId, onSuccess, onError,
}) {
  return isOpen ? (
    <div data-testid="add-admin-modal">
      <span>Add Admin Modal - {enterpriseId}</span>
      <button
        type="button"
        data-testid="modal-close-button"
        onClick={onClose}
      >
        Close Modal
      </button>
      <button
        type="button"
        data-testid="modal-success-button"
        onClick={() => {
          onSuccess();
          onClose();
        }}
      >
        Success
      </button>
      <button
        type="button"
        data-testid="modal-error-button"
        onClick={() => {
          onError(new Error('fail'));
          onClose();
        }}
      >
        Error
      </button>
    </div>
  ) : null;
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
  'adminPortal.peopleManagement.inviteAdmin.inviteSuccess':
    'Invite sent',
  'adminPortal.peopleManagement.inviteAdmin.inviteError':
    'Invite failed to send',
};

const renderWithIntl = (ui) => render(
  <IntlProvider locale="en" messages={messages}>
    {ui}
  </IntlProvider>,
);

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

describe('InviteAdminsTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseAdminsTableData.mockReturnValue(defaultHookReturn);
    LmsApiService.removeEnterpriseAdmin.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithIntl(<InviteAdminsTable enterpriseId="test-enterprise" />);
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
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

describe('Add Admin functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseAdminsTableData.mockReturnValue(defaultHookReturn);
  });
  it('renders Add admins button', () => {
    renderWithIntl(<InviteAdminsTable enterpriseId="test-enterprise" />);

    const addButton = screen.getByRole('button', { name: /add admins/i });
    expect(addButton).toBeInTheDocument();
  });

  it('opens AddAdminModal when Add admins button is clicked', async () => {
    renderWithIntl(<InviteAdminsTable enterpriseId="test-enterprise" />);

    // Modal should not be visible initially
    expect(screen.queryByTestId('add-admin-modal')).not.toBeInTheDocument();

    // Click Add admins button
    const addButton = screen.getByRole('button', { name: /add admins/i });
    await userEvent.click(addButton);

    // Modal should appear
    await waitFor(() => {
      expect(screen.getByTestId('add-admin-modal')).toBeInTheDocument();
      expect(screen.getByText(/Add Admin Modal - test-enterprise/i)).toBeInTheDocument();
    });
  });

  it('closes AddAdminModal when close button is clicked', async () => {
    renderWithIntl(<InviteAdminsTable enterpriseId="test-enterprise" />);

    // Open modal
    const addButton = screen.getByRole('button', { name: /add admins/i });
    await userEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByTestId('add-admin-modal')).toBeInTheDocument();
    });

    // Close modal
    const closeButton = screen.getByTestId('modal-close-button');
    await userEvent.click(closeButton);

    // Modal should be hidden
    await waitFor(() => {
      expect(screen.queryByTestId('add-admin-modal')).not.toBeInTheDocument();
    });
  });

  it('refreshes table data after successful admin addition', async () => {
    renderWithIntl(<InviteAdminsTable enterpriseId="test-enterprise" />);

    // Open modal
    const addButton = screen.getByRole('button', { name: /add admins/i });
    await userEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByTestId('add-admin-modal')).toBeInTheDocument();
    });

    // Clear any previous calls
    mockFetchEnterpriseAdminsTableData.mockClear();

    // Trigger success callback
    const successButton = screen.getByTestId('modal-success-button');
    await userEvent.click(successButton);

    // Should refresh table data
    await waitFor(() => {
      expect(mockFetchEnterpriseAdminsTableData).toHaveBeenCalledWith({
        pageIndex: 0,
        pageSize: 10,
        filters: [],
        sortBy: [{ id: 'name', desc: true }],
      });
    });

    // Modal should close
    await waitFor(() => {
      expect(screen.queryByTestId('add-admin-modal')).not.toBeInTheDocument();
    });
  });

  it('shows success toast after successful admin invite', async () => {
    renderWithIntl(<InviteAdminsTable enterpriseId="test-enterprise" />);

    const addButton = screen.getByRole('button', { name: /add admins/i });
    await userEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByTestId('add-admin-modal')).toBeInTheDocument();
    });

    const successButton = screen.getByTestId('modal-success-button');
    await userEvent.click(successButton);

    await waitFor(() => {
      expect(screen.getByText('Invite sent')).toBeInTheDocument();
    });
  });

  it('shows error toast after failed admin invite', async () => {
    renderWithIntl(<InviteAdminsTable enterpriseId="test-enterprise" />);

    const addButton = screen.getByRole('button', { name: /add admins/i });
    await userEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByTestId('add-admin-modal')).toBeInTheDocument();
    });

    const errorButton = screen.getByTestId('modal-error-button');
    await userEvent.click(errorButton);

    await waitFor(() => {
      expect(screen.getByText('Invite failed to send')).toBeInTheDocument();
    });
  });

  it('passes correct enterpriseId prop to AddAdminModal', async () => {
    const testEnterpriseId = 'my-enterprise-123';
    renderWithIntl(<InviteAdminsTable enterpriseId={testEnterpriseId} />);

    const addButton = screen.getByRole('button', { name: /add admins/i });
    await userEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(`Add Admin Modal - ${testEnterpriseId}`)).toBeInTheDocument();
    });
  });
});
