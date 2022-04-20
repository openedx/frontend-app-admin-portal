import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { faFile, faIdCard, faLifeRing } from '@fortawesome/free-regular-svg-icons';
import {
  faCreditCard, faTags, faChartLine, faChartBar, faUniversity, faCog,
} from '@fortawesome/free-solid-svg-icons';

import IconLink from './IconLink';

import { configuration, features } from '../../config';
import { SubsidyRequestsContext } from '../subsidy-requests';
import { ROUTE_NAMES } from '../EnterpriseApp/constants';
import { TOUR_TARGETS } from '../ProductTours/constants';

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
      isExpandedByToggle !== prevProps.isExpandedByToggle
      || isMobile !== prevProps.isMobile
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
      enableSamlConfigurationScreen,
      enableAnalyticsScreen,
      enableLmsConfigurationsScreen,
    } = this.props;

    const { subsidyRequestsCounts } = this.context;

    return [
      {
        title: 'Learner Progress Report',
        to: `${baseUrl}/admin/learners`,
        icon: faChartLine,
        notification: false,
      },
      {
        title: 'Code Management',
        to: `${baseUrl}/admin/coupons`,
        icon: faTags,
        hidden: !features.CODE_MANAGEMENT || !enableCodeManagementScreen,
        notification: !!subsidyRequestsCounts.couponCodes,
      },
      {
        title: 'Reporting Configurations',
        to: `${baseUrl}/admin/reporting`,
        icon: faFile,
        hidden: !features.REPORTING_CONFIGURATIONS || !enableReportingConfigScreen,
        notification: false,
      },
      {
        title: 'Subscription Management',
        to: `${baseUrl}/admin/subscriptions`,
        icon: faCreditCard,
        hidden: !enableSubscriptionManagementScreen,
        notification: !!subsidyRequestsCounts.subscriptionLicenses,
      },
      {
        title: 'Analytics',
        to: `${baseUrl}/admin/analytics`,
        icon: faChartBar,
        hidden: !features.ANALYTICS || !enableAnalyticsScreen,
        notification: false,
      },
      {
        title: 'SAML Configuration',
        to: `${baseUrl}/admin/samlconfiguration`,
        icon: faIdCard,
        hidden: !features.SAML_CONFIGURATION || !enableSamlConfigurationScreen,
        notification: false,
      },
      {
        title: 'LMS Integration Configuration',
        to: `${baseUrl}/admin/lmsintegrations`,
        icon: faUniversity,
        hidden: !features.EXTERNAL_LMS_CONFIGURATION || !enableLmsConfigurationsScreen,
        notification: false,
      },
      {
        title: 'Settings',
        id: TOUR_TARGETS.SETTINGS_SIDEBAR,
        to: `${baseUrl}/admin/${ROUTE_NAMES.settings}/`,
        icon: faCog,
        hidden: !features.SETTINGS_PAGE,
        notification: false,
      },
      // NOTE: keep "Support" link the last nav item
      {
        title: 'Support',
        to: configuration.ENTERPRISE_SUPPORT_URL,
        icon: faLifeRing,
        hidden: !features.SUPPORT,
        external: true,
        notification: false,
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
        aria-label="sidebar"
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
        ref={this.element}
      >
        <div className="sidebar-content py-2">
          <ul className="nav nav-pills flex-column m-0">
            {this.getMenuItems().filter(item => !item.hidden).map(item => (
              <li key={item.to} className="nav-item">
                <IconLink
                  {...item}
                  isExpanded={this.isSidebarExpanded()}
                />
              </li>
            ))}
          </ul>
        </div>
      </nav>
    );
  }
}

Sidebar.contextType = SubsidyRequestsContext;

Sidebar.defaultProps = {
  enableCodeManagementScreen: false,
  enableReportingConfigScreen: false,
  enableSubscriptionManagementScreen: false,
  enableSamlConfigurationScreen: false,
  enableAnalyticsScreen: false,
  enableLmsConfigurationsScreen: false,
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
  enableAnalyticsScreen: PropTypes.bool,
  enableSamlConfigurationScreen: PropTypes.bool,
  enableLmsConfigurationsScreen: PropTypes.bool,
  onWidthChange: PropTypes.func,
  isMobile: PropTypes.bool,
};

export default Sidebar;
