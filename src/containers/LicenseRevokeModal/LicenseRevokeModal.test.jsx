import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import LicenseManagerApiService from '../../components/subscriptions/data/service';
import LicenseRevokeModal from './index';

const mockStore = configureMockStore([thunk]);

const user = {
  userId: 'ABC101',
  userEmail: 'edx@example.com',
  licenseStatus: 'active',
};
const subscriptionPlan = {
  uuid: '2e0caa85-3461-46b9-8c90-84681f43ba7c',
  revocations: {
    applied: 1,
    remaining: 10,
  },
};
const licenseOverview = {
  assigned: 5,
};
const LicenseRevokeModalWrapper = props => (
  <MemoryRouter>
    <Provider store={props.store}>
      <LicenseRevokeModal
        user={user}
        onClose={() => { }}
        onSuccess={() => { }}
        setActiveTab={() => { }}
        fetchSubscriptionDetails={() => { }}
        fetchSubscriptionUsers={() => { }}
        subscriptionPlan={subscriptionPlan}
        licenseOverview={licenseOverview}
        {...props}
      />
    </Provider>
  </MemoryRouter>
);

LicenseRevokeModalWrapper.defaultProps = {
  store: mockStore({}),
};

LicenseRevokeModalWrapper.propTypes = {
  store: PropTypes.shape({}),
};

describe('LicenseRevokeModalWrapper', () => {
  let spy;

  afterEach(() => {
    if (spy) {
      spy.mockRestore();
    }
  });

  it('renders license revoke modal', () => {
    spy = jest.spyOn(LicenseManagerApiService, 'licenseRevoke');

    const wrapper = mount(<LicenseRevokeModalWrapper user={user} />);
    expect(wrapper.find('.modal-title').text()).toEqual('Are you sure you want to revoke this license?');

    expect(wrapper.find('.license-details p').at(0).text())
      .toContain((
        `Revoking a license will remove access to the subscription catalog for ${user.userEmail}.`
      ));

    wrapper.find('.modal-footer .license-revoke-save-btn .btn-primary').hostNodes().simulate('click');
    expect(spy).toHaveBeenCalled();
  });
});
