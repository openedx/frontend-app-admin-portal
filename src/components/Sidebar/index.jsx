import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { faFile, faIdCard, faLifeRing } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCreditCard, faTags, faChartLine, faChartBar, faUniversity, faCog,
} from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@edx/paragon';
import { MoneyOutline } from '@edx/paragon/icons';
import { getConfig } from '@edx/frontend-platform/config';

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
      enableLearnerPortal,
      enableLmsConfigurationsScreen,
    } = this.props;

    const { subsidyRequestsCounts } = this.context;

    // Hide Settings link if there are no visible tabs
    const shouldShowSettingsLink = (
      features.SETTINGS_PAGE && (
        enableLearnerPortal || features.FEATURE_SSO_SETTINGS_TAB
       || (features.EXTERNAL_LMS_CONFIGURATION && features.SETTINGS_PAGE_LMS_TAB && enableLmsConfigurationsScreen)
      )
    );

    return [
      {
        title: 'Learner Progress Report',
        to: `${baseUrl}/admin/learners`,
        icon: <span><FontAwesomeIcon icon={faChartLine} fixedWidth /></span>,
      },
      {
        title: 'Analytics',
        to: `${baseUrl}/admin/analytics`,
        icon: <FontAwesomeIcon icon={faChartBar} fixedWidth />,
        hidden: !features.ANALYTICS || !enableAnalyticsScreen,
      },
      {
        title: 'Code Management',
        to: `${baseUrl}/admin/coupons`,
        icon: <FontAwesomeIcon icon={faTags} fixedWidth />,
        hidden: !features.CODE_MANAGEMENT || !enableCodeManagementScreen,
        notification: !!subsidyRequestsCounts.couponCodes,
      },
      {
        title: 'Subscription Management',
        to: `${baseUrl}/admin/subscriptions`,
        icon: <FontAwesomeIcon icon={faCreditCard} fixedWidth />,
        hidden: !enableSubscriptionManagementScreen,
        notification: !!subsidyRequestsCounts.subscriptionLicenses,
      },
      {
        title: 'Learner Credit Management',
        to: `${baseUrl}/admin/learner-credit`,
        icon: <Icon src={MoneyOutline} className="d-inline-block" />,
        hidden: !getConfig().FEATURE_LEARNER_CREDIT_MANAGEMENT,
      },
      {
        title: 'Reporting Configurations',
        to: `${baseUrl}/admin/reporting`,
        icon: <FontAwesomeIcon icon={faFile} fixedWidth />,
        hidden: !features.REPORTING_CONFIGURATIONS || !enableReportingConfigScreen,
      },
      {
        title: 'SAML Configuration',
        to: `${baseUrl}/admin/samlconfiguration`,
        icon: <FontAwesomeIcon icon={faIdCard} fixedWidth />,
        hidden: !features.SAML_CONFIGURATION || !enableSamlConfigurationScreen,
      },
      {
        title: 'LMS Integration Configuration',
        to: `${baseUrl}/admin/lmsintegrations`,
        icon: <FontAwesomeIcon icon={faUniversity} fixedWidth />,
        hidden: !features.EXTERNAL_LMS_CONFIGURATION || !enableLmsConfigurationsScreen,
      },
      {
        title: 'Settings',
        id: TOUR_TARGETS.SETTINGS_SIDEBAR,
        to: `${baseUrl}/admin/${ROUTE_NAMES.settings}/`,
        icon: <FontAwesomeIcon icon={faCog} fixedWidth />,
        hidden: !shouldShowSettingsLink,
      },
      // NOTE: keep "Support" link the last nav item
      {
        title: 'Support',
        to: configuration.ENTERPRISE_SUPPORT_URL,
        icon: <FontAwesomeIcon icon={faLifeRing} fixedWidth />,
        hidden: !features.SUPPORT,
        external: true,
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
            {this.getMenuItems().filter(item => !item.hidden).map(({
              id, to, title, icon, notification, external,
            }) => (
              <li key={to} className="nav-item">
                <IconLink
                  id={id}
                  to={to}
                  title={title}
                  icon={icon}
                  notification={notification}
                  external={external}
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
  enableLearnerPortal: false,
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
  enableLearnerPortal: PropTypes.bool,
  enableLmsConfigurationsScreen: PropTypes.bool,
  onWidthChange: PropTypes.func,
  isMobile: PropTypes.bool,
};

export default Sidebar;
