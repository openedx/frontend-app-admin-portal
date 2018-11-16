import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

import CoursewarePage from '../../containers/CoursewarePage';
import AdminPage from '../../containers/AdminPage';
import CodeManagementPage from '../../containers/CodeManagementPage';
import RequestCodesPage from '../../containers/RequestCodesPage';
import SupportPage from '../SupportPage';
import NotFoundPage from '../NotFoundPage';
import ErrorPage from '../ErrorPage';

import { removeTrailingSlash } from '../../utils';
import { features } from '../../config';

class EnterpriseApp extends React.Component {
  componentDidMount() {
    const {
      match: { params: { enterpriseSlug } },
    } = this.props;

    this.props.fetchPortalConfiguration(enterpriseSlug);
  }

  renderError(error) {
    return (
      <ErrorPage
        status={error.response && error.response.status}
        message={error.message}
      />);
  }

  render() {
    const { error, match } = this.props;
    const baseUrl = match.url;

    if (error) {
      return this.renderError(error);
    }

    return (
      <React.Fragment>
        <Switch>
          <Redirect
            exact
            from={baseUrl}
            to={`${removeTrailingSlash(baseUrl)}/admin/learners`}
          />
          <Route exact path={`${baseUrl}/courses/:courseId`} component={CoursewarePage} />
          <Route
            exact
            path={`${baseUrl}/admin/learners/:actionSlug?`}
            render={routeProps => <AdminPage {...routeProps} />}
          />
          {features.CODE_MANAGEMENT && [
            <Route
              key="code-management"
              exact
              path={`${baseUrl}/admin/codes`}
              render={routeProps =>
                <CodeManagementPage {...routeProps} />
              }
            />,
            <Route
              key="request-codes"
              exact
              path={`${baseUrl}/admin/codes/request`}
              render={routeProps =>
                <RequestCodesPage {...routeProps} />
              }
            />,
          ]}
          <Route exact path={`${baseUrl}/support`} component={SupportPage} />
          <Route path="" component={NotFoundPage} />
        </Switch>
      </React.Fragment>
    );
  }
}

EnterpriseApp.propTypes = {
  match: PropTypes.shape({
    url: PropTypes.string.isRequired,
    params: PropTypes.shape({
      enterpriseSlug: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  fetchPortalConfiguration: PropTypes.func.isRequired,
  error: PropTypes.instanceOf(Error),
};

EnterpriseApp.defaultProps = {
  error: null,
};

export default EnterpriseApp;
