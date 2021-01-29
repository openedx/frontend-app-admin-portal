import React from 'react';
import PropTypes from 'prop-types';
import { mount } from 'enzyme';
import { createMemoryHistory } from 'history';
import { Router, Route } from 'react-router-dom';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import LoadingMessage from '../LoadingMessage';
import { ToastsContext } from '../Toasts';
import UserActivationPage from './index';

const TEST_ENTERPRISE_SLUG = 'test-enterprise';

const initialHistory = createMemoryHistory({
  initialEntries: [`/${TEST_ENTERPRISE_SLUG}/admin/register/activate`],
});

const UserActivationPageWrapper = ({
  history,
  ...rest
}) => (
  <Router history={history}>
    <ToastsContext.Provider value={{ addToast: () => {} }}>
      <Route
        exact
        path="/:enterpriseSlug/admin/register/activate"
        render={routeProps => <UserActivationPage {...routeProps} {...rest} />}
      />
    </ToastsContext.Provider>
  </Router>
);

UserActivationPageWrapper.defaultProps = {
  history: initialHistory,
};

UserActivationPageWrapper.propTypes = {
  history: PropTypes.shape(),
};

describe('<UserActivationPage />', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it('renders loading message when not authenticated (redirect to enterprise proxy login)', () => {
    getAuthenticatedUser.mockReturnValue({});
    // Note: this test does not assert that the redirect to the proxy login works since
    // JSdom does not implement global.location. Due to this, JSdom outputs a "Not
    // implemented: navigation" warning for this test that can safely be ignored.
    const wrapper = mount(<UserActivationPageWrapper />);

    // verify that the loading message appears during redirect
    const LoadingComponent = <LoadingMessage className="user-activation" />;
    expect(wrapper.contains(LoadingComponent)).toBeTruthy();
  });

  it('redirects to /admin/register when user is authenticated but has no JWT roles', () => {
    getAuthenticatedUser.mockReturnValue({
      username: 'edx',
      roles: [],
      isActive: true,
    });
    const history = createMemoryHistory({
      initialEntries: [`/${TEST_ENTERPRISE_SLUG}/admin/register/activate`],
    });

    mount(<UserActivationPageWrapper history={history} />);
    const expectedRedirectRoute = `/${TEST_ENTERPRISE_SLUG}/admin/register`;
    expect(history.location.pathname).toEqual(expectedRedirectRoute);
  });

  it('displays an alert when user with unverified email is authenticated and has JWT roles', () => {
    getAuthenticatedUser.mockReturnValue({
      username: 'edx',
      roles: ['enterprise_admin:*'],
      isActive: false,
    });

    const wrapper = mount(<UserActivationPageWrapper />);
    expect(wrapper.find('Alert').exists()).toBeTruthy();
  });

  it('redirects to /admin/learners route when user with verified email is authenticated and has JWT roles', () => {
    getAuthenticatedUser.mockReturnValue({
      username: 'edx',
      roles: ['enterprise_admin:*'],
      isActive: true,
    });

    const history = createMemoryHistory({
      initialEntries: [`/${TEST_ENTERPRISE_SLUG}/admin/register/activate`],
    });

    mount(<UserActivationPageWrapper history={history} />);
    const expectedRedirectRoute = `/${TEST_ENTERPRISE_SLUG}/admin/learners`;
    expect(history.location.pathname).toEqual(expectedRedirectRoute);
  });
});
