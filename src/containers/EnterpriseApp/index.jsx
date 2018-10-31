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

import { removeTrailingSlash } from '../../utils';

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
            render={routeProps => <AdminPage {...routeProps} enterpriseSlug={enterpriseSlug} />}
          />
          <Route exact path={`${baseUrl}/support`} component={SupportPage} />
          <Route path="" component={NotFoundPage} />
        </Switch>
      </React.Fragment>
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

const mapStateToProps = (state) => {
  const enterpriseListState = state.table['enterprise-list'] || {};

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
