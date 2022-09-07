import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { breakpoints, MediaQuery } from '@edx/paragon';

import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import Sidebar from '../../containers/Sidebar';
import ErrorPage from '../ErrorPage';
import BrandStyles from '../BrandStyles';
import { features } from '../../config';
import EnterpriseAppSkeleton from './EnterpriseAppSkeleton';
import FeatureAnnouncementBanner from '../FeatureAnnouncementBanner';
import EnterpriseAppContextProvider from './EnterpriseAppContextProvider';
import EnterpriseAppRoutes from './EnterpriseAppRoutes';
import ProductTours from '../ProductTours/ProductTours';
import { SCHOLAR_THEME } from '../settings/data/constants';

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
      this.sidebarRef
      && this.sidebarRef.props.isMobile
      && this.sidebarRef.props.isExpandedByToggle
    ) {
      this.sidebarRef.props.collapseSidebar(true);
    }
  }

  renderError(error) {
    return (
      <ErrorPage
        status={error.response && error.response.status}
        message={error.message}
      />
    );
  }

  render() {
    const {
      error,
      match,
      enableCodeManagementScreen,
      enableSubscriptionManagementScreen,
      enableAnalyticsScreen,
      enableSamlConfigurationScreen,
      enableLearnerPortal,
      enableLmsConfigurationsScreen,
      enableReportingConfigurationsScreen,
      enablePortalLearnerCreditManagementScreen,
      enterpriseId,
      enterpriseName,
      enterpriseBranding,
      loading,
    } = this.props;
    const { sidebarWidth } = this.state;
    const {
      url,
      params: { enterpriseSlug },
    } = match;
    const baseUrl = url.split('/').slice(0, 2).join('/');
    const defaultContentPadding = 10; // 10px for appropriate padding
    const { isActive, roles, email } = getAuthenticatedUser() || {};
    // checking for undefined tells if if the user's info is hydrated
    const isUserLoadedAndInactive = isActive !== undefined && !isActive;
    const isUserMissingJWTRoles = !roles?.length;

    // Hide Settings page if there are no visible tabs
    const enableSettingsPage = (
      features.SETTINGS_PAGE && (
        enableLearnerPortal || (
          features.FEATURE_SSO_SETTINGS_TAB && enableSamlConfigurationScreen
        ) || (
          features.SETTINGS_PAGE_LMS_TAB && enableLmsConfigurationsScreen
        ) || (
          features.SETTINGS_PAGE_APPEARANCE_TAB
        )
      )
    );

    if (error) {
      return this.renderError(error);
    }

    if (isUserMissingJWTRoles || isUserLoadedAndInactive) {
      return (
        <Redirect to={`/${enterpriseSlug}/admin/register/activate`} />
      );
    }

    if (loading) {
      return <EnterpriseAppSkeleton />;
    }

    return (
      <EnterpriseAppContextProvider
        enterpriseId={enterpriseId}
        enablePortalLearnerCreditManagementScreen={enablePortalLearnerCreditManagementScreen}
      >
        <BrandStyles enterpriseBranding={enterpriseBranding} />
        <div className="enterprise-app">
          <MediaQuery minWidth={breakpoints.large.minWidth}>
            {matchesMediaQ => (
              <>
                <ProductTours />
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
                  isMobile={!matchesMediaQ}
                />
                <div
                  className="content-wrapper full-page"
                  tabIndex="-1"
                  ref={this.contentWrapperRef}
                  style={{
                    paddingLeft: matchesMediaQ ? sidebarWidth : defaultContentPadding,
                  }}
                >
                  <FeatureAnnouncementBanner enterpriseSlug={enterpriseSlug} />
                  <EnterpriseAppRoutes
                    baseUrl={baseUrl}
                    email={email}
                    enterpriseId={enterpriseId}
                    enterpriseName={enterpriseName}
                    enableCodeManagementPage={features.CODE_MANAGEMENT && enableCodeManagementScreen}
                    enableReportingPage={features.REPORTING_CONFIGURATIONS && enableReportingConfigurationsScreen}
                    enableSubscriptionManagementPage={enableSubscriptionManagementScreen}
                    enableAnalyticsPage={features.ANALYTICS && enableAnalyticsScreen}
                    enableSamlConfigurationPage={features.FEATURE_SSO_SETTINGS_TAB && enableSamlConfigurationScreen}
                    enableLmsConfigurationPage={features.SETTINGS_PAGE_LMS_TAB && enableLmsConfigurationsScreen}
                    enableSettingsPage={enableSettingsPage}
                  />
                </div>
              </>
            )}
          </MediaQuery>
        </div>
      </EnterpriseAppContextProvider>
    );
  }
}

EnterpriseApp.defaultProps = {
  enterpriseId: null,
  enterpriseName: null,
  enterpriseBranding: {
    primary_color: SCHOLAR_THEME.banner,
    secondary_color: SCHOLAR_THEME.button,
    tertiary_color: SCHOLAR_THEME.accent,
  },
  error: null,
  enableCodeManagementScreen: false,
  enableSubscriptionManagementScreen: false,
  enableSamlConfigurationScreen: false,
  enableAnalyticsScreen: false,
  enableLearnerPortal: false,
  enableLmsConfigurationsScreen: false,
  enableReportingConfigurationsScreen: false,
  enablePortalLearnerCreditManagementScreen: false,
  loading: true,
};

EnterpriseApp.propTypes = {
  match: PropTypes.shape({
    url: PropTypes.string.isRequired,
    params: PropTypes.shape({
      enterpriseSlug: PropTypes.string.isRequired,
      page: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  enterpriseId: PropTypes.string,
  enterpriseName: PropTypes.string,
  enterpriseBranding: PropTypes.shape({
    primary_color: PropTypes.string,
    secondary_color: PropTypes.string,
    tertiary_color: PropTypes.string,
    logo: PropTypes.string,
  }),
  fetchPortalConfiguration: PropTypes.func.isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }).isRequired,
  history: PropTypes.shape({
    replace: PropTypes.func,
  }).isRequired,
  toggleSidebarToggle: PropTypes.func.isRequired,
  enableCodeManagementScreen: PropTypes.bool,
  enableSubscriptionManagementScreen: PropTypes.bool,
  enableSamlConfigurationScreen: PropTypes.bool,
  enableAnalyticsScreen: PropTypes.bool,
  enableLearnerPortal: PropTypes.bool,
  enableLmsConfigurationsScreen: PropTypes.bool,
  enableReportingConfigurationsScreen: PropTypes.bool,
  enablePortalLearnerCreditManagementScreen: PropTypes.bool,
  error: PropTypes.instanceOf(Error),
  loading: PropTypes.bool,
};

export default EnterpriseApp;
