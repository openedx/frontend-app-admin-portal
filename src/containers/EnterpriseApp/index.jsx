import React from 'react';
import { connect } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

import CoursewarePage from '../CoursewarePage';
import SupportPage from '../SupportPage';
import AdminPage from '../AdminPage';
import NotFoundPage from '../NotFoundPage';
import ErrorPage from '../ErrorPage';

import { fetchPortalConfiguration } from '../../data/actions/portalConfiguration';
import { getLocalUser } from '../../data/actions/authentication';

class EnterpriseApp extends React.Component {
  componentDidMount() {
    const { enterpriseSlug } = this.props.match.params;

    this.props.getPortalConfiguration(enterpriseSlug);
    this.props.getLocalUser();
  }

  removeTrailingSlash(path) {
    return path.replace(/\/$/, '');
  }

  renderError(error) {
    return (
      <ErrorPage
        status={error.response && error.response.status}
        message={error.message}
      />);
  }

  render() {
    const { error, enterpriseId, match } = this.props;
    const baseUrl = match.url;

    if (error) {
      return this.renderError(error);
    }

    return (
      <div>
        {enterpriseId &&
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

EnterpriseApp.propTypes = {
  getPortalConfiguration: PropTypes.func.isRequired,
  getLocalUser: PropTypes.func.isRequired,
  match: PropTypes.shape({
    url: PropTypes.string.isRequired,
    params: PropTypes.shape({
      enterpriseSlug: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  error: PropTypes.instanceOf(Error),
  enterpriseId: PropTypes.string,
};

EnterpriseApp.defaultProps = {
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
  getLocalUser: () => {
    dispatch(getLocalUser());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(EnterpriseApp);
