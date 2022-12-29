import React from 'react';
import {
  screen,
  render,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
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

import EnrollBulkAction from './EnrollBulkAction';

jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});

/**
 * Instead of fighting to get the instantsearch mock, we simply mock out the AddcoursesStep
 * component for this test, and ensure it gets rendered.
 */
jest.mock('../../../../BulkEnrollmentPage/stepper/AddCoursesStep', () => ({
  __esModule: true,
  default: () => <div>Add courses step mock</div>,
}));

const mockStore = configureMockStore();
const initialStore = mockStore({
  portalConfiguration: {
    enterpriseId: TEST_ENTERPRISE_CUSTOMER_UUID,
    enterpriseSlug: TEST_ENTERPRISE_CUSTOMER_SLUG,
  },
});

// eslint-disable-next-line react/prop-types
const EnrollBulkActionWithProvider = ({ store = initialStore, ...rest }) => (
  <Provider store={store}>
    <EnrollBulkAction {...rest} />
  </Provider>
);

const mockOnEnrollSuccess = jest.fn();
const basicProps = {
  subscription: {
    uuid: TEST_SUBSCRIPTION_PLAN_UUID,
    enterpriseCustomerUuid: TEST_ENTERPRISE_CUSTOMER_UUID,
    enterpriseCatalogUuid: TEST_ENTERPRISE_CUSTOMER_CATALOG_UUID,
  },
  onEnrollSuccess: mockOnEnrollSuccess,
};

const email = 'foo@test.edx.org';
const testAssignedUser = { original: { status: ASSIGNED, email } };
const testActivatedUser = { original: { status: ACTIVATED, email } };
const testRevokedUser = { original: { status: REVOKED, email } };

describe('EnrollBulkAction', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render without receiving DataTable props yet', () => {
    render(<EnrollBulkActionWithProvider {...basicProps} />);
    const button = screen.getByText('Enroll (0)');
    expect(button.hasAttribute('disabled')).toBeTruthy();
  });

  it('includes assigned and activated learners, but ignores revoked in button count', () => {
    const props = {
      ...basicProps,
      selectedFlatRows: [testActivatedUser, testAssignedUser, testRevokedUser],
    };
    render(<EnrollBulkActionWithProvider {...props} />);
    screen.getByText('Enroll (2)');
  });

  it('shows warning dialog when at least 1 revoked learners selected', async () => {
    const props = {
      ...basicProps,
      selectedFlatRows: [testActivatedUser, testRevokedUser, testRevokedUser],
    };
    render(<EnrollBulkActionWithProvider {...props} />);
    const enrollButton = screen.getByText('Enroll (1)');
    expect(screen.queryByText('Revoked Learners Selected')).not.toBeInTheDocument();
    userEvent.click(enrollButton);
    const revokedTitle = await screen.findByText('Revoked Learners Selected');
    expect(revokedTitle).toBeVisible();
  });

  it('on clicking enroll in warning dialog, shows the bulk enrollment dialog', async () => {
    const props = {
      ...basicProps,
      selectedFlatRows: [testActivatedUser, testRevokedUser, testRevokedUser],
    };
    render(<EnrollBulkActionWithProvider {...props} />);
    const enrollButton = screen.getByText('Enroll (1)');
    userEvent.click(enrollButton);
    const enrollButtonInDialog = await screen.findByTestId('ENROLL_BTN_IN_WARNING_MODAL');
    userEvent.click(enrollButtonInDialog);
    // Note we mocked out the AddCoursesStep component above, so we expect whatever it renders, to be here.
    // this is sufficient for now to test that bulk enrollment dialog opens up
    const addCoursesTitle = await screen.findByText('Add courses step mock');
    expect(addCoursesTitle).toBeVisible();
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      TEST_ENTERPRISE_CUSTOMER_UUID,
      SUBSCRIPTION_TABLE_EVENTS.ENROLL_BULK_WARNING_MODAL_CONTINUE,
      {
        selected_users: 1,
        all_users_selected: false,
      },
    );
  });

  it('handles closing the warning dialog', async () => {
    const selectedFlatRows = [testActivatedUser, testRevokedUser, testRevokedUser];
    const props = {
      ...basicProps,
      selectedFlatRows,
    };
    render(<EnrollBulkActionWithProvider {...props} />);
    const enrollButton = screen.getByText('Enroll (1)');
    userEvent.click(enrollButton);
    const closeButtonInDialog = await screen.findByTestId('CLOSE_BTN_IN_WARNING_MODAL');
    userEvent.click(closeButtonInDialog);
    expect(screen.queryByText('Revoked Learners Selected')).not.toBeInTheDocument();
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      TEST_ENTERPRISE_CUSTOMER_UUID,
      SUBSCRIPTION_TABLE_EVENTS.ENROLL_BULK_WARNING_MODAL_CANCEL,
      {
        selected_users: 1,
        all_users_selected: false,
      },
    );
  });

  it('handles closing the bulk enroll dialog', async () => {
    const props = {
      ...basicProps,
      selectedFlatRows: [testActivatedUser],
    };
    render(<EnrollBulkActionWithProvider {...props} />);
    const enrollButton = screen.getByText('Enroll (1)');
    userEvent.click(enrollButton);
    const closeButtonInDialog = await screen.findByLabelText('Close');
    userEvent.click(closeButtonInDialog);
    expect(screen.queryByText('Subscription Enrollment')).not.toBeInTheDocument();
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      TEST_ENTERPRISE_CUSTOMER_UUID,
      SUBSCRIPTION_TABLE_EVENTS.ENROLL_BULK_CANCEL,
      {
        selected_users: 1,
        all_users_selected: false,
      },
    );
  });
});
