import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import IconLink from './IconLink';

import { features } from '../../config';

import './Sidebar.scss';

class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.element = React.createRef();
  }

  componentDidMount() {
    const { isExpandedByToggle } = this.props;

    if (isExpandedByToggle) {
      // If sidebar is already expanded via the toggle on mount
      const width = this.getSidebarWidth();
      this.props.onWidthChange(width);
    }
  }

  componentDidUpdate(prevProps) {
    const { isExpandedByToggle, isMobile } = this.props;

    // Pass new width up to parent component if `isExpandedByToggle` or `isMobile` props change
    const shouldUpdateSidebarWidth = (
      isExpandedByToggle !== prevProps.isExpandedByToggle ||
      isMobile !== prevProps.isMobile
    );

    if (shouldUpdateSidebarWidth) {
      const width = this.getSidebarWidth();
      this.props.onWidthChange(width);
    }
  }

  getMenuItems() {
    const {
      baseUrl,
      enableCodeManagementScreen,
      enableReportingConfigScreen,
      enableSubscriptionManagementScreen,
    } = this.props;

    return [
      {
        title: 'Learner Report',
        to: `${baseUrl}/admin/learners`,
        iconClassName: 'fa-line-chart',
      },
      {
        title: 'Code Management',
        to: `${baseUrl}/admin/coupons`,
        iconClassName: 'fa-tags',
        hidden: !features.CODE_MANAGEMENT || !enableCodeManagementScreen,
      },
      {
        title: 'Reporting Configurations',
        to: `${baseUrl}/admin/reporting`,
        iconClassName: 'fa-file',
        hidden: !features.REPORTING_CONFIGURATIONS || !enableReportingConfigScreen,
      },
      {
        title: 'Subscription Management',
        to: `${baseUrl}/admin/subscription`,
        iconClassName: 'fa-credit-card',
        hidden: !features.SUBSCRIPTION_MANAGEMENT || !enableSubscriptionManagementScreen,
      },
      {
        title: 'Support',
        to: `${baseUrl}/admin/support`,
        iconClassName: 'fa-support',
        hidden: !features.SUPPORT,
      },
    ];
  }

  getSidebarWidth() {
    if (this.element && this.element.current) {
      const { width } = this.element.current.getBoundingClientRect();
      return width;
    }
    return null;
  }

  isSidebarExpanded() {
    const { isExpanded, isExpandedByToggle } = this.props;
    return isExpanded || isExpandedByToggle;
  }

  shouldSidebarCollapse() {
    // Only collapse sidebar if it's already expanded and wasn't expanded by the toggle
    return this.isSidebarExpanded() && !this.props.isExpandedByToggle;
  }

  render() {
    const {
      expandSidebar,
      collapseSidebar,
      isExpandedByToggle,
      isMobile,
    } = this.props;

    const hasMobileShadow = isMobile && this.isSidebarExpanded();

    return (
      <nav
        id="sidebar"
        className={classNames([
          'sidebar',
          'border-right',
          'h-100',
          'd-none',
          'd-lg-flex',
          {
            'd-flex': this.isSidebarExpanded(),
            expanded: this.isSidebarExpanded(),
            'has-shadow': !isExpandedByToggle || hasMobileShadow,
          },
        ])}
        onMouseOver={() => !this.isSidebarExpanded() && expandSidebar()}
        onFocus={() => !this.isSidebarExpanded() && expandSidebar()}
        onMouseLeave={() => this.shouldSidebarCollapse() && collapseSidebar()}
        onBlur={() => this.shouldSidebarCollapse() && collapseSidebar()}
        aria-expanded={this.isSidebarExpanded()}
        ref={this.element}
      >
        <div className="sidebar-content py-2">
          <nav className="nav nav-pills flex-column m-0">
            {this.getMenuItems().filter(item => !item.hidden).map(item => (
              <li key={item.to} className="nav-item">
                <IconLink
                  {...item}
                  isExpanded={this.isSidebarExpanded()}
                />
              </li>
            ))}
          </nav>
        </div>
      </nav>
    );
  }
}

Sidebar.defaultProps = {
  enableCodeManagementScreen: false,
  enableReportingConfigScreen: false,
  enableSubscriptionManagementScreen: false,
  onWidthChange: () => {},
  isMobile: false,
};

Sidebar.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  expandSidebar: PropTypes.func.isRequired,
  collapseSidebar: PropTypes.func.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  isExpandedByToggle: PropTypes.bool.isRequired,
  enableCodeManagementScreen: PropTypes.bool,
  enableReportingConfigScreen: PropTypes.bool,
  enableSubscriptionManagementScreen: PropTypes.bool,
  onWidthChange: PropTypes.func,
  isMobile: PropTypes.bool,
};

export default Sidebar;
