import React from 'react';
import PropTypes from 'prop-types';
import SidebarToggle from '../SidebarToggle';
import SidebarItem from '../SidebarItem';
import LoadingMessage from '../LoadingMessage';

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

class Sidebar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: null,
    }
  }

  componentDidMount() {
    console.log('componentDidMount in Sidebar::enterpriseId >> ', enterpriseId);
    // const { enterpriseId } = this.props;

    // if (enterpriseId) {
    //   this.props.getSidebarData(enterpriseId, {});
    // }
  }

  renderErrorMessage() {
    return (
      <span classname="sidebar-data-fetch-error">SIDEBAR_DATA_FETCH_ERROR</span>
    );
  }

  renderLoadingMessage() {
    return <LoadingMessage className="sidebar-data-fetch-loading" />;
  }

  render() {
    const { data } = this.state;
    const { sidebarEnabled, sidebarExpanded, loading, error } = this.props;

    debugger;
    if (!sidebarEnabled) {
      return null;
    }

    // return (
    //   <div id="sidebar">
    //     {error && this.renderErrorMessage()}
    //     {loading && !data && this.renderLoadingMessage()}
    //     {data && this.renderTableContent()}
    //   </div>
    // );

    return sidebarExpanded ? (
      <div id="sidebar" className={sidebarExpanded ? 'expanded' : 'collapsed'}>
        <SidebarToggle expanded={sidebarExpanded} toggleSidebar={this.props.toggleSidebar} />
        <div className="sidebar-items">
          {
            SIDEBAR_DATA.map(item => <SidebarItem itemData={item} key={item.category} />)
          }
        </div>
      </div>
    ) :
      (
        <div className="sidebar-collapsed">
          <SidebarToggle expanded={sidebarExpanded} toggleSidebar={this.props.toggleSidebar} />
        </div>
      );
  }
}

Sidebar.defaultProps = {
  sidebarExpanded: false,
  sidebarEnabled: false,
  enterpriseId: '',
  toggleSidebar: () => {},
  getSidebarData: () => {},
};

Sidebar.propTypes = {
  sidebarExpanded: PropTypes.bool,
  sidebarEnabled: PropTypes.bool,
  enterpriseId: PropTypes.string,
  toggleSidebar: PropTypes.func,
  getSidebarData: PropTypes.func,
};

export default Sidebar;
