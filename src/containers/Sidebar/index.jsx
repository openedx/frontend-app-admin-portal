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
});

const mapDispatchToProps = dispatch => ({
  expandSidebar: () => dispatch(expandSidebar()),
  collapseSidebar: (usingToggle = false) => dispatch(collapseSidebar(usingToggle)),
});

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps,
  null,
  { withRef: true },
)(Sidebar));
