import { connect } from 'react-redux';

import Sidebar from '../../components/Sidebar';
import { toggleSidebar, fetchSidebarData } from '../../data/actions/sidebar';

const mapStateToProps = state => ({
  sidebarExpanded: state.sidebar.expanded,
  sidebarEnabled: state.sidebar.enabled,
  enterpriseId: state.portalConfiguration.enterpriseId,
  loading: state.sidebar.loading,
  error: state.sidebar.error,
});

const mapDispatchToProps = dispatch => ({
  toggleSidebar: () => dispatch(toggleSidebar()),
  getSidebarData: (enterpriseId, options) => {
    dispatch(fetchSidebarData(enterpriseId, options));
  },
});

const SidebarContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Sidebar);

export default SidebarContainer;
