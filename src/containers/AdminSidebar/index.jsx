import { connect } from 'react-redux';

import Sidebar from '../../components/Sidebar';
import { toggleSidebar } from '../../data/actions/sidebar';

const mapStateToProps = state => ({
  sidebarExpanded: state.sidebar.expanded,
  sidebarEnabled: state.sidebar.enabled,
});

const mapDispatchToProps = dispatch => ({
  toggleSidebar: () => dispatch(toggleSidebar()),
});

const SidebarContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Sidebar);

export default SidebarContainer;
