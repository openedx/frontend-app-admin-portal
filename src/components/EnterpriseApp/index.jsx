import React from 'react';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { breakpoints, MediaQuery } from '@edx/paragon';

import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import Sidebar from '../../containers/Sidebar';
import ErrorPage from '../ErrorPage';
import BrandStyles from '../BrandStyles';
import { features } from '../../config';
import EnterpriseAppSkeleton from './EnterpriseAppSkeleton';
import FeatureAnnouncementBanner from '../FeatureAnnouncementBanner';
import EnterpriseAppContextProvider from './EnterpriseAppContextProvider';
import ProductTours from '../ProductTours/ProductTours';
import { SCHOLAR_THEME } from '../settings/data/constants';
import NotFoundPage from '../NotFoundPage';
import EnterpriseAppContent from './EnterpriseAppContent';
import { withLocation, withParams } from '../../hoc';

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
    const { enterpriseSlug } = this.props;
    this.props.fetchPortalConfiguration(enterpriseSlug);
    this.props.toggleSidebarToggle(); // ensure sidebar toggle button is in header
  }

  componentDidUpdate(prevProps) {
    const { pathname } = this.props.location;

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
      enterpriseSlug,
      enableCodeManagementScreen,
      enableSubscriptionManagementScreen,
      enableAnalyticsScreen,
      enableReportingConfigurationsScreen,
      enablePortalLearnerCreditManagementScreen,
      enterpriseId,
      enterpriseName,
      enterpriseFeatures,
      enterpriseBranding,
      loading,
    } = this.props;
    const { sidebarWidth } = this.state;
    const url = this.props.location.pathname;
    const baseUrl = url.split('/').slice(0, 2).join('/');
    const defaultContentPadding = 10; // 10px for appropriate padding
    const { isActive, roles, email } = getAuthenticatedUser() || {};
    // checking for undefined tells if if the user's info is hydrated
    const isUserLoadedAndInactive = isActive !== undefined && !isActive;
    const isUserMissingJWTRoles = !roles?.length;

    if (error) {
      return this.renderError(error);
    }

    if (isUserMissingJWTRoles || isUserLoadedAndInactive) {
      return (
        <Navigate to={`/${enterpriseSlug}/admin/register/activate`} replace />
      );
    }

    if (loading) {
      return <EnterpriseAppSkeleton />;
    }

    if (!enterpriseId) {
      return <NotFoundPage />;
    }

    return (
      <EnterpriseAppContextProvider
        enterpriseId={enterpriseId}
        enterpriseName={enterpriseName}
        enterpriseFeatures={enterpriseFeatures}
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
                  <EnterpriseAppContent
                    email={email}
                    enterpriseId={enterpriseId}
                    enterpriseName={enterpriseName}
                    enableCodeManagementPage={features.CODE_MANAGEMENT && enableCodeManagementScreen}
                    enableReportingPage={features.REPORTING_CONFIGURATIONS && enableReportingConfigurationsScreen}
                    enableSubscriptionManagementPage={enableSubscriptionManagementScreen}
                    enableAnalyticsPage={features.ANALYTICS && enableAnalyticsScreen}
                  >
                    <FeatureAnnouncementBanner enterpriseSlug={enterpriseSlug} />
                  </EnterpriseAppContent>
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
  enterpriseFeatures: {},
  enterpriseBranding: {
    primary_color: SCHOLAR_THEME.button,
    secondary_color: SCHOLAR_THEME.banner,
    tertiary_color: SCHOLAR_THEME.accent,
  },
  error: null,
  enableCodeManagementScreen: false,
  enableSubscriptionManagementScreen: false,
  enableAnalyticsScreen: false,
  enableReportingConfigurationsScreen: false,
  enablePortalLearnerCreditManagementScreen: false,
  loading: true,
};

EnterpriseApp.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  enterpriseId: PropTypes.string,
  enterpriseName: PropTypes.string,
  enterpriseFeatures: PropTypes.shape({
    topDownAssignmentRealTimeLcm: PropTypes.bool,
  }),
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
  toggleSidebarToggle: PropTypes.func.isRequired,
  enableCodeManagementScreen: PropTypes.bool,
  enableSubscriptionManagementScreen: PropTypes.bool,
  enableAnalyticsScreen: PropTypes.bool,
  enableReportingConfigurationsScreen: PropTypes.bool,
  enablePortalLearnerCreditManagementScreen: PropTypes.bool,
  error: PropTypes.instanceOf(Error),
  loading: PropTypes.bool,
};

export default withLocation(withParams(EnterpriseApp));
