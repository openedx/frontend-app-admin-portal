import React from 'react';
import {
  screen,
  render,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import moment from 'moment';
import '@testing-library/jest-dom/extend-expect';

import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { SUBSCRIPTION_TABLE_EVENTS } from '../../../../../eventTracking';

import {
  ASSIGNED,
  ACTIVATED,
  REVOKED,
} from '../../../data/constants';
import {
  TEST_ENTERPRISE_CUSTOMER_UUID,
  TEST_SUBSCRIPTION_PLAN_UUID,
  TEST_ENTERPRISE_CUSTOMER_CATALOG_UUID,
  TEST_ENTERPRISE_CUSTOMER_SLUG,
} from '../../../tests/TestUtilities';

import RevokeBulkAction from './RevokeBulkAction';

jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});

const mockStore = configureMockStore();
const initialStore = mockStore({
  portalConfiguration: {
    enterpriseId: TEST_ENTERPRISE_CUSTOMER_UUID,
    enterpriseSlug: TEST_ENTERPRISE_CUSTOMER_SLUG,
  },
});

// eslint-disable-next-line react/prop-types
function RevokeBulkActionWithProvider({ store = initialStore, ...rest }) {
  return (
    <Provider store={store}>
      <RevokeBulkAction {...rest} />
    </Provider>
  );
}

const mockOnRevokeSuccess = jest.fn();
const basicProps = {
  subscription: {
    uuid: TEST_SUBSCRIPTION_PLAN_UUID,
    enterpriseCustomerUuid: TEST_ENTERPRISE_CUSTOMER_UUID,
    enterpriseCatalogUuid: TEST_ENTERPRISE_CUSTOMER_CATALOG_UUID,
    expirationDate: moment().add(1, 'year').toISOString(),
    isRevocationCapEnabled: false,
  },
  onRevokeSuccess: mockOnRevokeSuccess,
  activatedUsersCount: 0,
  assignedUsersCount: 0,
  revokedUsersCount: 0,
};

const email = 'foo@test.edx.org';
const testAssignedUser = { original: { status: ASSIGNED, email } };
const testActivatedUser = { original: { status: ACTIVATED, email } };
const testRevokedUser = { original: { status: REVOKED, email } };

describe('RevokeBulkAction', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render without receiving DataTable props yet', () => {
    render(<RevokeBulkActionWithProvider {...basicProps} />);
    const button = screen.getByText('Revoke (0)');
    expect(button.hasAttribute('disabled')).toBeTruthy();
  });

  it('includes revocable learners only in button count', () => {
    const props = {
      ...basicProps,
      selectedFlatRows: [testActivatedUser, testAssignedUser, testRevokedUser],
    };
    render(<RevokeBulkActionWithProvider {...props} />);
    screen.getByText('Revoke (2)');
  });

  describe('handles any applied filters with entire table selected', () => {
    it('no active filters, uses total activated + assigned users count', () => {
      const props = {
        ...basicProps,
        isEntireTableSelected: true,
        tableInstance: {
          itemCount: 20,
          clearSelection: jest.fn(),
          columns: [{
            id: 'statusBadge',
            filter: 'statusBadge',
            filterValue: null,
          }],
        },
        activatedUsersCount: 10,
        assignedUsersCount: 10,
      };
      render(<RevokeBulkActionWithProvider {...props} />);
      screen.getByText('Revoke (20)');
    });

    it('has revoked status filter', () => {
      const props = {
        ...basicProps,
        isEntireTableSelected: true,
        tableInstance: {
          itemCount: 20,
          clearSelection: jest.fn(),
          columns: [{
            id: 'statusBadge',
            filter: 'statusBadge',
            filterValue: ['revoked'],
          }],
        },
        revokedUsersCount: 5,
      };
      render(<RevokeBulkActionWithProvider {...props} />);
      screen.getByText('Revoke (15)');
    });

    it('has activated or assigned status filter', () => {
      const props = {
        ...basicProps,
        isEntireTableSelected: true,
        tableInstance: {
          itemCount: 20,
          clearSelection: jest.fn(),
          columns: [{
            id: 'statusBadge',
            filter: 'statusBadge',
            filterValue: ['activated', 'assigned'],
          }],
        },
      };
      render(<RevokeBulkActionWithProvider {...props} />);
      screen.getByText('Revoke (20)');
    });

    it('has both activated and revoked status filter', () => {
      const props = {
        ...basicProps,
        isEntireTableSelected: true,
        tableInstance: {
          itemCount: 20,
          clearSelection: jest.fn(),
          columns: [{
            id: 'statusBadge',
            filter: 'statusBadge',
            filterValue: ['activated', 'revoked'],
          }],
        },
        revokedUsersCount: 5,
      };
      render(<RevokeBulkActionWithProvider {...props} />);
      screen.getByText('Revoke (15)');
    });

    it('has email filter', () => {
      const props = {
        ...basicProps,
        isEntireTableSelected: true,
        tableInstance: {
          itemCount: 20,
          clearSelection: jest.fn(),
          columns: [{
            id: 'emailLabel',
            filter: 'emailLabel',
            filterValue: 'test@example.com',
          }],
        },
        revokedUsersCount: 5,
      };
      render(<RevokeBulkActionWithProvider {...props} />);
      screen.getByText('Revoke (15)');
    });
  });

  it('shows revoke dialog when action is clicked', async () => {
    const props = {
      ...basicProps,
      selectedFlatRows: [testActivatedUser, testRevokedUser],
    };
    render(<RevokeBulkActionWithProvider {...props} />);
    const enrollButton = screen.getByText('Revoke (1)');
    expect(screen.queryByText('Revoke License')).not.toBeInTheDocument();
    userEvent.click(enrollButton);
    const revokeTitle = await screen.findByText('Revoke License');
    expect(revokeTitle).toBeVisible();
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      TEST_ENTERPRISE_CUSTOMER_UUID,
      SUBSCRIPTION_TABLE_EVENTS.REVOKE_BULK_CLICK,
      {
        selected_users: 1,
        all_users_selected: false,
      },
    );
  });

  it('handles when revoke dialog is closed', async () => {
    const props = {
      ...basicProps,
      selectedFlatRows: [testActivatedUser, testRevokedUser],
    };
    render(<RevokeBulkActionWithProvider {...props} />);
    const enrollButton = screen.getByText('Revoke (1)');
    userEvent.click(enrollButton);
    const revokeTitle = await screen.findByText('Revoke License');
    expect(revokeTitle).toBeVisible();
    const cancelButtonInDialog = await screen.findByText('Cancel');
    userEvent.click(cancelButtonInDialog);
    expect(screen.queryByText('Revoke License')).not.toBeInTheDocument();
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      TEST_ENTERPRISE_CUSTOMER_UUID,
      SUBSCRIPTION_TABLE_EVENTS.REVOKE_BULK_CANCEL,
      {
        selected_users: 1,
        all_users_selected: false,
      },
    );
  });
});
