import React, {
  useCallback, useContext, useEffect, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Icon } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  BookOpen, CreditCard, Description, InsertChartOutlined, MoneyOutline,
  Person, Settings, Support, Tag, TrendingUp,
} from '@openedx/paragon/icons';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { logError } from '@edx/frontend-platform/logging';

import IconLink from './IconLink';
import { configuration, features } from '../../config';
import { SubsidyRequestsContext } from '../subsidy-requests';
import { ROUTE_NAMES } from '../EnterpriseApp/data/constants';
import { TOUR_TARGETS } from '../ProductTours/constants';
import {
  ADMINISTER_SUBSCRIPTIONS_TARGETS,
  ANALYTICS_INSIGHTS_TARGETS,
  CUSTOMIZE_REPORTS_SIDEBAR,
  TRACK_LEARNER_PROGRESS_TARGETS,
} from '../ProductTours/AdminOnboardingTours/constants';
import { useOnMount } from '../../hooks';
import { EnterpriseSubsidiesContext } from '../EnterpriseSubsidiesContext';
import { EnterpriseAppContext } from '../EnterpriseApp/EnterpriseAppContextProvider';
import LmsApiService from '../../data/services/LmsApiService';
import { GROUP_TYPE_BUDGET } from '../PeopleManagement/constants';

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
  onMount,
}) => {
  const sidebarRef = useRef();
  const sidebarContentRef = useRef();
  const sidebarNavRef = useRef();
  const sidebarWidthRef = useRef();
  const { enterpriseCuration: { enterpriseCuration, isNewArchivedContent } } = useContext(EnterpriseAppContext);
  const { subsidyRequestsCounts } = useContext(SubsidyRequestsContext);
  const { canManageLearnerCredit } = useContext(EnterpriseSubsidiesContext);
  const { FEATURE_CONTENT_HIGHLIGHTS } = getConfig();
  const isEdxStaff = getAuthenticatedUser().administrator;
  const [hasBudgetGroup, setHasBudgetGroup] = useState(false);
  const hideHighlightsForGroups = hasBudgetGroup && !isEdxStaff;
  const intl = useIntl();

  const getSidebarWidth = useCallback(() => {
    if (sidebarRef && sidebarRef.current) {
      const { width } = sidebarRef.current.getBoundingClientRect();
      return width;
    }
    return null;
  }, []);

  useOnMount(() => {
    if (!sidebarContentRef.current || !sidebarNavRef.current) {
      return;
    }
    const sidebarContentPadding = {
      top: parseInt(global.getComputedStyle(sidebarContentRef.current).paddingTop, 10),
      bottom: parseInt(global.getComputedStyle(sidebarContentRef.current).paddingBottom, 10),
    };
    const sidebarNavHeight = sidebarNavRef.current.getBoundingClientRect().height;
    const sidebarHeight = sidebarNavHeight + sidebarContentPadding.top + sidebarContentPadding.bottom;
    onMount({ sidebarHeight });
  });

  useOnMount(() => {
    if (isExpandedByToggle) {
      // If sidebar is already expanded via the toggle on mount
      const sideBarWidth = getSidebarWidth();
      sidebarWidthRef.current = sideBarWidth;
      onWidthChange(sideBarWidth);
    }
  });

  useOnMount(() => {
    async function fetchGroupsData() {
      try {
        const response = await LmsApiService.fetchEnterpriseGroups();
        // we only want to hide the feature if a customer has a group this does not
        // apply to all contexts/include all users
        response.data.results.forEach((group) => {
          if (group.group_type === GROUP_TYPE_BUDGET) {
            setHasBudgetGroup(true);
          }
        });
      } catch (error) {
        logError(error);
      }
    }
    if (!isEdxStaff) {
      fetchGroupsData();
    }
  });

  useEffect(() => {
    const sideBarWidth = getSidebarWidth();
    if (sidebarWidthRef.current !== sideBarWidth) {
      if (!isExpanded) {
        onWidthChange(sideBarWidth);
      }
      sidebarWidthRef.current = sideBarWidth;
    }
  }, [getSidebarWidth, isExpanded, isExpandedByToggle, isMobile, onWidthChange]);

  const getMenuItems = () => [
    {
      title: 'Learner Progress Report',
      to: `${baseUrl}/admin/${ROUTE_NAMES.learners}`,
      icon: <Icon src={TrendingUp} />,
      id: TRACK_LEARNER_PROGRESS_TARGETS.LEARNER_PROGRESS_SIDEBAR,
    },
    {
      title: 'Analytics',
      to: `${baseUrl}/admin/${ROUTE_NAMES.analytics}`,
      icon: <Icon src={InsertChartOutlined} />,
      hidden: !features.ANALYTICS || !enableAnalyticsScreen,
      id: ANALYTICS_INSIGHTS_TARGETS.SIDEBAR,
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
      id: ADMINISTER_SUBSCRIPTIONS_TARGETS.SIDEBAR,
    },
    {
      title: 'Learner Credit Management',
      id: TOUR_TARGETS.LEARNER_CREDIT,
      to: `${baseUrl}/admin/${ROUTE_NAMES.learnerCredit}`,
      icon: <Icon src={MoneyOutline} />,
      hidden: !canManageLearnerCredit,
    },
    {
      title: 'People Management',
      id: TOUR_TARGETS.PEOPLE_MANAGEMENT,
      to: `${baseUrl}/admin/${ROUTE_NAMES.peopleManagement}`,
      icon: <Icon src={Person} />,
    },
    {
      title: intl.formatMessage({
        id: 'sidebar.menu.item.highlights.title',
        defaultMessage: 'Highlights',
        description: 'Sidebar menu item title for highlights.',
      }),
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
      id: CUSTOMIZE_REPORTS_SIDEBAR,
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
      data-testid="nav-sidebar"
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
      ref={sidebarRef}
    >
      <div className="sidebar-content py-2" ref={sidebarContentRef}>
        <ul className="nav nav-pills flex-column m-0" ref={sidebarNavRef}>
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
  onMount: PropTypes.func.isRequired,
  isMobile: PropTypes.bool,
};

export default Sidebar;
