import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import InviteLearnersModal from './index';

const mockStore = configureMockStore([thunk]);

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
};

function InviteLearnersModalWrapper(props) {
  return (
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
}

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
    const wrapper = mount(<InviteLearnersModalWrapper data={{}} />);
    expect(wrapper.find('.modal-body form h3').first().text()).toEqual('Add Users');
  });
});
