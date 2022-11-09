import React, {
  useRef, useContext, useEffect, useCallback,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { faFile, faLifeRing } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCreditCard, faTags, faChartLine, faChartBar, faCog,
} from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@edx/paragon';
import { MoneyOutline, BookOpen } from '@edx/paragon/icons';

import { getConfig } from '@edx/frontend-platform/config';
import IconLink from './IconLink';

import { configuration, features } from '../../config';
import { SubsidyRequestsContext } from '../subsidy-requests';
import { ROUTE_NAMES } from '../EnterpriseApp/constants';
import { TOUR_TARGETS } from '../ProductTours/constants';
import { useOnMount } from '../../hooks';
import { EnterpriseSubsidiesContext } from '../EnterpriseSubsidiesContext';

function Sidebar({
  baseUrl,
  expandSidebar,
  collapseSidebar,
  isExpanded,
  isExpandedByToggle,
  enableCodeManagementScreen,
  enableReportingConfigScreen,
  enableSubscriptionManagementScreen,
  enableAnalyticsScreen,
  onWidthChange,
  isMobile,
}) {
  const navRef = useRef();
  const widthRef = useRef();
  const { subsidyRequestsCounts } = useContext(SubsidyRequestsContext);
  const { canManageLearnerCredit } = useContext(EnterpriseSubsidiesContext);
  const { FEATURE_CONTENT_HIGHLIGHTS } = getConfig();
  const getSidebarWidth = useCallback(() => {
    if (navRef && navRef.current) {
      const { width } = navRef.current.getBoundingClientRect();
      return width;
    }
    return null;
  }, []);

  useOnMount(() => {
    if (isExpandedByToggle) {
      // If sidebar is already expanded via the toggle on mount
      const sideBarWidth = getSidebarWidth();
      widthRef.current = sideBarWidth;
      onWidthChange(sideBarWidth);
    }
  });

  useEffect(() => {
    const sideBarWidth = getSidebarWidth();
    if (widthRef.current !== sideBarWidth) {
      onWidthChange(sideBarWidth);
      widthRef.current = sideBarWidth;
    }
  }, [getSidebarWidth, isExpandedByToggle, isMobile, onWidthChange]);

  const getMenuItems = () => [
    {
      title: 'Learner Progress Report',
      to: `${baseUrl}/admin/${ROUTE_NAMES.learners}`,
      icon: <FontAwesomeIcon icon={faChartLine} fixedWidth />,
    },
    {
      title: 'Tableau Analytics',
      to: `${baseUrl}/admin/${ROUTE_NAMES.tableau_analytics}`,
      icon: <FontAwesomeIcon icon={faChartBar} fixedWidth />,
      hidden: !features.TABLEAU_ANALYTICS || !enableAnalyticsScreen,
    },
    {
      title: 'Analytics',
      to: `${baseUrl}/admin/${ROUTE_NAMES.analytics}`,
      icon: <FontAwesomeIcon icon={faChartBar} fixedWidth />,
      hidden: !features.ANALYTICS || !enableAnalyticsScreen,
    },
    {
      title: 'Code Management',
      to: `${baseUrl}/admin/${ROUTE_NAMES.codeManagement}`,
      icon: <FontAwesomeIcon icon={faTags} fixedWidth />,
      hidden: !features.CODE_MANAGEMENT || !enableCodeManagementScreen,
      notification: !!subsidyRequestsCounts.couponCodes,
    },
    {
      title: 'Subscription Management',
      to: `${baseUrl}/admin/${ROUTE_NAMES.subscriptionManagement}`,
      icon: <FontAwesomeIcon icon={faCreditCard} fixedWidth />,
      hidden: !enableSubscriptionManagementScreen,
      notification: !!subsidyRequestsCounts.subscriptionLicenses,
    },
    {
      title: 'Learner Credit Management',
      id: TOUR_TARGETS.LEARNER_CREDIT,
      to: `${baseUrl}/admin/${ROUTE_NAMES.learnerCredit}`,
      icon: <Icon src={MoneyOutline} className="d-inline-block" />,
      hidden: !canManageLearnerCredit,
    },
    {
      title: 'Highlights',
      to: `${baseUrl}/admin/${ROUTE_NAMES.contentHighlights}`,
      icon: <Icon src={BookOpen} className="d-inline-block" />,
      hidden: !FEATURE_CONTENT_HIGHLIGHTS,
    },
    {
      title: 'Reporting Configurations',
      to: `${baseUrl}/admin/${ROUTE_NAMES.reporting}`,
      icon: <FontAwesomeIcon icon={faFile} fixedWidth />,
      hidden: !features.REPORTING_CONFIGURATIONS || !enableReportingConfigScreen,
    },
    {
      title: 'Settings',
      id: TOUR_TARGETS.SETTINGS_SIDEBAR,
      to: `${baseUrl}/admin/${ROUTE_NAMES.settings}`,
      icon: <FontAwesomeIcon icon={faCog} fixedWidth />,
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

  const isSidebarExpanded = isExpanded || isExpandedByToggle;
  // Only collapse sidebar if it's already expanded and wasn't expanded by the toggle
  const shouldSidebarCollapse = isSidebarExpanded && !isExpandedByToggle;
  const hasMobileShadow = isMobile && isSidebarExpanded;

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
          'd-flex': isSidebarExpanded,
          expanded: isSidebarExpanded,
          'has-shadow': !isExpandedByToggle || hasMobileShadow,
        },
      ])}
      onMouseOver={() => !isSidebarExpanded && expandSidebar()}
      onFocus={() => !isSidebarExpanded && expandSidebar()}
      onMouseLeave={() => shouldSidebarCollapse && collapseSidebar()}
      onBlur={() => shouldSidebarCollapse && collapseSidebar()}
      ref={navRef}
    >
      <div className="sidebar-content py-2">
        <ul className="nav nav-pills flex-column m-0">
          {getMenuItems().filter(item => !item.hidden).map(({
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
                isExpanded={isSidebarExpanded}
                onClick={collapseSidebar}
              />
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

Sidebar.defaultProps = {
  enableCodeManagementScreen: false,
  enableReportingConfigScreen: false,
  enableSubscriptionManagementScreen: false,
  enableAnalyticsScreen: false,
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
  onWidthChange: PropTypes.func,
  isMobile: PropTypes.bool,
};

export default Sidebar;
