import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import * as licenseService from '../../components/subscriptions/data/service';
import LicenseRevokeModal from './index';

const mockStore = configureMockStore([thunk]);

const user = {
  uuid: 'ABC101',
  emailAddress: 'edx@example.com',
  licenseStatus: 'active',
};

const LicenseRevokeModalWrapper = props => (
  <MemoryRouter>
    <Provider store={props.store}>
      <LicenseRevokeModal
        user={user}
        onClose={() => {}}
        onSuccess={() => {}}
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
    spy = jest.spyOn(licenseService, 'sendLicenseRevoke');

    const wrapper = mount(<LicenseRevokeModalWrapper user={user} />);
    expect(wrapper.find('.modal-title small').text()).toEqual('Are you sure you want to revoke access?');

    expect(wrapper.find('.license-details p.message').text()).toEqual(`Revoking a license will remove access to the subscription catalog for ${user.emailAddress}. To re-enable access, you can assign this user to another license.`);

    wrapper.find('.modal-footer .license-revoke-save-btn .btn-primary').hostNodes().simulate('click');
    expect(spy).toHaveBeenCalled();
  });
});
