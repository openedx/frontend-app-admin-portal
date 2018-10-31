import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

const PrivateRoute = ({ component: Component, isAuthenticated, ...rest }) => (
  isAuthenticated === true
    ? <Route
      {...rest}
      component={Component}
    />
    : <Route
      {...rest}
      render={props => (
        <Redirect to={{
          pathname: '/login',
          state: { from: props.location },
        }}
        />
      )}
    />
);

PrivateRoute.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  component: PropTypes.func.isRequired,
  location: PropTypes.shape({
    state: PropTypes.shape({
      from: PropTypes.shape({
        pathname: PropTypes.string,
      }),
    }),
  }).isRequired,
};

export default PrivateRoute;
