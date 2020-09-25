import React from 'react';
import PropTypes from 'prop-types';
import { mount } from 'enzyme';
import { createMemoryHistory } from 'history';
import { Router, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import LoadingMessage from '../../components/LoadingMessage';
import { ToastsContext } from '../../components/Toasts';
import UserActivationPage from './index';

const TEST_ENTERPRISE_SLUG = 'test-enterprise';

const mockStore = configureMockStore([thunk]);
const initialHistory = createMemoryHistory({
  initialEntries: [`/${TEST_ENTERPRISE_SLUG}/admin/register/activate`],
});
const initialState = {
  // defaults to unauthenticated
  authentication: {},
  userAccount: {},
};

const UserActivationPageWrapper = ({
  store,
  history,
  ...rest
}) => ((
  <Router history={history}>
    <Provider store={store}>
      <ToastsContext.Provider value={{ addToast: () => { } }}>
        <Route
          exact
          path="/:enterpriseSlug/admin/register/activate"
          render={routeProps => <UserActivationPage {...routeProps} {...rest} />}
        />
      </ToastsContext.Provider>
    </Provider>
  </Router>
));

UserActivationPageWrapper.defaultProps = {
  store: mockStore({ ...initialState }),
  history: initialHistory,
};

UserActivationPageWrapper.propTypes = {
  store: PropTypes.shape(),
  history: PropTypes.shape(),
};

describe('<UserActivationPage />', () => {
  it('renders loading message when not authenticated (redirect to enterprise proxy login)', () => {
    // Note: this test does not assert that the redirect to the proxy login works since
    // JSdom does not implement global.location. Due to this, JSdom outputs a "Not
    // implemented: navigation" warning for this test that can safely be ignored.
    const wrapper = mount(<UserActivationPageWrapper />);

    // verify that the loading message appears during redirect
    const LoadingComponent = <LoadingMessage className="user-activation" />;
    expect(wrapper.contains(LoadingComponent)).toBeTruthy();
  });

  it('redirects to /admin/register when user is authenticated but has no JWT roles', () => {
    const store = mockStore({
      authentication: {
        username: 'edx',
        roles: [],
      },
      userAccount: {
        loaded: true,
        isActive: false,
      },
    });
    const history = createMemoryHistory({
      initialEntries: [`/${TEST_ENTERPRISE_SLUG}/admin/register/activate`],
    });

    mount(<UserActivationPageWrapper history={history} store={store} />);
    const expectedRedirectRoute = `/${TEST_ENTERPRISE_SLUG}/admin/register`;
    expect(history.location.pathname).toEqual(expectedRedirectRoute);
  });

  it('displays an alert when user with unverified email is authenticated and has JWT roles', () => {
    const store = mockStore({
      authentication: {
        username: 'edx',
        roles: ['enterprise_admin:*'],
      },
      userAccount: {
        loaded: true,
        isActive: false,
      },
    });

    const wrapper = mount(<UserActivationPageWrapper store={store} />);
    expect(wrapper.find('Alert').exists()).toBeTruthy();
  });

  it('redirects to /admin/learners route when user with verified email is authenticated and has JWT roles', () => {
    const store = mockStore({
      authentication: {
        username: 'edx',
        roles: ['enterprise_admin:*'],
      },
      userAccount: {
        loaded: true,
        isActive: true,
      },
    });

    const history = createMemoryHistory({
      initialEntries: [`/${TEST_ENTERPRISE_SLUG}/admin/register/activate`],
    });

    mount(<UserActivationPageWrapper history={history} store={store} />);
    const expectedRedirectRoute = `/${TEST_ENTERPRISE_SLUG}/admin/learners`;
    expect(history.location.pathname).toEqual(expectedRedirectRoute);
  });
});
