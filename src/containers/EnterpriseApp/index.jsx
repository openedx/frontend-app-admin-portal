import { connect } from 'react-redux';

import EnterpriseApp from '../../components/EnterpriseApp';

import { toggleSidebarToggle } from '../../data/actions/sidebar';
import { fetchEnterpriseAppData } from '../../data/actions/enterpriseApp';

const mapStateToProps = (state) => {
  const enterpriseListState = state.table['enterprise-list'] || {};
  return {
    adminPortalLearnerProfileViewEnabled: state.portalConfiguration.adminPortalLearnerProfileViewEnabled,
    disableExpiryMessagingForLearnerCredit: state.portalConfiguration.disableExpiryMessagingForLearnerCredit,
    enableAnalyticsScreen: state.portalConfiguration.enableAnalyticsScreen,
    enableCodeManagementScreen: state.portalConfiguration.enableCodeManagementScreen,
    enableLearnerPortal: state.portalConfiguration.enableLearnerPortal,
    enableLmsConfigurationsScreen: state.portalConfiguration.enableLmsConfigurationsScreen,
    enablePortalLearnerCreditManagementScreen: state.portalConfiguration.enablePortalLearnerCreditManagementScreen,
    enableReportingConfigurationsScreen: state.portalConfiguration.enableReportingConfigScreen,
    enableSamlConfigurationScreen: state.portalConfiguration.enableSamlConfigurationScreen,
    enableSubscriptionManagementScreen: state.portalConfiguration.enableSubscriptionManagementScreen,
    enterpriseBranding: state.portalConfiguration.enterpriseBranding,
    enterpriseFeatures: state.portalConfiguration.enterpriseFeatures,
    enterpriseGroupsV2: state.portalConfiguration.enterpriseGroupsV2,
    enterpriseId: state.portalConfiguration.enterpriseId,
    enterpriseName: state.portalConfiguration.enterpriseName,
    enterprises: enterpriseListState.data,
    error: state.portalConfiguration.error,
    loading: state.portalConfiguration.loading,
  };
};

const mapDispatchToProps = dispatch => ({
  fetchEnterpriseAppData: (slug) => {
    dispatch(fetchEnterpriseAppData(slug));
  },
  toggleSidebarToggle: () => {
    dispatch(toggleSidebarToggle());
  },
});

const ConnectedEnterpriseApp = connect(mapStateToProps, mapDispatchToProps)(EnterpriseApp);

export default ConnectedEnterpriseApp;
