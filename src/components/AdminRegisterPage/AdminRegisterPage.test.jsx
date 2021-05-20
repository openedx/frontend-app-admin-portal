import React from 'react';
import { mount } from 'enzyme';
import { createMemoryHistory } from 'history';
import { Router, Route } from 'react-router-dom';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import EnterpriseAppSkeleton from '../EnterpriseApp/EnterpriseAppSkeleton';
import AdminRegisterPage from './index';

const TEST_ENTERPRISE_SLUG = 'test-enterprise';

const history = createMemoryHistory({
  initialEntries: [`/${TEST_ENTERPRISE_SLUG}/admin/register`],
});

const AdminRegisterPageWrapper = ({
  ...rest
}) => (
  <Router history={history}>
    <Route
      exact
      path="/:enterpriseSlug/admin/register"
      render={routeProps => <AdminRegisterPage {...routeProps} {...rest} />}
    />
  </Router>
);

describe('<AdminRegisterPage />', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it('renders loading skeleton when not authenticated (redirect to enterprise proxy login)', () => {
    getAuthenticatedUser.mockReturnValue(null);

    const wrapper = mount(<AdminRegisterPageWrapper />);

    // verify that the loading skeleton appears during redirect
    expect(wrapper.contains(EnterpriseAppSkeleton)).toBeTruthy();
    expect(global.location.href).toBeTruthy();
  });

  [
    { roles: [] },
    { roles: ['enterprise_learner:*'] },
  ].forEach(({ roles }) => {
    it('displays app skeleton when user is authenticated without "enterprise_admin" JWT role', () => {
      getAuthenticatedUser.mockReturnValue({
        username: 'edx',
        roles,
      });

      const wrapper = mount(<AdminRegisterPageWrapper />);
      expect(wrapper.find(EnterpriseAppSkeleton).exists()).toBeTruthy();
    });
  });

  it('redirects to /admin/register/activate route when user is authenticated and has "enterprise_admin" JWT role', () => {
    getAuthenticatedUser.mockReturnValue({
      username: 'edx',
      roles: ['enterprise_admin:*'],
    });

    mount(<AdminRegisterPageWrapper />);
    const expectedRedirectRoute = `/${TEST_ENTERPRISE_SLUG}/admin/register/activate`;
    expect(history.location.pathname).toEqual(expectedRedirectRoute);
  });
});
