import React from 'react';
import { connect } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

import CoursewarePage from '../CoursewarePage';
import SupportPage from '../SupportPage';
import AdminPage from '../AdminPage';
import NotFoundPage from '../NotFoundPage';
import ErrorPage from '../ErrorPage';

import { getLocalUser } from '../../data/actions/authentication';

import { features } from '../../config';

class EnterpriseApp extends React.Component {
  componentDidMount() {
    this.props.getLocalUser();
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
    const { enterpriseSlug } = match.params;

    if (error) {
      return this.renderError(error);
    }

    return (
      <div>
        <Switch>
          <Redirect
            exact
            from={baseUrl}
            to={`${baseUrl}/admin/learners`}
          />
          <Route exact path={`${baseUrl}/courses/:courseId`} component={CoursewarePage} />
          {features.DASHBOARD_V2 ? (
            <Route
              exact
              path={`${baseUrl}/admin/learners/:actionSlug?`}
              render={routeProps => <AdminPage {...routeProps} enterpriseSlug={enterpriseSlug} />}
            />
          ) : (
            <Route
              exact
              path={`${baseUrl}/admin/learners`}
              render={routeProps => <AdminPage {...routeProps} enterpriseSlug={enterpriseSlug} />}
            />
          )}
          <Route exact path={`${baseUrl}/support`} component={SupportPage} />
          <Route path="" component={NotFoundPage} />
        </Switch>
      </div>
    );
  }
}

EnterpriseApp.propTypes = {
  getLocalUser: PropTypes.func.isRequired,
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

const tableId = 'enterprise-list';
const mapStateToProps = (state) => {
  const enterpriseListState = state.table[tableId] || {};

  return {
    enterprises: enterpriseListState.data,
    error: state.portalConfiguration.error,
  };
};

const mapDispatchToProps = dispatch => ({
  getLocalUser: () => {
    dispatch(getLocalUser());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(EnterpriseApp);
