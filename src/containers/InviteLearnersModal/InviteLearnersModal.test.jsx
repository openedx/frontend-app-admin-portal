import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  render,
} from '@testing-library/react';
import InviteLearnersModal from './index';

import * as licenseManagerApi from '../../data/services/LicenseManagerAPIService';

const mockStore = configureMockStore([thunk]);

jest.mock('../../data/services/LicenseManagerAPIService', () => ({
  licenseAssign: jest.fn(),
}));

const initialFormValues = {
  'email-template-greeting': 'Hello!',
  'email-template-body': 'Welcome to edX!',
  'notify-users': false,
  'email-addresses': 'test@edx.org',
};

const initialState = {
  portalConfiguration: {
    enterpriseId: 'test-enterprise',
    contactEmail: 'fake@example.com',
  },
  subscriptionDetails: {
    licenses: {
      available: 1,
    },
  },
  form: {
    'license-assignment-modal-form': {
      values: initialFormValues,
    },
  },
};

const mockSubscriptionUUID = 'foo';

const InviteLearnersModalWrapper = props => (
  <MemoryRouter>
    <Provider store={props.store}>
      <InviteLearnersModal
        availableSubscriptionCount={10}
        onClose={() => {}}
        onSuccess={() => {}}
        subscriptionUUID={mockSubscriptionUUID}
        {...props}
      />
    </Provider>
  </MemoryRouter>
);

InviteLearnersModalWrapper.defaultProps = {
  store: mockStore(initialState),
};

InviteLearnersModalWrapper.propTypes = {
  store: PropTypes.shape({}),
};

describe('UserSubscriptionModalWrapper', () => {
  let spy;

  afterEach(() => {
    if (spy) {
      spy.mockRestore();
    }
  });

  it('renders user licenses modal', () => {
    const { getByText } = render(<InviteLearnersModalWrapper />);
    expect(getByText('Add Users'));
  });

  it('calls licenseAssign with the correct params', async () => {
    const { getAllByText } = render(<InviteLearnersModalWrapper />);
    getAllByText('Invite learners')[1].click();

    const options = {
      template: initialFormValues['email-template-body'],
      greeting: initialFormValues['email-template-greeting'],
      closing: initialFormValues['email-template-closing'],
      notify_users: initialFormValues['notify-users'],
      user_emails: initialFormValues['email-addresses'].split(' '),
    };
    expect(licenseManagerApi.licenseAssign).toHaveBeenCalledWith(options, mockSubscriptionUUID);
  });
});
