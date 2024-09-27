import { connect } from 'react-redux';

import EnterpriseApp from '../../components/EnterpriseApp';

import { fetchPortalConfiguration } from '../../data/actions/portalConfiguration';
import { toggleSidebarToggle } from '../../data/actions/sidebar';

const mapStateToProps = (state) => {
  const enterpriseListState = state.table['enterprise-list'] || {};
  return {
    enterprises: enterpriseListState.data,
    error: state.portalConfiguration.error,
    disableExpiryMessagingForLearnerCredit: state.portalConfiguration.disableExpiryMessagingForLearnerCredit,
    enableCodeManagementScreen: state.portalConfiguration.enableCodeManagementScreen,
    enableSubscriptionManagementScreen: state.portalConfiguration.enableSubscriptionManagementScreen,
    enableSamlConfigurationScreen: state.portalConfiguration.enableSamlConfigurationScreen,
    enableAnalyticsScreen: state.portalConfiguration.enableAnalyticsScreen,
    enableLearnerPortal: state.portalConfiguration.enableLearnerPortal,
    enableLmsConfigurationsScreen: state.portalConfiguration.enableLmsConfigurationsScreen,
    enableReportingConfigurationsScreen: state.portalConfiguration.enableReportingConfigScreen,
    enablePortalLearnerCreditManagementScreen: state.portalConfiguration.enablePortalLearnerCreditManagementScreen,
    enterpriseGroupsV2: state.portalConfiguration.enterpriseGroupsV2,
    enterpriseId: state.portalConfiguration.enterpriseId,
    enterpriseName: state.portalConfiguration.enterpriseName,
    enterpriseFeatures: state.portalConfiguration.enterpriseFeatures,
    enterpriseBranding: state.portalConfiguration.enterpriseBranding,
    loading: state.portalConfiguration.loading,
  };
};

const mapDispatchToProps = dispatch => ({
  fetchPortalConfiguration: (slug) => {
    dispatch(fetchPortalConfiguration(slug));
  },
  toggleSidebarToggle: () => {
    dispatch(toggleSidebarToggle());
  },
});

const ConnectedEnterpriseApp = connect(mapStateToProps, mapDispatchToProps)(EnterpriseApp);

export default ConnectedEnterpriseApp;
