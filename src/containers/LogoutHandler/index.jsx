import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { logout } from '../../data/actions/authentication';

class LogoutHandler extends React.Component {
  constructor(props) {
    super(props);

    // Immediately call logout when constructing this component,
    // then render() redirects to login page
    props.logout();
  }

  render() {
    return (<Redirect to="/login" />);
  }
}

LogoutHandler.propTypes = {
  logout: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
  logout: () => dispatch(logout()),
});

export default connect(null, mapDispatchToProps)(LogoutHandler);
