import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import LicenseRemindModal from './index';

const mockStore = configureMockStore([thunk]);

const user = {
  userEmail: 'edx@example.com',
};
const pendingUsersCount = 5;

const LicenseRemindModalWrapper = props => (
  <MemoryRouter>
    <Provider store={props.store}>
      <LicenseRemindModal
        user={user}
        onClose={() => {}}
        onSuccess={() => {}}
        {...props}
      />
    </Provider>
  </MemoryRouter>
);

LicenseRemindModalWrapper.defaultProps = {
  store: mockStore({}),
};

LicenseRemindModalWrapper.propTypes = {
  store: PropTypes.shape({}),
};

describe('LicenseRemindModalWrapper', () => {
  it('renders licence remind all modal', () => {
    const wrapper = mount(<LicenseRemindModalWrapper
      user={user}
      title="Remind"
      subtitle="subtitle"
      isBulkRemind
      pendingUsersCount={pendingUsersCount}
    />);
    expect(wrapper.find('.modal-title span').text()).toEqual('Remind');
    expect(wrapper.find('.modal-title small').text()).toEqual('subtitle');

    expect(wrapper.find('.assignment-details p.bulk-selected-codes').text()).toEqual(`Unredeemed Licenses: ${pendingUsersCount}`);
  });

  it('renders licence remind modal', () => {
    const wrapper = mount(<LicenseRemindModalWrapper
      user={user}
      title="Remind"
      isBulkRemind={false}
    />);
    expect(wrapper.find('.modal-title span').text()).toEqual('Remind');

    expect(wrapper.find('.assignment-details p.bulk-selected-codes').text()).toEqual(`Email: ${user.userEmail}`);
  });
});
