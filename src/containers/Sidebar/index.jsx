import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import Sidebar from '../../components/Sidebar';

import {
  expandSidebar,
  collapseSidebar,
} from '../../data/actions/sidebar';

const mapStateToProps = state => ({
  isExpanded: state.sidebar.isExpanded,
  isExpandedByToggle: state.sidebar.isExpandedByToggle,
  enableCodeManagementScreen: state.portalConfiguration.enableCodeManagementScreen,
  enableReportingConfigScreen: state.portalConfiguration.enableReportingConfigScreen,
  enableSubscriptionManagementScreen: state.portalConfiguration.enableSubscriptionManagementScreen,
  enableSamlConfigurationScreen: state.portalConfiguration.enableSamlConfigurationScreen,
  enableLearnerPortal: state.portalConfiguration.enableLearnerPortal,
  enableLmsConfigurationsScreen: state.portalConfiguration.enableLmsConfigurationsScreen,
  enableAnalyticsScreen: state.portalConfiguration.enableAnalyticsScreen,
});

const mapDispatchToProps = dispatch => ({
  expandSidebar: () => dispatch(expandSidebar()),
  collapseSidebar: (usingToggle = false) => dispatch(collapseSidebar(usingToggle)),
});

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps,
)(Sidebar));
