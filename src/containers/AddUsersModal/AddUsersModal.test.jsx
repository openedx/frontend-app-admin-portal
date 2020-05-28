import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import AddUsersModel from './index';
import subscribeEmailTemplate from '../../components/AddUsersModal/emailTemplate';

const mockStore = configureMockStore([thunk]);

const modelTitle = 'AABBCC';
const data = {};
const initialState = {
  portalConfiguration: {
    enterpriseId: 'test-enterprise',
  },
  emailTemplate: {
    loading: false,
    error: null,
    subscribe: {
      'email-template-greeting': subscribeEmailTemplate.greeting || '',
      'email-template-body': subscribeEmailTemplate.body,
      'email-template-closing': subscribeEmailTemplate.closing,
    },
  },
  subscriptionDetails: {
    licenses: {
      available: 1,
    },
  },
};

const UserSubscriptionModalWrapper = props => (
  <MemoryRouter>
    <Provider store={props.store}>
      <AddUsersModel
        title={modelTitle}
        onClose={() => {}}
        onSuccess={() => {}}
        {...props}
      />
    </Provider>
  </MemoryRouter>
);

UserSubscriptionModalWrapper.defaultProps = {
  store: mockStore(initialState),
};

UserSubscriptionModalWrapper.propTypes = {
  store: PropTypes.shape({}),
};

describe('UserSubscriptionModalWrapper', () => {
  let spy;

  afterEach(() => {
    if (spy) {
      spy.mockRestore();
    }
  });

  it('renders user subscription modal', () => {
    const wrapper = mount(<UserSubscriptionModalWrapper data={data} />);
    expect(wrapper.find('.modal-title span').text()).toEqual(modelTitle);
    expect(wrapper.find('.modal-title small').text()).toEqual('Add Subscriptions');

    expect(wrapper.find('.modal-body form h3').first().text()).toEqual('Add User');
  });
});
