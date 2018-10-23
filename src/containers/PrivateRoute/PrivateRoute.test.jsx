import React from 'react';
import PropTypes from 'prop-types';
import renderer from 'react-test-renderer';
import { MemoryRouter, Route, Switch } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import PrivateRoute from './index';

const mockStore = configureMockStore([thunk]);

const TestComponent = () => (
  <div>
    <p>Hello World!</p>
  </div>
);

const TestLoginComponent = () => (
  <div>
    <p>You can log in on this page!</p>
  </div>
);

const PrivateRouteWrapper = props => (
  <MemoryRouter initialEntries={props.initialEntries}>
    <Switch>
      <Route
        store={props.store}
        exact
        path="/login"
        component={TestLoginComponent}
      />
      <PrivateRoute
        store={props.store}
        {...props}
      />
    </Switch>
  </MemoryRouter>
);

PrivateRouteWrapper.propTypes = {
  store: PropTypes.shape({}).isRequired,
  initialEntries: PropTypes.arrayOf(PropTypes.string).isRequired,
  path: PropTypes.string.isRequired,
  component: PropTypes.func.isRequired,
};

describe('PrivateRoute', () => {
  let store;
  let tree;

  it('renders component if authenticated', () => {
    store = mockStore({
      authentication: {
        isAuthenticated: true,
      },
    });

    tree = renderer
      .create((
        <PrivateRouteWrapper
          store={store}
          initialEntries={['/']}
          path="/"
          component={TestComponent}
        />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders login page if not authenticated', () => {
    store = mockStore({
      authentication: {
        isAuthenticated: false,
      },
    });

    tree = renderer
      .create((
        <PrivateRouteWrapper
          store={store}
          initialEntries={['/']}
          path="/"
          component={TestComponent}
        />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
