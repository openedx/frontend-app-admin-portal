import React from 'react';
import PropTypes from 'prop-types';
import SidebarToggle from '../SidebarToggle';
import SidebarItem from '../SidebarItem';

import './Sidebar.scss';

function Sidebar(props) {
  const {
    sidebarEnabled, sidebarExpanded, sidebarData, toggleSidebar, itemsToShow,
  } = props;

  if (!sidebarEnabled) {
    return null;
  }

  return sidebarExpanded ? (
    <div id="sidebar">
      <SidebarToggle expanded={sidebarExpanded} toggleSidebar={toggleSidebar} />
      <div className="sidebar-items">
        {
          sidebarData.map(item => (
            <SidebarItem itemData={item} key={item.category} itemsToShow={itemsToShow} />
          ))
        }
      </div>
    </div>
  ) :
    (
      <div id="sidebar" className="collapsed">
        <SidebarToggle expanded={sidebarExpanded} toggleSidebar={toggleSidebar} />
      </div>
    );
}

Sidebar.defaultProps = {
  sidebarExpanded: false,
  sidebarEnabled: false,
  sidebarData: [],
  itemsToShow: 5,
  toggleSidebar: () => {},
};

Sidebar.propTypes = {
  sidebarExpanded: PropTypes.bool,
  sidebarEnabled: PropTypes.bool,
  sidebarData: PropTypes.array, // eslint-disable-line react/forbid-prop-types
  itemsToShow: PropTypes.number,
  toggleSidebar: PropTypes.func,
};

export default Sidebar;
