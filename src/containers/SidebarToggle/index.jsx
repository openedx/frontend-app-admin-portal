import { connect } from 'react-redux';

import SidebarToggle from '../../components/SidebarToggle';

import {
  expandSidebar,
  collapseSidebar,
} from '../../data/actions/sidebar';

const mapStateToProps = state => ({
  isExpandedByToggle: state.sidebar.isExpandedByToggle,
});

const mapDispatchToProps = dispatch => ({
  expandSidebar: () => dispatch(expandSidebar(true)),
  collapseSidebar: () => dispatch(collapseSidebar(true)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SidebarToggle);
