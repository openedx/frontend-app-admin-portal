import React from 'react';
import {
  act,
  screen,
  render,
  cleanup,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import moment from 'moment';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';

import LicenseManagementTableBulkActions from '../LicenseManagementTableBulkActions';
import {
  ASSIGNED,
  ACTIVATED,
  REVOKED,
} from '../../../data/constants';

const mockStore = configureMockStore();
const store = mockStore({
  portalConfiguration: {
    enterpriseId: 'test-enterprise-id',
  },
});

const basicProps = {
  selectedUsers: [],
  onRemindSuccess: () => {},
  onRevokeSuccess: () => {},
  allUsersSelected: false,
  activatedUsers: 0,
  assignedUsers: 0,
  subscription: {
    uuid: '1',
    expirationDate: moment().add(1, 'days').format(),
    isRevocationCapEnabled: false,
    revocations: {
      applied: 0,
      remaining: 10,
    },
  },
  enrollmentLink: 'link',
};

const email = 'foo@test.edx.org';
const testAssignedUser = { status: ASSIGNED, email };
const testActivatedUser = { status: ACTIVATED, email };
const testRevokedUser = { status: REVOKED, email };
const testUndefinedUser = { status: 'foo', email };

const LicenseManagementTableBulkActionsWithContext = (props) => (
  <Provider store={store}>
    <LicenseManagementTableBulkActions {...props} />
  </Provider>
);

describe('<LicenseManagementTableBulkActions />', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });
  const testDialogClosed = () => {
    const cancelButton = screen.getByText('Cancel');
    act(() => {
      userEvent.click(cancelButton);
    });
    expect(screen.queryByRole('dialog')).toBeFalsy();
  };

  it('renders correct empty state', () => {
    render(<LicenseManagementTableBulkActionsWithContext {...basicProps} />);
    expect(screen.getAllByRole('button').length).toBe(2);
    expect(screen.getByText('Enroll')).toBeTruthy();
    expect(screen.getByText('Remind (0)')).toBeTruthy();
    expect(screen.getByTestId('revokeToggle')).toBeTruthy();
  });

  describe('renders correct label when not all users are selected ', () => {
    it('selected only revoked users', async () => {
      const props = { ...basicProps, selectedUsers: [testRevokedUser, testRevokedUser] };
      render(<LicenseManagementTableBulkActionsWithContext {...props} />);
      expect(screen.getByText('Enroll')).toBeTruthy();
      expect(screen.getByText('Remind (0)')).toBeTruthy();
      const revokeMenu = screen.getByTestId('revokeToggle');
      await act(async () => {
        await userEvent.click(revokeMenu);
      });
      expect(screen.getByText('Revoke (0)')).toBeTruthy();
    });
    it('selected only activated users', async () => {
      const props = { ...basicProps, selectedUsers: [testActivatedUser] };
      render(<LicenseManagementTableBulkActionsWithContext {...props} />);
      expect(screen.getByText('Enroll')).toBeTruthy();
      expect(screen.getByText('Remind (0)')).toBeTruthy();
      const revokeMenu = screen.getByTestId('revokeToggle');
      await act(async () => {
        await userEvent.click(revokeMenu);
      });
      expect(screen.getByText('Revoke (1)')).toBeTruthy();
    });
    it('selected only assigned users', async () => {
      const props = { ...basicProps, selectedUsers: [testAssignedUser, testAssignedUser] };
      render(<LicenseManagementTableBulkActionsWithContext {...props} />);
      expect(screen.getByText('Enroll')).toBeTruthy();
      expect(screen.getByText('Remind (2)')).toBeTruthy();
      const revokeMenu = screen.getByTestId('revokeToggle');
      await act(async () => {
        await userEvent.click(revokeMenu);
      });
      expect(screen.getByText('Revoke (2)')).toBeTruthy();
    });
    it('selected mix users', async () => {
      const props = { ...basicProps, selectedUsers: [testRevokedUser, testActivatedUser, testAssignedUser] };
      render(<LicenseManagementTableBulkActionsWithContext {...props} />);
      expect(screen.getByText('Enroll')).toBeTruthy();
      expect(screen.getByText('Remind (1)')).toBeTruthy();
      const revokeMenu = screen.getByTestId('revokeToggle');
      await act(async () => {
        await userEvent.click(revokeMenu);
      });
      expect(screen.getByText('Revoke (2)')).toBeTruthy();
    });
    it('selected undefined users', async () => {
      const props = { ...basicProps, selectedUsers: [testUndefinedUser] };
      render(<LicenseManagementTableBulkActionsWithContext {...props} />);
      expect(screen.getByText('Enroll')).toBeTruthy();
      expect(screen.getByText('Remind (0)')).toBeTruthy();
      const revokeMenu = screen.getByTestId('revokeToggle');
      await act(async () => {
        await userEvent.click(revokeMenu);
      });
      expect(screen.getByText('Revoke (0)')).toBeTruthy();
    });
  });

  it('renders correct label when all users are selected', async () => {
    const props = {
      ...basicProps,
      allUsersSelected: true,
      activatedUsers: 1,
      assignedUsers: 1,
    };
    render(<LicenseManagementTableBulkActionsWithContext {...props} />);
    expect(screen.getByText('Enroll')).toBeTruthy();
    expect(screen.getByText('Remind (1)')).toBeTruthy();
    const revokeMenu = screen.getByTestId('revokeToggle');
    await act(async () => {
      await userEvent.click(revokeMenu);
    });
    expect(screen.getByText('Revoke (2)')).toBeTruthy();
  });

  it('opens and closes remind modal', async () => {
    const props = { ...basicProps, selectedUsers: [testAssignedUser] };
    render(<LicenseManagementTableBulkActionsWithContext {...props} />);
    // Open dialog
    const remindButton = screen.getByText('Remind (1)');
    await act(async () => {
      await userEvent.click(remindButton);
    });
    expect(screen.getByRole('dialog')).toBeTruthy();
    // Close dialog
    testDialogClosed();
  });

  it('opens and closes revoke modal', async () => {
    const props = { ...basicProps, selectedUsers: [testAssignedUser] };
    render(<LicenseManagementTableBulkActionsWithContext {...props} />);
    // Reveal revoke menu
    const revokeMenu = screen.getByTestId('revokeToggle');
    await act(async () => {
      await userEvent.click(revokeMenu);
    });
    // Open dialog
    const revokeButton = screen.getByText('Revoke (1)');
    await act(async () => {
      userEvent.click(revokeButton);
    });
    expect(screen.getByRole('dialog')).toBeTruthy();
    // Close dialog
    testDialogClosed();
  });
});
