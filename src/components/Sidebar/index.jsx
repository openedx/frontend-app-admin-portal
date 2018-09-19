import React from 'react';
import PropTypes from 'prop-types';
import SidebarToggle from '../SidebarToggle';
import SidebarItem from '../SidebarItem';

import './Sidebar.scss';

// TODO: Sample data. In real world this will be fetched from server.
const SIDEBAR_DATA = [
  {
    category: 'Catalogs',
    showAllButton: true,
    items: [
      {
        type: 'TXT_LINK',
        title: 'JS Catalog',
        href: 'https://js.org/',
      }, {
        type: 'TXT_LINK',
        title: 'PY Catalog',
        href: 'https://www.python.org/',
      }, {
        type: 'TXT_LINK',
        title: 'ReactJS Catalog',
        href: 'https://reactjs.org/',
      }, {
        type: 'TXT_LINK',
        title: 'GO Catalog',
        href: 'https://www.python.org/',
      }, {
        type: 'TXT_LINK',
        title: 'PHP Catalog',
        href: 'https://js.org/',
      }, {
        type: 'TXT_LINK',
        title: 'Google Catalog',
        href: 'https://www.python.org/',
      }, {
        type: 'TXT_LINK',
        title: 'Rust Catalog',
        href: 'https://js.org/',
      }, {
        type: 'TXT_LINK',
        title: 'Java Catalog',
        href: 'https://www.python.org/',
      }, {
        type: 'TXT_LINK',
        title: 'Redux Catalog',
        href: 'https://www.python.org/',
      }, {
        type: 'BTN_LINK',
        title: 'Create New Catalog',
        href: 'https://reactjs.org/',
        classes: 'fa fa-plus',
      },
    ],
  }, {
    category: 'Learner Management',
    showAllButton: false,
    items: [
      {
        type: 'TXT_LINK',
        title: 'Peoeple & Groups',
        href: 'https://edx.org/',
      }, {
        type: 'TXT_LINK',
        title: 'Account Finances',
        href: 'https://edx.org/',
      }, {
        type: 'TXT_LINK',
        title: 'Analytics',
        href: 'https://edx.org/',
      }, {
        type: 'TXT_LINK',
        title: 'Admin Settings',
        href: 'https://edx.org/',
      }, {
        type: 'TXT_LINK',
        title: 'Help & FAQ',
        href: 'https://edx.org/',
      },
    ],
  },
];

function Sidebar(props) {
  const { sidebarEnabled, sidebarExpanded, sidebarData, toggleSidebar } = props;

  if (!sidebarEnabled) {
    return null;
  }

  return sidebarExpanded ? (
    <div id="sidebar" className={sidebarExpanded ? 'expanded' : 'collapsed'}>
      <SidebarToggle expanded={sidebarExpanded} toggleSidebar={toggleSidebar} />
      <div className="sidebar-items">
        {
          sidebarData.map(item => <SidebarItem itemData={item} key={item.category} />)
        }
      </div>
    </div>
  ) :
    (
      <div className="sidebar-collapsed">
        <SidebarToggle expanded={sidebarExpanded} toggleSidebar={toggleSidebar} />
      </div>
    );
}

Sidebar.defaultProps = {
  sidebarExpanded: false,
  sidebarEnabled: false,
  sidebarData: [],
  toggleSidebar: () => {},
};

Sidebar.propTypes = {
  sidebarExpanded: PropTypes.bool,
  sidebarEnabled: PropTypes.bool,
  sidebarData: PropTypes.array,
  toggleSidebar: PropTypes.func,
};

export default Sidebar;
