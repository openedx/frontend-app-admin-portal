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

import RemindBulkAction from './RemindBulkAction';

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
function RemindBulkActionWithProvider({ store = initialStore, ...rest }) {
  return (
    <Provider store={store}>
      <RemindBulkAction {...rest} />
    </Provider>
  );
}

const mockOnRemindSuccess = jest.fn();
const basicProps = {
  subscription: {
    uuid: TEST_SUBSCRIPTION_PLAN_UUID,
    enterpriseCustomerUuid: TEST_ENTERPRISE_CUSTOMER_UUID,
    enterpriseCatalogUuid: TEST_ENTERPRISE_CUSTOMER_CATALOG_UUID,
    expirationDate: moment().add(1, 'year').toISOString(),
  },
  onRemindSuccess: mockOnRemindSuccess,
  activatedUsersCount: 0,
  assignedUsersCount: 0,
  revokedUsersCount: 0,
};

const email = 'foo@test.edx.org';
const testAssignedUser = { original: { status: ASSIGNED, email } };
const testActivatedUser = { original: { status: ACTIVATED, email } };
const testRevokedUser = { original: { status: REVOKED, email } };

describe('RemindBulkAction', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render without receiving DataTable props yet', () => {
    render(<RemindBulkActionWithProvider {...basicProps} />);
    const button = screen.getByText('Remind (0)');
    expect(button.hasAttribute('disabled')).toBeTruthy();
  });

  it('includes assigned learners only in button count', () => {
    const props = {
      ...basicProps,
      selectedFlatRows: [testActivatedUser, testAssignedUser, testRevokedUser],
    };
    render(<RemindBulkActionWithProvider {...props} />);
    screen.getByText('Remind (1)');
  });

  describe('handles any applied filters with entire table selected', () => {
    it('no active filters, uses total assigned users count', () => {
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
        assignedUsersCount: 10,
      };
      render(<RemindBulkActionWithProvider {...props} />);
      screen.getByText('Remind (10)');
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
      render(<RemindBulkActionWithProvider {...props} />);
      screen.getByText('Remind (15)');
    });

    it('has activated status filter', () => {
      const props = {
        ...basicProps,
        isEntireTableSelected: true,
        tableInstance: {
          itemCount: 20,
          clearSelection: jest.fn(),
          columns: [{
            id: 'statusBadge',
            filter: 'statusBadge',
            filterValue: ['activated'],
          }],
        },
        activatedUsersCount: 5,
      };
      render(<RemindBulkActionWithProvider {...props} />);
      screen.getByText('Remind (15)');
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
        activatedUsersCount: 5,
        revokedUsersCount: 5,
      };
      render(<RemindBulkActionWithProvider {...props} />);
      screen.getByText('Remind (10)');
    });

    it('has assigned status filter', () => {
      const props = {
        ...basicProps,
        isEntireTableSelected: true,
        tableInstance: {
          itemCount: 20,
          clearSelection: jest.fn(),
          columns: [{
            id: 'statusBadge',
            filter: 'statusBadge',
            filterValue: ['assigned'],
          }],
        },
      };
      render(<RemindBulkActionWithProvider {...props} />);
      screen.getByText('Remind (20)');
    });
  });

  it('shows remind dialog when action is clicked', async () => {
    const props = {
      ...basicProps,
      selectedFlatRows: [testActivatedUser, testAssignedUser],
    };
    render(<RemindBulkActionWithProvider {...props} />);
    const enrollButton = screen.getByText('Remind (1)');
    expect(screen.queryByText('Remind User')).not.toBeInTheDocument();
    userEvent.click(enrollButton);
    const remindTitle = await screen.findByText('Remind User');
    expect(remindTitle).toBeVisible();
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      TEST_ENTERPRISE_CUSTOMER_UUID,
      SUBSCRIPTION_TABLE_EVENTS.REMIND_BULK_CLICK,
      {
        selected_users: 1,
        all_users_selected: false,
      },
    );
  });

  it('handles when remind dialog is closed', async () => {
    const props = {
      ...basicProps,
      selectedFlatRows: [testActivatedUser, testAssignedUser],
    };
    render(<RemindBulkActionWithProvider {...props} />);
    const enrollButton = screen.getByText('Remind (1)');
    userEvent.click(enrollButton);
    const remindTitle = await screen.findByText('Remind User');
    expect(remindTitle).toBeVisible();
    const cancelButtonInDialog = await screen.findByText('Cancel');
    userEvent.click(cancelButtonInDialog);
    expect(screen.queryByText('Remind User')).not.toBeInTheDocument();
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      TEST_ENTERPRISE_CUSTOMER_UUID,
      SUBSCRIPTION_TABLE_EVENTS.REMIND_BULK_CANCEL,
      {
        selected_users: 1,
        all_users_selected: false,
      },
    );
  });
});
