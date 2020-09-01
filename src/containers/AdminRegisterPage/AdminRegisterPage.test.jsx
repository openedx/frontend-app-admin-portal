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
        render={renderProps => <AdminRegisterPage {...renderProps} {...rest} />}
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
    // Note: this test does not assert that the redirect to the proxy login works since
    // JSdom does not implement global.location. Due to this, JSdom outputs a "Not
    // implemented: navigation" warning for this test that can safely be ignored.
    const wrapper = mount(<AdminRegisterPageWrapper />);

    // verify that the loading message appears during redirect
    const LoadingComponent = <LoadingMessage className="admin-register" />;
    expect(wrapper.contains(LoadingComponent)).toBeTruthy();
  });

  it('redirects to default /admin/learners routte when user is authenticated', () => {
    const store = mockStore({
      authentication: {
        username: 'edx',
      },
    });
    mount(<AdminRegisterPageWrapper store={store} />);
    const expectedRedirectRoute = `/${TEST_ENTERPRISE_SLUG}/admin/learners`;
    expect(history.location.pathname).toEqual(expectedRedirectRoute);
  });
});
