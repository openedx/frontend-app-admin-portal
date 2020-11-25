import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route, Redirect } from 'react-router-dom';
import MediaQuery from 'react-responsive';
import { breakpoints } from '@edx/paragon';

import AdminPage from '../../containers/AdminPage';
import CodeManagementPage from '../../containers/CodeManagementPage';
import RequestCodesPage from '../../containers/RequestCodesPage';
import Sidebar from '../../containers/Sidebar';
import SupportPage from '../../containers/SupportPage';
import SamlProviderConfiguration from '../../containers/SamlProviderConfiguration';
import BulkEnrollmentPage from '../BulkEnrollmentPage';
import ReportingConfig from '../ReportingConfig';
import NotFoundPage from '../NotFoundPage';
import ErrorPage from '../ErrorPage';
import LoadingMessage from '../LoadingMessage';
import { SubscriptionManagementPage } from '../subscriptions';
import { AnalyticsPage } from '../analytics';

import { removeTrailingSlash } from '../../utils';
import { features } from '../../config';

class EnterpriseApp extends React.Component {
  constructor(props) {
    super(props);

    this.contentWrapperRef = React.createRef();
    this.sidebarRef = null;

    this.state = {
      sidebarWidth: 61.3, // hardcoded sidebarWidth required for initial render
    };
  }

  componentDidMount() {
    const {
      match: { params: { enterpriseSlug } },
    } = this.props;

    this.props.fetchPortalConfiguration(enterpriseSlug);
    this.props.toggleSidebarToggle(); // ensure sidebar toggle button is in header
  }

  componentDidUpdate(prevProps) {
    const {
      location: { pathname },
    } = this.props;

    if (pathname !== prevProps.location.pathname) {
      this.handleSidebarMenuItemClick();
    }
  }

  componentWillUnmount() {
    this.props.toggleSidebarToggle(); // ensure sidebar toggle button is removed from header
  }

  handleSidebarMenuItemClick() {
    const contentRef = this.contentWrapperRef && this.contentWrapperRef.current;
    if (contentRef) {
      // Set focus on the page content container after clicking sidebar menu link
      contentRef.focus();
    }

    if (
      this.sidebarRef &&
      this.sidebarRef.props.isMobile &&
      this.sidebarRef.props.isExpandedByToggle
    ) {
      this.sidebarRef.props.collapseSidebar(true);
    }
  }

  renderError(error) {
    return (
      <ErrorPage
        status={error.response && error.response.status}
        message={error.message}
      />);
  }

