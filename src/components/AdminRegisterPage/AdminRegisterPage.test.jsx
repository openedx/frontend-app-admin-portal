import React from 'react';

import { mount } from 'enzyme';
import { createMemoryHistory } from 'history';
import { Router, Route } from 'react-router-dom';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import LoadingMessage from '../LoadingMessage';
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
  it('renders loading message when not authenticated (redirect to enterprise proxy login)', () => {
    getAuthenticatedUser.mockReturnValue({});

    const wrapper = mount(<AdminRegisterPageWrapper />);

    // verify that the loading message appears during redirect
    const LoadingComponent = <LoadingMessage className="admin-register" />;
    expect(wrapper.contains(LoadingComponent)).toBeTruthy();
    expect(global.location.href).toBeTruthy();
  });

  [
    { roles: [] },
    { roles: ['enterprise_learner:*'] },
  ].forEach(({ roles }) => {
    it('displays logging out message alert when user is authenticated without "enterprise_admin" JWT role', () => {
      getAuthenticatedUser.mockReturnValue({
        username: 'edx',
        roles,
      });

      const wrapper = mount(<AdminRegisterPageWrapper />);
      expect(wrapper.find('.admin-registration-logout').exists()).toBeTruthy();
    });
  });

  it('redirects to /admin/register/activate route when user is authenticated and has JWT roles', () => {
    getAuthenticatedUser.mockReturnValue({
      username: 'edx',
      roles: ['enterprise_admin:*'],
    });

    mount(<AdminRegisterPageWrapper />);
    const expectedRedirectRoute = `/${TEST_ENTERPRISE_SLUG}/admin/register/activate`;
    expect(history.location.pathname).toEqual(expectedRedirectRoute);
  });
});
