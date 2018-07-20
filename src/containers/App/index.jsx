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
    const { error, enterpriseId, match } = this.props;
    const baseUrl = match.url;

    return (
      <div>
        {error &&
          <Redirect
            push
            to={{
              pathname: '/error',
              state: {
                error: {
                  status: error.response.status,
                  message: error.message,
                },
              },
            }}
          />
        }
        {!error && enterpriseId &&
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
        }
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
  error: PropTypes.instanceOf(Error),
  enterpriseId: PropTypes.string,
};

App.defaultProps = {
  error: null,
  enterpriseId: null,
};

const mapStateToProps = state => ({
  error: state.portalConfiguration.error,
  enterpriseId: state.portalConfiguration.enterpriseId,
});

const mapDispatchToProps = dispatch => ({
  getPortalConfiguration: (enterpriseSlug) => {
    dispatch(fetchPortalConfiguration(enterpriseSlug));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