  render() {
    const {
      error,
      match,
      enableCodeManagementScreen,
      enableSubscriptionManagementScreen,
      enableAnalyticsScreen,
      enableSamlConfigurationScreen,
      authentication,
      userAccount,
    } = this.props;
    const { sidebarWidth } = this.state;
    const {
      url: baseUrl,
      params: { enterpriseSlug },
    } = match;
    const defaultContentPadding = 10; // 10px for appropriate padding

    const isUserLoadedAndInactive = !!(userAccount?.loaded && !userAccount?.isActive);
    const isUserMissingJWTRoles = !authentication?.roles?.length;

    if (error) {
      return this.renderError(error);
    }

    if (isUserMissingJWTRoles || isUserLoadedAndInactive) {
      return (
        <Redirect to={`/${enterpriseSlug}/admin/register/activate`} />
      );
    }

    return (
      <div className="enterprise-app">
        <MediaQuery minWidth={breakpoints.large.minWidth}>
          {matches => (
            <React.Fragment>
              <Sidebar
                baseUrl={baseUrl}
                wrappedComponentRef={(node) => {
                  this.sidebarRef = node && node.getWrappedInstance();
                }}
                onWidthChange={(width) => {
                  this.setState({
                    sidebarWidth: width + defaultContentPadding,
                  });
                }}
                isMobile={!matches}
              />
              <div
                className="content-wrapper"
                tabIndex="-1"
                ref={this.contentWrapperRef}
                style={{
                  paddingLeft: matches ? sidebarWidth : defaultContentPadding,
                }}
              >
                <Switch>
                  <Redirect
                    exact
                    from={baseUrl}
                    to={`${removeTrailingSlash(baseUrl)}/admin/learners`}
                  />
                  <Route
                    exact
                    path={`${baseUrl}/admin/learners/:actionSlug?`}
                    render={routeProps => <AdminPage {...routeProps} />}
                  />
                  {features.CODE_MANAGEMENT && enableCodeManagementScreen && [
                    <Route
                      key="code-management"
                      exact
                      path={`${baseUrl}/admin/coupons`}
                      render={routeProps =>
                        <CodeManagementPage {...routeProps} />
                      }
                    />,
                    <Route
                      key="request-codes"
                      exact
                      path={`${baseUrl}/admin/coupons/request`}
                      render={routeProps =>
                        <RequestCodesPage {...routeProps} />
                      }
                    />,
                  ]}
                  {features.BULK_ENROLLMENT &&
                    <Route
                      key="bulk-enrollment"
                      exact
                      path={`${baseUrl}/admin/bulkenrollment`}
                      render={routeProps => <BulkEnrollmentPage {...routeProps} />}
                    />
                  }
                  {features.REPORTING_CONFIGURATIONS &&
                    <Route
                      key="reporting-config"
                      exact
                      path={`${baseUrl}/admin/reporting`}
                      render={routeProps => (this.props.enterpriseId ?
                        <ReportingConfig {...routeProps} enterpriseId={this.props.enterpriseId} />
                        :
                        <LoadingMessage className="overview" />
                      )}
                    />
                  }
                  {enableSubscriptionManagementScreen &&
                    <Route
                      key="subscription-management"
                      exact
                      path={`${baseUrl}/admin/subscriptions`}
                      render={routeProps =>
                        <SubscriptionManagementPage {...routeProps} />
                      }
                    />
                  }
                  {features.ANALYTICS && enableAnalyticsScreen &&
                    <Route
                      key="analytics"
                      exact
                      path={`${baseUrl}/admin/analytics`}
                      render={routeProps => (
                        <AnalyticsPage
                          {...routeProps}
                        />
                      )}
                    />
                  }
                  {features.SAML_CONFIGURATION && enableSamlConfigurationScreen &&
                    <Route
                      key="saml-configuration"
                      exact
                      path={`${baseUrl}/admin/samlconfiguration`}
                      render={routeProps => (
                        <SamlProviderConfiguration
                          {...routeProps}
                        />
                      )}
                    />
                  }
                  <Route
                    key="support"
                    exact
                    path={`${baseUrl}/admin/support`}
                    render={routeProps =>
                      <SupportPage {...routeProps} />
                    }
                  />
                  <Route path="" component={NotFoundPage} />
                </Switch>
              </div>
            </React.Fragment>
          )}
        </MediaQuery>
      </div>
    );
  }
}

EnterpriseApp.defaultProps = {
  enterpriseId: null,
  error: null,
  enableCodeManagementScreen: false,
  enabledBulkEnrollmentScreen: false,
  enableSubscriptionManagementScreen: false,
  enableSamlConfigurationScreen: false,
  enableAnalyticsScreen: false,
};

EnterpriseApp.propTypes = {
  match: PropTypes.shape({
    url: PropTypes.string.isRequired,
    params: PropTypes.shape({
      enterpriseSlug: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  enterpriseId: PropTypes.string,
  fetchPortalConfiguration: PropTypes.func.isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }).isRequired,
  history: PropTypes.shape({
    replace: PropTypes.func,
  }).isRequired,
  toggleSidebarToggle: PropTypes.func.isRequired,
  authentication: PropTypes.shape().isRequired,
  userAccount: PropTypes.shape().isRequired,
  enableCodeManagementScreen: PropTypes.bool,
  enabledBulkEnrollmentScreen: PropTypes.bool,
  enableSubscriptionManagementScreen: PropTypes.bool,
  enableSamlConfigurationScreen: PropTypes.bool,
  enableAnalyticsScreen: PropTypes.bool,
  error: PropTypes.instanceOf(Error),
};

export default EnterpriseApp;
