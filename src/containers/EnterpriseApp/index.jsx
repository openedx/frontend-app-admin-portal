import React from 'react';
import { connect } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

import CoursewarePage from '../CoursewarePage';
import SupportPage from '../SupportPage';
import AdminPage from '../AdminPage';
import NotFoundPage from '../NotFoundPage';
import ErrorPage from '../ErrorPage';

import fetchEnterpriseList from '../../data/actions/enterpriseList';
import { setPortalConfiguration } from '../../data/actions/portalConfiguration';
import { getLocalUser } from '../../data/actions/authentication';

class EnterpriseApp extends React.Component {
  componentDidMount() {
    const { enterpriseSlug } = this.props.match.params;
    if (!this.props.enterprises) {
      this.props.fetchEnterpriseList();
    } else {
      const enterprise = this.findEnterprise(enterpriseSlug);
      this.props.setPortalConfiguration(enterprise);
    }

    this.props.getLocalUser();
  }

  componentDidUpdate(prevProps) {
    const { enterprises } = this.props;
    const { enterpriseSlug } = this.props.match.params;
    if (enterprises && enterprises !== prevProps.enterprises) {
      const enterprise = this.findEnterprise(enterpriseSlug);
      this.props.setPortalConfiguration(enterprise);
    }
  }

  findEnterprise(enterpriseSlug) {
    const { enterprises } = this.props;
    const enterpriseList = enterprises && enterprises.results;
    return enterpriseList.find(enterprise => enterprise.slug === enterpriseSlug);
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
    const { error, match } = this.props;
    const baseUrl = match.url;

    if (error) {
      return this.renderError(error);
    }

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

EnterpriseApp.propTypes = {
  fetchEnterpriseList: PropTypes.func.isRequired,
  setPortalConfiguration: PropTypes.func.isRequired,
  getLocalUser: PropTypes.func.isRequired,
  match: PropTypes.shape({
    url: PropTypes.string.isRequired,
    params: PropTypes.shape({
      enterpriseSlug: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  error: PropTypes.instanceOf(Error),
  enterprises: PropTypes.shape({
    results: PropTypes.arrayOf(PropTypes.shape({
      uuid: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired,
      branding_configuration: PropTypes.shape({
        logo: PropTypes.string.isRequired,
      }),
    })),
  }),
};

EnterpriseApp.defaultProps = {
  error: null,
  enterprises: null,
};

const mapStateToProps = state => ({
  error: state.portalConfiguration.error,
  enterprises: state.enterpriseList && state.enterpriseList.enterprises,
});

const mapDispatchToProps = dispatch => ({
  fetchEnterpriseList: () => {
    dispatch(fetchEnterpriseList());
  },
  setPortalConfiguration: (enterpriseSlug) => {
    dispatch(setPortalConfiguration(enterpriseSlug));
  },
  getLocalUser: () => {
    dispatch(getLocalUser());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(EnterpriseApp);
