import React from 'react';
import {
  screen,
  render,
  cleanup,
} from '@testing-library/react';

import LicenseManagementTableBulkActions from '../LicenseManagementTableBulkActions';
import {
  ASSIGNED,
  ACTIVATED,
  REVOKED,
} from '../../../data/constants';

const basicProps = {
  selectedUsers: [],
  bulkRemindOnClick: () => {},
  bulkRevokeOnClick: () => {},
  allUsersSelected: false,
  activatedUsers: 0,
  assignedUsers: 0,
};

const testAssignedUser = { status: ASSIGNED };
const testActivatedUser = { status: ACTIVATED };
const testRevokedUser = { status: REVOKED };
const testUndefinedUser = { status: 'foo' };

describe('<LicenseManagementTableBulkActions />', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('renders correct empty state', () => {
    render(<LicenseManagementTableBulkActions {...basicProps} />);
    expect(screen.getAllByRole('button').length).toBe(2);
    expect(screen.getByText('Revoke (0)')).toBeTruthy();
    expect(screen.getByText('Remind (0)')).toBeTruthy();
  });

  describe('renders correct label when not all users are selected ', () => {
    it('selected only revoked users', () => {
      const props = { ...basicProps, selectedUsers: [testRevokedUser, testRevokedUser] };
      render(<LicenseManagementTableBulkActions {...props} />);
      expect(screen.getByText('Revoke (0)')).toBeTruthy();
      expect(screen.getByText('Remind (0)')).toBeTruthy();
    });
    it('selected only activated users', () => {
      const props = { ...basicProps, selectedUsers: [testActivatedUser] };
      render(<LicenseManagementTableBulkActions {...props} />);
      expect(screen.getByText('Revoke (1)')).toBeTruthy();
      expect(screen.getByText('Remind (0)')).toBeTruthy();
    });
    it('selected only assigned users', () => {
      const props = { ...basicProps, selectedUsers: [testAssignedUser, testAssignedUser] };
      render(<LicenseManagementTableBulkActions {...props} />);
      expect(screen.getByText('Revoke (2)')).toBeTruthy();
      expect(screen.getByText('Remind (2)')).toBeTruthy();
    });
    it('selected mix users', () => {
      const props = { ...basicProps, selectedUsers: [testRevokedUser, testActivatedUser, testAssignedUser] };
      render(<LicenseManagementTableBulkActions {...props} />);
      expect(screen.getByText('Revoke (2)')).toBeTruthy();
      expect(screen.getByText('Remind (1)')).toBeTruthy();
    });
    it('selected undefined users', () => {
      const props = { ...basicProps, selectedUsers: [testUndefinedUser] };
      render(<LicenseManagementTableBulkActions {...props} />);
      expect(screen.getByText('Revoke (0)')).toBeTruthy();
      expect(screen.getByText('Remind (0)')).toBeTruthy();
    });
  });
  it('renders correct label when all users are selected', () => {
    const props = {
      ...basicProps,
      allUsersSelected: true,
      activatedUsers: 1,
      assignedUsers: 1,
    };
    render(<LicenseManagementTableBulkActions {...props} />);
    expect(screen.getByText('Revoke (2)')).toBeTruthy();
    expect(screen.getByText('Remind (1)')).toBeTruthy();
  });
});
