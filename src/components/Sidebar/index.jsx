import React, {
  useCallback, useContext, useEffect, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Icon } from '@edx/paragon';
import {
  BookOpen, CreditCard, Description, InsertChartOutlined, MoneyOutline, Settings, Support, Tag, TrendingUp,
} from '@edx/paragon/icons';

import { logError } from '@edx/frontend-platform/logging';
import { getConfig } from '@edx/frontend-platform/config';
import IconLink from './IconLink';

import { configuration, features } from '../../config';
import { SubsidyRequestsContext } from '../subsidy-requests';
import { ROUTE_NAMES } from '../EnterpriseApp/data/constants';
import { TOUR_TARGETS } from '../ProductTours/constants';
import { useOnMount } from '../../hooks';
import { EnterpriseSubsidiesContext } from '../EnterpriseSubsidiesContext';
import { EnterpriseAppContext } from '../EnterpriseApp/EnterpriseAppContextProvider';
import LmsApiService from '../../data/services/LmsApiService';

const Sidebar = ({
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
  enterpriseGroupsV1,
}) => {
  const navRef = useRef();
  const widthRef = useRef();
  const { enterpriseCuration: { enterpriseCuration, isNewArchivedContent } } = useContext(EnterpriseAppContext);
  const { subsidyRequestsCounts } = useContext(SubsidyRequestsContext);
  const { canManageLearnerCredit } = useContext(EnterpriseSubsidiesContext);
  const { FEATURE_CONTENT_HIGHLIGHTS } = getConfig();
  const [isSubGroup, setIsSubGroup] = useState(false);
  const hideHighlightsForGroups = enterpriseGroupsV1 && isSubGroup;

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
    async function fetchGroupsData() {
      try {
        const response = await LmsApiService.fetchEnterpriseGroup();
        // we only want to hide the feature if a customer has a group this does not
        // apply to all contexts/include all users
        response.data.results.forEach((group) => {
          if (group.applies_to_all_contexts === false) {
            setIsSubGroup(true);
          }
        });
      } catch (error) {
        logError(error);
      }
    }
    if (enterpriseGroupsV1) {
      fetchGroupsData();
    }
  });

  useEffect(() => {
    const sideBarWidth = getSidebarWidth();
    if (widthRef.current !== sideBarWidth) {
      if (!isExpanded) {
        onWidthChange(sideBarWidth);
      }
      widthRef.current = sideBarWidth;
    }
  }, [getSidebarWidth, isExpanded, isExpandedByToggle, isMobile, onWidthChange]);

  const getMenuItems = () => [
    {
      title: 'Learner Progress Report',
      to: `${baseUrl}/admin/${ROUTE_NAMES.learners}`,
      icon: <Icon src={TrendingUp} />,
    },
    {
      title: 'Analytics',
      to: `${baseUrl}/admin/${ROUTE_NAMES.analytics}`,
      icon: <Icon src={InsertChartOutlined} />,
      hidden: !features.ANALYTICS || !enableAnalyticsScreen,
    },
    {
      title: 'Code Management',
      to: `${baseUrl}/admin/${ROUTE_NAMES.codeManagement}`,
      icon: <Icon src={Tag} />,
      hidden: !features.CODE_MANAGEMENT || !enableCodeManagementScreen,
      notification: !!subsidyRequestsCounts.couponCodes,
    },
    {
      title: 'Subscription Management',
      to: `${baseUrl}/admin/${ROUTE_NAMES.subscriptionManagement}`,
      icon: <Icon src={CreditCard} />,
      hidden: !enableSubscriptionManagementScreen,
      notification: !!subsidyRequestsCounts.subscriptionLicenses,
    },
    {
      title: 'Learner Credit Management',
      id: TOUR_TARGETS.LEARNER_CREDIT,
      to: `${baseUrl}/admin/${ROUTE_NAMES.learnerCredit}`,
      icon: <Icon src={MoneyOutline} />,
      hidden: !canManageLearnerCredit,
    },
    {
      title: 'Highlights',
      id: TOUR_TARGETS.CONTENT_HIGHLIGHTS,
      to: `${baseUrl}/admin/${ROUTE_NAMES.contentHighlights}`,
      icon: <Icon src={BookOpen} />,
      hidden: !FEATURE_CONTENT_HIGHLIGHTS || !enterpriseCuration?.isHighlightFeatureActive || hideHighlightsForGroups,
      notification: isNewArchivedContent,
    },
    {
      title: 'Reporting Configurations',
      to: `${baseUrl}/admin/${ROUTE_NAMES.reporting}`,
      icon: <Icon src={Description} />,
      hidden: !features.REPORTING_CONFIGURATIONS || !enableReportingConfigScreen,
    },
    {
      title: 'Settings',
      id: TOUR_TARGETS.SETTINGS_SIDEBAR,
      to: `${baseUrl}/admin/${ROUTE_NAMES.settings}`,
      icon: <Icon src={Settings} />,
    },
    // NOTE: keep "Support" link the last nav item
    {
      title: 'Support',
      to: configuration.ENTERPRISE_SUPPORT_URL,
      icon: <Icon src={Support} />,
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
};

Sidebar.defaultProps = {
  enableCodeManagementScreen: false,
  enableReportingConfigScreen: false,
  enableSubscriptionManagementScreen: false,
  enableAnalyticsScreen: false,
  onWidthChange: () => {},
  isMobile: false,
  enterpriseGroupsV1: false,
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
  enterpriseGroupsV1: PropTypes.bool,
};

export default Sidebar;
