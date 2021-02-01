import React from 'react';
import PropTypes from 'prop-types';
import { mount } from 'enzyme';
import { createMemoryHistory } from 'history';
import { Router, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import LoadingMessage from '../../components/LoadingMessage';
import AdminRegisterPage from './index';

const TEST_ENTERPRISE_SLUG = 'test-enterprise';

const mockStore = configureMockStore([thunk]);
const history = createMemoryHistory({
  initialEntries: [`/${TEST_ENTERPRISE_SLUG}/admin/register`],
});
const initialState = {
  authentication: {}, // default to unauthenticated
};

const AdminRegisterPageWrapper = ({
  store,
  ...rest
}) => (
  <Router history={history}>
    <Provider store={store}>
      <Route
        exact
        path="/:enterpriseSlug/admin/register"
        render={routeProps => <AdminRegisterPage {...routeProps} {...rest} />}
      />
    </Provider>
  </Router>
);

AdminRegisterPageWrapper.defaultProps = {
  store: mockStore({ ...initialState }),
};

AdminRegisterPageWrapper.propTypes = {
  store: PropTypes.shape(),
};

describe('<AdminRegisterPage />', () => {
  it('renders loading message when not authenticated (redirect to enterprise proxy login)', () => {
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
      const store = mockStore({
        authentication: {
          username: 'edx',
          roles,
        },
      });

      const wrapper = mount(<AdminRegisterPageWrapper store={store} />);
      expect(wrapper.find('.admin-registration-logout').exists()).toBeTruthy();
    });
  });

  it('redirects to /admin/register/activate route when user is authenticated and has JWT roles', () => {
    const store = mockStore({
      authentication: {
        username: 'edx',
        roles: ['enterprise_admin:*'],
      },
    });
    mount(<AdminRegisterPageWrapper store={store} />);
    const expectedRedirectRoute = `/${TEST_ENTERPRISE_SLUG}/admin/register/activate`;
    expect(history.location.pathname).toEqual(expectedRedirectRoute);
  });
});
