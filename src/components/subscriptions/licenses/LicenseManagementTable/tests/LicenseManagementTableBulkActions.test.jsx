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
};

const testAssignedUser = { status: ASSIGNED };
const testActivatedUser = { status: ACTIVATED };
const testRevokedUser = { status: REVOKED };
const testUndefinedUser = { status: 'foo' };

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

  it('renders correct empty state', () => {
    render(<LicenseManagementTableBulkActionsWithContext {...basicProps} />);
    expect(screen.getAllByRole('button').length).toBe(3);
    expect(screen.getByText('Enroll')).toBeTruthy();
    expect(screen.getByText('Remind (0)')).toBeTruthy();
    expect(screen.getByTestId('revokeToggle')).toBeTruthy();
  });

  describe('renders correct label when not all users are selected ', () => {
    it('selected only revoked users', () => {
      const props = { ...basicProps, selectedUsers: [testRevokedUser, testRevokedUser] };
      render(<LicenseManagementTableBulkActionsWithContext {...props} />);
      expect(screen.getByText('Enroll')).toBeTruthy();
      expect(screen.getByText('Remind (0)')).toBeTruthy();
      const revokeMenu = screen.getByTestId('revokeToggle');
      act(() => {
        userEvent.click(revokeMenu);
      });
      expect(screen.getByText('Revoke (0)')).toBeTruthy();
    });
    it('selected only activated users', () => {
      const props = { ...basicProps, selectedUsers: [testActivatedUser] };
      render(<LicenseManagementTableBulkActionsWithContext {...props} />);
      expect(screen.getByText('Enroll')).toBeTruthy();
      expect(screen.getByText('Remind (0)')).toBeTruthy();
      const revokeMenu = screen.getByTestId('revokeToggle');
      act(() => {
        userEvent.click(revokeMenu);
      });
      expect(screen.getByText('Revoke (1)')).toBeTruthy();
    });
    it('selected only assigned users', () => {
      const props = { ...basicProps, selectedUsers: [testAssignedUser, testAssignedUser] };
      render(<LicenseManagementTableBulkActionsWithContext {...props} />);
      expect(screen.getByText('Enroll')).toBeTruthy();
      expect(screen.getByText('Remind (2)')).toBeTruthy();
      const revokeMenu = screen.getByTestId('revokeToggle');
      act(() => {
        userEvent.click(revokeMenu);
      });
      expect(screen.getByText('Revoke (2)')).toBeTruthy();
    });
    it('selected mix users', () => {
      const props = { ...basicProps, selectedUsers: [testRevokedUser, testActivatedUser, testAssignedUser] };
      render(<LicenseManagementTableBulkActionsWithContext {...props} />);
      expect(screen.getByText('Enroll')).toBeTruthy();
      expect(screen.getByText('Remind (1)')).toBeTruthy();
      const revokeMenu = screen.getByTestId('revokeToggle');
      act(() => {
        userEvent.click(revokeMenu);
      });
      expect(screen.getByText('Revoke (2)')).toBeTruthy();
    });
    it('selected undefined users', () => {
      const props = { ...basicProps, selectedUsers: [testUndefinedUser] };
      render(<LicenseManagementTableBulkActionsWithContext {...props} />);
      expect(screen.getByText('Enroll')).toBeTruthy();
      expect(screen.getByText('Remind (0)')).toBeTruthy();
      const revokeMenu = screen.getByTestId('revokeToggle');
      userEvent.click(revokeMenu);
      expect(screen.getByText('Revoke (0)')).toBeTruthy();
    });
  });

  it('renders correct label when all users are selected', () => {
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
    act(() => {
      userEvent.click(revokeMenu);
    });
    expect(screen.getByText('Revoke (2)')).toBeTruthy();
  });

  it('opens and closes remind modal', () => {
    const props = { ...basicProps, selectedUsers: [testAssignedUser] };
    render(<LicenseManagementTableBulkActionsWithContext {...props} />);
    // open dialog
    const remindButton = screen.getByText('Remind (1)');
    act(() => {
      userEvent.click(remindButton);
    });
    expect(screen.getByRole('dialog')).toBeTruthy();
    // close dialog
    const cancelButton = screen.getByText('Cancel');
    act(() => {
      userEvent.click(cancelButton);
    });
    expect(screen.queryByRole('dialog')).toBeFalsy();
  });

  it('opens and closes revoke modal', () => {
    const props = { ...basicProps, selectedUsers: [testAssignedUser] };
    render(<LicenseManagementTableBulkActionsWithContext {...props} />);
    // reveal revoke menu
    const revokeMenu = screen.getByTestId('revokeToggle');
    act(() => {
      userEvent.click(revokeMenu);
    });
    // open dialog
    const revokeButton = screen.getByText('Revoke (1)');
    act(() => {
      userEvent.click(revokeButton);
    });
    expect(screen.getByRole('dialog')).toBeTruthy();
    // close dialog
    const cancelButton = screen.getByText('Cancel');
    act(() => {
      userEvent.click(cancelButton);
    });
    expect(screen.queryByRole('dialog')).toBeFalsy();
  });
});
