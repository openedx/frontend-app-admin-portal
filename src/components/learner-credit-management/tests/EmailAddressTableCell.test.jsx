import React from 'react';
import {
  screen,
  render,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import '@testing-library/jest-dom/extend-expect';

import EmailAddressTableCell from '../EmailAddressTableCell';

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));

const mockStore = configureMockStore();

const mockEnterpriseUUID = 'test-enterprise-uuid';
const mockContentAssignmentUUID = 'test-content-assignment-uuid';
const mockFulfillmentIdentifier = 'test-fulfillment-identifier';

const mockInitialState = {
  portalConfiguration: {
    enterpriseId: mockEnterpriseUUID,
  },
};

const EmailAddressTableCellWrapper = ({
  initialStoreState = mockInitialState,
  ...props
}) => (
  <Provider store={mockStore(initialStoreState)}>
    <EmailAddressTableCell {...props} />
  </Provider>
);

describe('<EmailAddressTableCell />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('with email is present, display it', () => {
    const userEmail = 'edx@example.com';
    const props = {
      tableId: 'spent',
      userEmail,
    };
    render(<EmailAddressTableCellWrapper {...props} />);
    expect(screen.getByText(userEmail));
  });

  it.each([
    { enterpriseEnrollmentId: 123 },
    { fulfillmentIdentifier: mockFulfillmentIdentifier },
    { contentAssignmentUUID: mockContentAssignmentUUID },
  ])('without email present, show popover message (%s)', async ({
    enterpriseEnrollmentId,
    fulfillmentIdentifier,
    contentAssignmentUUID,
  }) => {
    const props = {
      tableId: 'spent',
      userEmail: null,
      enterpriseEnrollmentId,
      fulfillmentIdentifier,
      contentAssignmentUUID,
    };
    render(<EmailAddressTableCellWrapper {...props} />);
    expect(screen.getByText('Email hidden'));
    userEvent.click(screen.getByLabelText('More details'));

    // Verify onEntered Segment event is called when popover opens
    await waitFor(() => expect(screen.findByText('Learner data disabled', { exact: false })));
    await waitFor(() => expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1));
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      mockEnterpriseUUID,
      'edx.ui.enterprise.admin_portal.learner-credit-management.spent.email-hidden-popover.opened',
      {
        enterpriseEnrollmentId,
        fulfillmentIdentifier,
        contentAssignmentUUID,
      },
    );

    // Verify onExited Segment event is called when popover is closed
    userEvent.click(screen.getByLabelText('More details'));
    await waitFor(() => {
      expect(screen.queryByText('Learner data disabled', { exact: false })).not.toBeInTheDocument();
    });
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(2);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      mockEnterpriseUUID,
      'edx.ui.enterprise.admin_portal.learner-credit-management.spent.email-hidden-popover.dismissed',
      {
        enterpriseEnrollmentId,
        fulfillmentIdentifier,
        contentAssignmentUUID,
      },
    );
  });
});
