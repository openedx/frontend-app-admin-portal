import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

import AdminPage from '../../containers/AdminPage';
import CodeManagementPage from '../../containers/CodeManagementPage';
import RequestCodesPage from '../../containers/RequestCodesPage';
import SupportPage from '../SupportPage';
import NotFoundPage from '../NotFoundPage';
import ErrorPage from '../ErrorPage';

import { removeTrailingSlash } from '../../utils';
import { features } from '../../config';

class EnterpriseApp extends React.Component {
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
    const { enterpriseSlug } = match.params;

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
          <Route
            exact
            path={`${baseUrl}/admin/learners/:actionSlug?`}
            render={routeProps => <AdminPage {...routeProps} enterpriseSlug={enterpriseSlug} />}
          />
          {features.CODE_MANAGEMENT &&
            <React.Fragment>
              <Route
                exact
                path={`${baseUrl}/admin/codes`}
                render={routeProps =>
                  <CodeManagementPage {...routeProps} enterpriseSlug={enterpriseSlug} />
                }
              />
              <Route
                exact
                path={`${baseUrl}/admin/codes/request`}
                render={routeProps =>
                  <RequestCodesPage {...routeProps} enterpriseSlug={enterpriseSlug} />
                }
              />
            </React.Fragment>
          }
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
  error: PropTypes.instanceOf(Error),
};

EnterpriseApp.defaultProps = {
  error: null,
};

export default EnterpriseApp;
