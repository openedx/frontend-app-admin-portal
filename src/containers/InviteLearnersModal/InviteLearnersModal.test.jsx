import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import InviteLearnersModal from './index';
import subscribeEmailTemplate from '../../components/InviteLearnersModal/emailTemplate';

const mockStore = configureMockStore([thunk]);

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

const InviteLearnersModalWrapper = props => (
  <MemoryRouter>
    <Provider store={props.store}>
      <InviteLearnersModal
        availableSubscriptionCount={10}
        onClose={() => {}}
        onSuccess={() => {}}
        subscriptionUUID="foo"
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
    const wrapper = mount(<InviteLearnersModalWrapper data={data} />);
    expect(wrapper.find('.modal-body form h3').first().text()).toEqual('Add Users');
  });
});
