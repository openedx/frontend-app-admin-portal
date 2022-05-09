import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import EnterpriseApp from '../../components/EnterpriseApp';

import { fetchPortalConfiguration } from '../../data/actions/portalConfiguration';
import { toggleSidebarToggle } from '../../data/actions/sidebar';

const mapStateToProps = (state) => {
  const enterpriseListState = state.table['enterprise-list'] || {};

  return {
    enterprises: enterpriseListState.data,
    error: state.portalConfiguration.error,
    enableCodeManagementScreen: state.portalConfiguration.enableCodeManagementScreen,
    enableSubscriptionManagementScreen: state.portalConfiguration.enableSubscriptionManagementScreen, // eslint-disable-line max-len
    enableSamlConfigurationScreen: state.portalConfiguration.enableSamlConfigurationScreen,
    enableAnalyticsScreen: state.portalConfiguration.enableAnalyticsScreen,
    enableLearnerPortal: state.portalConfiguration.enableLearnerPortal,
    enableLmsConfigurationsScreen: state.portalConfiguration.enableLmsConfigurationsScreen,
    enterpriseId: state.portalConfiguration.enterpriseId,
    enterpriseName: state.portalConfiguration.enterpriseName,
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

export default withRouter(ConnectedEnterpriseApp);
