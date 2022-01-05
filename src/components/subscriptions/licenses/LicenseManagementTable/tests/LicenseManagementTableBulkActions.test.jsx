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
import '@testing-library/jest-dom/extend-expect';

import '../../../../../../__mocks__/react-instantsearch-dom';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { SUBSCRIPTION_TABLE_EVENTS } from '../../../../../eventTracking';
import LicenseManagementTableBulkActions from '../LicenseManagementTableBulkActions';

import {
  ASSIGNED,
  ACTIVATED,
  REVOKED,
} from '../../../data/constants';
import {
  TEST_ENTERPRISE_CUSTOMER_UUID,
  TEST_SUBSCRIPTION_PLAN_UUID,
} from '../../../tests/TestUtilities';

jest.mock('@edx/frontend-enterprise-utils', () => ({
  sendEnterpriseTrackEvent: jest.fn(),
}));

/**
 * Instead of fighting to get the instantsearch mock, we simply mock out the AddcoursesStep
 * component for this test, and ensure it gets rendered.
 */
jest.mock('../../../../BulkEnrollmentPage/stepper/AddCoursesStep', () => ({
  __esModule: true,
  default: () => <div>Add courses step mock</div>,
}));

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
  onEnrollSuccess: () => {},
  allUsersSelected: false,
  activatedUsersCount: 0,
  assignedUsersCount: 0,
  revokedUsersCount: 0,
  subscription: {
    uuid: TEST_SUBSCRIPTION_PLAN_UUID,
    enterpriseCustomerUuid: TEST_ENTERPRISE_CUSTOMER_UUID,
    expirationDate: moment().add(1, 'days').format(),
    isRevocationCapEnabled: false,
    revocations: {
      applied: 0,
      remaining: 10,
    },
  },
  activeFilters: [],
  tableItemCount: 0,
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
    expect(screen.getAllByRole('button').length).toBe(3);
    expect(screen.queryByText('Enroll (0)')).toBeInTheDocument();
    expect(screen.queryByText('Remind (0)')).toBeInTheDocument();
    expect(screen.queryByTestId('revokeToggle')).toBeInTheDocument();
  });

  describe('bulk enrollment bulk actions', () => {
    it('shows warning dialog when at least 1 revoked learners selected', async () => {
      const props = { ...basicProps, selectedUsers: [testActivatedUser, testRevokedUser, testRevokedUser] };
      render(<LicenseManagementTableBulkActionsWithContext {...props} />);
      const enrollButton = screen.getByText('Enroll (1)');
      let revokedTitle = screen.queryByText('Revoked Learners Selected');
      expect(revokedTitle).toBeNull();
      userEvent.click(enrollButton);
      revokedTitle = await screen.findByText('Revoked Learners Selected');
      expect(revokedTitle).toBeVisible();
    });
    it('on clicking enroll in warning dialog, shows the bulk enrollment dialog', async () => {
      const props = { ...basicProps, selectedUsers: [testActivatedUser, testRevokedUser, testRevokedUser] };
      render(<LicenseManagementTableBulkActionsWithContext {...props} />);
      const enrollButton = screen.getByText('Enroll (1)');
      userEvent.click(enrollButton);
      const enrollButtonInDialog = await screen.findByTestId('ENROLL_BTN_IN_WARNING_MODAL');
      userEvent.click(enrollButtonInDialog);
      // Note we mocked out the AddCoursesStep comonent above, so we expect whatever it renders, to be here.
      // this is sufficient for now to test that bulk enrollment dialog opens up
      const addCoursesTitle = await screen.findByText('Add courses step mock');
      expect(addCoursesTitle).toBeVisible();
    });
  });

  describe('renders correct label', () => {
    it('selected only revoked users', async () => {
      const props = { ...basicProps, selectedUsers: [testRevokedUser, testRevokedUser] };
      render(<LicenseManagementTableBulkActionsWithContext {...props} />);
      expect(screen.getByText('Enroll (0)'));
      expect(screen.getByText('Remind (0)'));
      const revokeMenu = screen.getByTestId('revokeToggle');
      await act(async () => {
        await userEvent.click(revokeMenu);
      });
      expect(screen.getByText('Revoke (0)'));
    });
    it('selected only activated users', async () => {
      const props = { ...basicProps, selectedUsers: [testActivatedUser] };
      render(<LicenseManagementTableBulkActionsWithContext {...props} />);
      expect(screen.getByText('Enroll (1)'));
      expect(screen.getByText('Remind (0)'));
      const revokeMenu = screen.getByTestId('revokeToggle');
      await act(async () => {
        await userEvent.click(revokeMenu);
      });
      expect(screen.getByText('Revoke (1)'));
    });
    it('selected only assigned users', async () => {
      const props = { ...basicProps, selectedUsers: [testAssignedUser, testAssignedUser] };
      render(<LicenseManagementTableBulkActionsWithContext {...props} />);
      expect(screen.getByText('Enroll (2)'));
      expect(screen.getByText('Remind (2)'));
      const revokeMenu = screen.getByTestId('revokeToggle');
      await act(async () => {
        await userEvent.click(revokeMenu);
      });
      expect(screen.getByText('Revoke (2)'));
    });
    it('selected mix users', async () => {
      const props = { ...basicProps, selectedUsers: [testRevokedUser, testActivatedUser, testAssignedUser] };
      render(<LicenseManagementTableBulkActionsWithContext {...props} />);
      expect(screen.getByText('Enroll (2)'));
      expect(screen.getByText('Remind (1)'));
      const revokeMenu = screen.getByTestId('revokeToggle');
      await act(async () => {
        await userEvent.click(revokeMenu);
      });
      expect(screen.getByText('Revoke (2)'));
    });
    it('selected undefined users', async () => {
      const props = { ...basicProps, selectedUsers: [testUndefinedUser] };
      render(<LicenseManagementTableBulkActionsWithContext {...props} />);
      expect(screen.getByText('Enroll (0)'));
      expect(screen.getByText('Remind (0)'));
      const revokeMenu = screen.getByTestId('revokeToggle');
      await act(async () => {
        await userEvent.click(revokeMenu);
      });
      expect(screen.getByText('Revoke (0)')).toBeInTheDocument();
    });
    it('when all users are selected', async () => {
      const props = {
        ...basicProps,
        allUsersSelected: true,
        activatedUsersCount: 1,
        assignedUsersCount: 1,
      };
      render(<LicenseManagementTableBulkActionsWithContext {...props} />);
      expect(screen.getByText('Enroll (0)'));
      expect(screen.getByText('Remind (1)'));
      const revokeMenu = screen.getByTestId('revokeToggle');
      await act(async () => {
        await userEvent.click(revokeMenu);
      });
      expect(screen.getByText('Revoke (2)'));
    });
    it('when all users are selected with an email filter', async () => {
      const props = {
        ...basicProps,
        allUsersSelected: true,
        activatedUsersCount: 1,
        assignedUsersCount: 1,
        activeFilters: [{
          name: 'emailLabel',
          filterValue: 'email@',
        }],
      };
      render(<LicenseManagementTableBulkActionsWithContext {...props} />);
      expect(screen.getByText('Remind all'));
      const revokeMenu = screen.getByTestId('revokeToggle');
      await act(async () => {
        await userEvent.click(revokeMenu);
      });
      expect(screen.getByText('Revoke all'));
    });
    it('when all users are selected with only the status filter', async () => {
      const activatedUsersCount = 3;
      const assignedUsersCount = 2;
      const revokedUsersCount = 1;
      const props = {
        ...basicProps,
        allUsersSelected: true,
        activatedUsersCount,
        assignedUsersCount,
        revokedUsersCount,
        activeFilters: [{
          name: 'statusBadge',
          filterValue: ['activated', 'assigned', 'revoked'],
        }],
        tableItemCount: 6,
      };
      render(<LicenseManagementTableBulkActionsWithContext {...props} />);
      expect(screen.getByText(`Remind (${assignedUsersCount})`));
      const revokeMenu = screen.getByTestId('revokeToggle');
      await act(async () => {
        await userEvent.click(revokeMenu);
      });
      expect(screen.getByText(`Revoke (${assignedUsersCount + activatedUsersCount})`));
    });
    it('when all users are selected with only the status filter but revoked users are not selected', async () => {
      const props = {
        ...basicProps,
        allUsersSelected: true,
        activeFilters: [{
          name: 'statusBadge',
          filterValue: ['activated', 'assigned'],
        }],
        tableItemCount: 99,
      };
      render(<LicenseManagementTableBulkActionsWithContext {...props} />);
      expect(screen.getByText('Remind (99)'));
      const revokeMenu = screen.getByTestId('revokeToggle');
      await act(async () => {
        await userEvent.click(revokeMenu);
      });
      expect(screen.getByText('Revoke (99)'));
    });
  });
  it('opens and closes remind modal', async () => {
    const props = { ...basicProps, selectedUsers: [testAssignedUser] };
    render(<LicenseManagementTableBulkActionsWithContext {...props} />);
    // Open dialog
    const remindButton = screen.getByText('Remind (1)');
    await act(async () => {
      await userEvent.click(remindButton);
    });
    // Event is sent when open
    const eventPayload = { selected_users: 1, all_users_selected: false };
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      TEST_ENTERPRISE_CUSTOMER_UUID,
      SUBSCRIPTION_TABLE_EVENTS.REMIND_BULK_CLICK,
      eventPayload,
    );
    expect(screen.getByRole('dialog'));
    // Close dialog
    testDialogClosed();
    // Event is sent when cancel
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      TEST_ENTERPRISE_CUSTOMER_UUID,
      SUBSCRIPTION_TABLE_EVENTS.REMIND_BULK_CANCEL,
      eventPayload,
    );
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
    // Event is sent when open
    const eventPayload = { selected_users: 1, all_users_selected: false };
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      TEST_ENTERPRISE_CUSTOMER_UUID,
      SUBSCRIPTION_TABLE_EVENTS.REVOKE_BULK_CLICK,
      eventPayload,
    );
    expect(screen.getByRole('dialog'));
    // Close dialog
    testDialogClosed();
    // Event is sent when cancel
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      TEST_ENTERPRISE_CUSTOMER_UUID,
      SUBSCRIPTION_TABLE_EVENTS.REVOKE_BULK_CANCEL,
      eventPayload,
    );
  });
});
