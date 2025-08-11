import { useState } from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { ANALYTICS_TABS } from '../constants';
import {
  useEnterpriseAnalyticsAggregatesData,
  useEnterpriseAnalyticsData,
  useEnterpriseCompletionsData,
} from '../data/hooks';
import AnalyticsFilters from '../AnalyticsFilters';
import { useAnalyticsFilters } from '../AnalyticsFiltersContext';
import Stats from '../Stats';
import TopSkillsChart from '../charts/TopSkillsChart';
import CompletionsOverTimeChart from '../charts/CompletionsOverTimeChart';
import TopSkillsByCompletionChart from '../charts/TopSkillsByCompletionChart';
import EVENT_NAMES from '../../../eventTracking';
import { get90DayPriorDate } from '../data/utils';
import { DEFAULT_COURSE_VALUE } from '../data/constants';

const Outcomes = ({ enterpriseId }) => {
  // Filters
  const {
    granularity,
    setGranularity,
    calculation,
    setCalculation,
    groupUUID,
    setGroupUUID,
    currentDate,
    groups,
    isGroupsLoading,
  } = useAnalyticsFilters();

  const [startDate, setStartDate] = useState(get90DayPriorDate());
  const [endDate, setEndDate] = useState(currentDate);
  const [course, setCourse] = useState(DEFAULT_COURSE_VALUE);

  // Stats Data
  const { isFetching: isStatsFetching, isError: isStatsError, data: statsData } = useEnterpriseAnalyticsAggregatesData({
    enterpriseCustomerUUID: enterpriseId,
    startDate,
    endDate,
  });

  // Skills Data
  const {
    isFetching: isSkillsFetching, isError: isSkillsError, data: skillsData,
  } = useEnterpriseAnalyticsData({
    enterpriseCustomerUUID: enterpriseId,
    key: ANALYTICS_TABS.SKILLS,
    startDate,
    endDate,
  });

  // Completions Data
  const {
    isFetching: isCompletionsFetching, isError: isCompletionsError, data: completionsData,
  } = useEnterpriseCompletionsData({
    enterpriseCustomerUUID: enterpriseId,
    key: ANALYTICS_TABS.COMPLETIONS,
    startDate,
    endDate,
    granularity,
    calculation,
    groupUUID,
  });

  const handleChartClick = (chartData) => {
    sendEnterpriseTrackEvent(
      enterpriseId,
      `${EVENT_NAMES.ANALYTICS_V2.Outcomes_CHART_CLICKED}`,
      { ...chartData },
    );
  };

  return (
    <div className="mt-4">
      <div className="mt-3">
        <h2 className="font-weight-bold">
          <FormattedMessage
            id="advance.analytics.outcomes.tab.heading"
            defaultMessage="Outcomes"
            description="Heading for outcomes tab"
          />
        </h2>
        <p className="text-justify small mt-1">
          <FormattedMessage
            id="advance.analytics.outcomes.tab.description"
            defaultMessage="This tab displays metrics that describe the outcomes of your learners
            engaging with learning content, including completions and skills gained. Use the date
            range and filters section to filter all the visualizations below it on the page.
            Dig deeper into the specific topics by downloading their associated CSVs."
            description="Description for outcomes tab"
          />
        </p>
      </div>

      {/* Filters */}
      <div className="mt-4 mb-3">
        <AnalyticsFilters
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          course={course}
          setCourse={setCourse}
          granularity={granularity}
          setGranularity={setGranularity}
          calculation={calculation}
          setCalculation={setCalculation}
          groupUUID={groupUUID}
          setGroupUUID={setGroupUUID}
          currentDate={currentDate}
          groups={groups}
          isGroupsLoading={isGroupsLoading}
          activeTab={ANALYTICS_TABS.OUTCOMES}
        />
      </div>

      {/* Stats */}
      <Stats
        title="Outcome and skills"
        data={statsData}
        isFetching={isStatsFetching}
        isError={isStatsError}
        activeTab={ANALYTICS_TABS.OUTCOMES}
      />

      {/* Top Skills */}
      <TopSkillsChart
        isFetching={isSkillsFetching}
        isError={isSkillsError}
        data={skillsData?.topSkills}
        startDate={startDate || statsData?.minEnrollmentDate}
        endDate={endDate || currentDate}
        onClick={handleChartClick}
      />

      {/* Completions Over Time Chart */}
      <CompletionsOverTimeChart
        isFetching={isCompletionsFetching}
        isError={isCompletionsError}
        data={completionsData?.completionsOverTime}
        startDate={startDate || statsData?.minEnrollmentDate}
        endDate={endDate || currentDate}
        granularity={granularity}
        calculation={calculation}
        onClick={handleChartClick}
      />

      {/* Top Skills By Completions Chart */}
      <TopSkillsByCompletionChart
        isFetching={isSkillsFetching}
        isError={isSkillsError}
        data={skillsData?.topSkillsByCompletions}
        startDate={startDate || statsData?.minEnrollmentDate}
        endDate={endDate || currentDate}
        onClick={handleChartClick}
      />

    </div>
  );
};

Outcomes.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

export default Outcomes;
