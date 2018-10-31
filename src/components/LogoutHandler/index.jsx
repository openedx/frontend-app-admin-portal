import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';

class LogoutHandler extends React.Component {
  constructor(props) {
    super(props);

    // Immediately call logout when constructing this component,
    // then render() redirects to login page
    props.clearPortalConfiguration();
    props.logout();
  }

  render() {
    return (<Redirect to="/login" />);
  }
}

LogoutHandler.propTypes = {
  logout: PropTypes.func.isRequired,
  clearPortalConfiguration: PropTypes.func.isRequired,
};

export default LogoutHandler;
