import React, { useState, useMemo } from 'react';
import { Tabs, Tab, Stack } from '@openedx/paragon';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';

import Hero from '../Hero';
import Engagements from './tabs/Engagements';
import { useEnterpriseAnalyticsAggregatesData } from './data/hooks';
import { useAllFlexEnterpriseGroups } from '../learner-credit-management/data';
import { AnalyticsFiltersContext } from './AnalyticsFiltersContext';

const AnalyticsPage = ({ enterpriseId }) => {
  const [activeTab, setActiveTab] = useState('engagements');
  const [granularity, setGranularity] = useState('');
  const [calculation, setCalculation] = useState('');
  const [groupUUID, setGroupUUID] = useState('');
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const intl = useIntl();
  const { data: groups, isLoading: isGroupsLoading } = useAllFlexEnterpriseGroups(enterpriseId);

  const PAGE_TITLE = intl.formatMessage({
    id: 'analytics.page.title',
    defaultMessage: 'Analytics',
    description: 'Title of the analytics page',
  });

  const { data } = useEnterpriseAnalyticsAggregatesData({
    enterpriseCustomerUUID: enterpriseId,
    startDate,
    endDate,
  });
  const currentDate = new Date().toISOString().split('T')[0];

  const filtersContextValue = useMemo(() => ({
    data,
    startDate: startDate || data?.minEnrollmentDate,
    endDate: endDate || currentDate,
    currentDate,
    granularity,
    calculation,
    groupUUID,
    enterpriseId,
    setStartDate,
    setEndDate,
    setGranularity,
    setCalculation,
    setGroupUUID,
    groups,
    isGroupsLoading,
  }), [
    data, startDate, endDate, currentDate, granularity, calculation,
    groupUUID, enterpriseId, groups, isGroupsLoading,
  ]);

  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <Hero title={PAGE_TITLE} />
      <Stack className="container-fluid w-100" gap={4}>
        <AnalyticsFiltersContext.Provider value={filtersContextValue}>
          <div className="tabs-container pt-3">
            <Tabs
              variant="tabs"
              activeKey={activeTab}
              onSelect={(tab) => {
                setActiveTab(tab);
              }}
            >
              <Tab
                eventKey="engagements"
                title={intl.formatMessage({
                  id: 'advance.analytics.engagement.tab.title',
                  defaultMessage: 'Engagements',
                  description: 'Title for the engagements tab in advance analytics.',
                })}
              >
                <Engagements
                  enterpriseId={enterpriseId}
                />
              </Tab>
              <Tab
                eventKey="Progress"
                title={intl.formatMessage({
                  id: 'advance.analytics.progress.tab.title',
                  defaultMessage: 'Progress',
                  description: 'Title for the progress tab in advance analytics.',
                })}
              />
              <Tab
                eventKey="Outcomes"
                title={intl.formatMessage({
                  id: 'advance.analytics.outcomes.tab.title',
                  defaultMessage: 'Outcomes',
                  description: 'Title for the outcomes tab in advance analytics.',
                })}
              />
            </Tabs>
          </div>
        </AnalyticsFiltersContext.Provider>

      </Stack>
    </>
  );
};

AnalyticsPage.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};
export default AnalyticsPage;
