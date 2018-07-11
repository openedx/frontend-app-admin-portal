import React from 'react';
import { connect } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

import CoursewarePage from '../CoursewarePage';
import SupportPage from '../SupportPage';
import AdminPage from '../AdminPage';
import NotFoundPage from '../NotFoundPage';

import fetchPortalConfiguration from '../../data/actions/portalConfiguration';

class App extends React.Component {
  componentDidMount() {
    const { enterpriseSlug } = this.props.match.params;

    this.props.getPortalConfiguration(enterpriseSlug);
  }

  removeTrailingSlash(path) {
    return path.replace(/\/$/, '');
  }

  render() {
    const baseUrl = this.props.match.url;

    return (
      <div>
        <Switch>
          <Redirect
            exact
            from={baseUrl}
            to={`${this.removeTrailingSlash(baseUrl)}/admin`}
          />
          <Route exact path={`${baseUrl}/courses/:courseId`} component={CoursewarePage} />
          <Route exact path={`${baseUrl}/admin`} component={AdminPage} />
          <Route exact path={`${baseUrl}/support`} component={SupportPage} />
          <Route path="" component={NotFoundPage} />
        </Switch>
      </div>
    );
  }
}

App.propTypes = {
  getPortalConfiguration: PropTypes.func.isRequired,
  match: PropTypes.shape({
    url: PropTypes.string.isRequired,
    params: PropTypes.shape({
      enterpriseSlug: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

const mapDispatchToProps = dispatch => ({
  getPortalConfiguration: (enterpriseSlug) => {
    dispatch(fetchPortalConfiguration(enterpriseSlug));
  },
});

export default connect(null, mapDispatchToProps)(App);
