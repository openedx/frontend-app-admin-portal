import { useState } from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { ANALYTICS_TABS } from '../constants';
import {
  useEnterpriseAnalyticsAggregatesData,
  useEnterpriseAnalyticsData,
  useEnterpriseCompletionsData,
  useEnterpriseCourses,
} from '../data/hooks';
import AnalyticsFilters from '../AnalyticsFilters';
import Stats from '../Stats';
import TopSkillsChart from '../charts/TopSkillsChart';
import CompletionsOverTimeChart from '../charts/CompletionsOverTimeChart';
import TopSkillsByCompletionChart from '../charts/TopSkillsByCompletionChart';
import EVENT_NAMES from '../../../eventTracking';
import { get90DayPriorDate } from '../data/utils';
import { ALL_COURSES, GRANULARITY, CALCULATION } from '../data/constants';
import { useAllFlexEnterpriseGroups } from '../../learner-credit-management/data';
import SkillsByEnrollmentChart from '../charts/SkillsByEnrollmentChart';
import SkillsByLearningHoursChart from '../charts/SkillsByLearningHoursChart';

const Outcomes = ({ enterpriseId }) => {
  const currentDate = new Date().toISOString().split('T')[0];

  // Filters
  const [startDate, setStartDate] = useState(get90DayPriorDate());
  const [endDate, setEndDate] = useState(currentDate);
  const [granularity, setGranularity] = useState(GRANULARITY.WEEKLY);
  const [calculation, setCalculation] = useState(CALCULATION.TOTAL);
  const [groupUUID, setGroupUUID] = useState('');
  const [course, setCourse] = useState(ALL_COURSES);

  // Stats Data
  const { isFetching: isStatsFetching, isError: isStatsError, data: statsData } = useEnterpriseAnalyticsAggregatesData({
    enterpriseCustomerUUID: enterpriseId,
    tabKey: ANALYTICS_TABS.OUTCOMES,
    startDate,
    endDate,
    groupUUID,
    course,
  });

  // Skills Data
  const {
    isFetching: isSkillsFetching, isError: isSkillsError, data: skillsData,
  } = useEnterpriseAnalyticsData({
    enterpriseCustomerUUID: enterpriseId,
    key: ANALYTICS_TABS.SKILLS,
    startDate,
    endDate,
    groupUUID,
    course,
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
    course,
  });

  // Enterprise Courses Data
  const {
    isFetching: isEnterpriseCoursesFetching, data: enterpriseCourses,
  } = useEnterpriseCourses({
    enterpriseCustomerUUID: enterpriseId,
    startDate,
    endDate,
    groupUUID,
  });

  // Groups Data
  const {
    isLoading: isGroupsLoading, data: groups,
  } = useAllFlexEnterpriseGroups(enterpriseId);

  const trackChartClick = (chartId) => {
    sendEnterpriseTrackEvent(
      enterpriseId,
      `${EVENT_NAMES.ANALYTICS_V2.OUTCOMES_CHART_CLICKED}`,
      { chartId },
    );
  };

  // Event tracking for CSV download clicks
  const trackCsvDownloadClick = (entityId) => {
    sendEnterpriseTrackEvent(
      enterpriseId,
      `${EVENT_NAMES.ANALYTICS_V2.OUTCOMES_CSV_DOWNLOAD_CLICKED}`,
      { entityId },
    );
  };

  // Event tracking for filter clicks
  const trackFilterClick = (filterName, filterValue) => {
    sendEnterpriseTrackEvent(
      enterpriseId,
      `${EVENT_NAMES.ANALYTICS_V2.OUTCOMES_FILTER_CLICKED}`,
      {
        name: filterName,
        value: filterValue,
      },
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
          isEnterpriseCoursesFetching={isEnterpriseCoursesFetching}
          enterpriseCourses={enterpriseCourses}
          trackFilterClick={trackFilterClick}
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

      {/* Skills Chart */}
      <div className="row py-3 gx-4 mb-2">
        {/* Skills By Enrollment Chart */}
        <div className="col-6">
          <SkillsByEnrollmentChart
            isFetching={isSkillsFetching}
            isError={isSkillsError}
            data={skillsData?.topSkillsByEnrollments}
            trackChartClick={trackChartClick}
          />
        </div>
        {/* Skills By Learning Hours Charts */}
        <div className="col-6">
          <SkillsByLearningHoursChart
            isFetching={isSkillsFetching}
            isError={isSkillsError}
            data={skillsData?.skillsByLearningHours}
            trackChartClick={trackChartClick}
          />
        </div>
      </div>

      {/* Top Skills */}
      <TopSkillsChart
        isFetching={isSkillsFetching}
        isError={isSkillsError}
        data={skillsData?.topSkills}
        startDate={startDate}
        endDate={endDate || currentDate}
        trackChartClick={trackChartClick}
        trackCsvDownloadClick={trackCsvDownloadClick}
      />

      {/* Completions Over Time Chart */}
      <CompletionsOverTimeChart
        isFetching={isCompletionsFetching}
        isError={isCompletionsError}
        data={completionsData?.completionsOverTime}
        startDate={startDate}
        endDate={endDate || currentDate}
        granularity={granularity}
        calculation={calculation}
        trackChartClick={trackChartClick}
        trackCsvDownloadClick={trackCsvDownloadClick}
      />

      {/* Top Skills By Completions Chart */}
      <TopSkillsByCompletionChart
        isFetching={isSkillsFetching}
        isError={isSkillsError}
        data={skillsData?.topSkillsByCompletions}
        startDate={startDate}
        endDate={endDate || currentDate}
        trackChartClick={trackChartClick}
        trackCsvDownloadClick={trackCsvDownloadClick}
      />

    </div>
  );
};

Outcomes.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

export default Outcomes;
