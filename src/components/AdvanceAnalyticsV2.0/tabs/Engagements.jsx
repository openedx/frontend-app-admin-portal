import { useState } from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { ANALYTICS_TABS } from '../constants';
import { COURSE_TYPES, ALL_COURSES } from '../data/constants';
import {
  useEnterpriseEngagementData,
  useEnterpriseAnalyticsAggregatesData,
  useEnterpriseAnalyticsData,
  useEnterpriseEnrollmentsData,
  useEnterpriseCourses,
  useEnterpriseBudgets,
} from '../data/hooks';
import AnalyticsFilters from '../AnalyticsFilters';
import { useAnalyticsFilters } from '../AnalyticsFiltersContext';
import Stats from '../Stats';
import SkillsByEnrollmentChart from '../charts/SkillsByEnrollmentChart';
import SkillsByLearningHoursChart from '../charts/SkillsByLearningHoursChart';
import Leaderboard from '../tables/LeaderboardTable';
import EnrollmentsOverTimeChart from '../charts/EnrollmentsOverTimeChart';
import LearningHoursOverTimeChart from '../charts/LearningHoursOverTimeChart';
import TopCoursesByEnrollmentTable from '../tables/TopCoursesByEnrollmentTable';
import TopCoursesByLearningHoursTable from '../tables/TopCoursesByLearningHoursTable';
import TopSubjectsByEnrollmentTable from '../tables/TopSubjectsByEnrollmentTable';
import TopSubjectsByLearningHoursTable from '../tables/TopSubjectsByLearningHoursTable';
import EVENT_NAMES from '../../../eventTracking';
import { get90DayPriorDate } from '../data/utils';

const Engagements = ({ enterpriseId }) => {
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
  const [courseType, setCourseType] = useState(COURSE_TYPES.ALL_COURSE_TYPES);
  const [course, setCourse] = useState(ALL_COURSES);
  const [budgetUUID, setBudgetUUID] = useState('');

  // Stats Data
  const { isFetching: isStatsFetching, isError: isStatsError, data: statsData } = useEnterpriseAnalyticsAggregatesData({
    enterpriseCustomerUUID: enterpriseId,
    startDate,
    endDate,
    courseType,
    course,
    budgetUUID,
  });

  // Skills Data
  const {
    isFetching: isSkillsFetching, isError: isSkillsError, data: skillsData,
  } = useEnterpriseAnalyticsData({
    enterpriseCustomerUUID: enterpriseId,
    key: ANALYTICS_TABS.SKILLS,
    startDate,
    endDate,
    courseType,
    course,
    budgetUUID,
  });

  // Engagements Data
  const {
    isFetching: isEngagementFetching, isError: isEngagementError, data: engagementData,
  } = useEnterpriseEngagementData({
    enterpriseCustomerUUID: enterpriseId,
    key: ANALYTICS_TABS.ENGAGEMENTS,
    startDate,
    endDate,
    granularity,
    calculation,
    groupUUID,
    courseType,
    course,
    budgetUUID,
  });

  // Enrollments Data
  const {
    isFetching: isEnrollmentsFetching, isError: isEnrollmentsError, data: enrollmentsData,
  } = useEnterpriseEnrollmentsData({
    enterpriseCustomerUUID: enterpriseId,
    startDate,
    endDate,
    granularity,
    calculation,
    groupUUID,
    courseType,
    course,
    budgetUUID,
  });

  // Enterprise Courses Data
  const {
    isFetching: isEnterpriseCoursesFetching, data: enterpriseCourses,
  } = useEnterpriseCourses({
    enterpriseCustomerUUID: enterpriseId,
    startDate,
    endDate,
    groupUUID,
    courseType,
    budgetUUID,
  });

  // Budgets data
  const {
    isFetching: isBudgetsFetching, data: budgets,
  } = useEnterpriseBudgets({ enterpriseCustomerUUID: enterpriseId });

  const handleChartClick = (data) => {
    sendEnterpriseTrackEvent(
      enterpriseId,
      `${EVENT_NAMES.ANALYTICS_V2.ENGAGEMENT_CHART_CLICKED}`,
      { chartId: data?.points?.[0]?.data?.chartId },
    );
  };

  return (
    <div className="tab-engagements mt-4">
      <div className="mt-3">
        <h2 className="font-weight-bold">
          <FormattedMessage
            id="advance.analytics.engagement.tab.heading"
            defaultMessage="Engagement"
            description="Heading for engagement tab"
          />
        </h2>
        <p className="text-justify small mt-1">
          <FormattedMessage
            id="advance.analytics.engagement.tab.description"
            defaultMessage="This tab displays metrics that measure your learners’ engagement with learning content.
            Use the date range and filters section to filter all the visualizations below it on the page.
            Dig deeper into the specific topics by downloading their associated CSVs."
            description="Description for engagement tab"
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
          courseType={courseType}
          setCourseType={setCourseType}
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
          activeTab={ANALYTICS_TABS.ENGAGEMENTS}
          isEnterpriseCoursesFetching={isEnterpriseCoursesFetching}
          enterpriseCourses={enterpriseCourses}
          budgets={budgets}
          isBudgetsFetching={isBudgetsFetching}
          budgetUUID={budgetUUID}
          setBudgetUUID={setBudgetUUID}
        />
      </div>

      {/* Stats */}
      <Stats
        title="Engagement"
        data={statsData}
        isFetching={isStatsFetching}
        isError={isStatsError}
        activeTab={ANALYTICS_TABS.ENGAGEMENTS}
      />

      {/* Skills Chart */}
      <div className="row py-3 gx-4 mb-2">
        {/* Skills By Enrollment Chart */}
        <div className="col-6">
          <SkillsByEnrollmentChart
            isFetching={isSkillsFetching}
            isError={isSkillsError}
            data={skillsData?.topSkillsByEnrollments}
            onClick={handleChartClick}
          />
        </div>
        {/* Skills By Learning Hours Charts */}
        <div className="col-6">
          <SkillsByLearningHoursChart
            isFetching={isSkillsFetching}
            isError={isSkillsError}
            data={skillsData?.skillsByLearningHours}
            onClick={handleChartClick}
          />
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-primary-100 rounded-lg container-fluid mb-3">
        <div className="h-100 overflow-hidden">
          <Leaderboard
            startDate={startDate || statsData?.minEnrollmentDate}
            endDate={endDate || currentDate}
            enterpriseId={enterpriseId}
            courseType={courseType}
            course={course}
          />
        </div>
      </div>

      {/* Learning Hours Over Time Chart */}
      <LearningHoursOverTimeChart
        isFetching={isEngagementError}
        isError={isEngagementFetching}
        data={engagementData?.engagementOverTime}
        startDate={startDate || statsData?.minEnrollmentDate}
        endDate={endDate || currentDate}
        onClick={handleChartClick}
      />

      {/* Enrollments Over Time Chart */}
      <EnrollmentsOverTimeChart
        isFetching={isEnrollmentsFetching}
        isError={isEnrollmentsError}
        data={enrollmentsData?.enrollmentsOverTime}
        startDate={startDate || statsData?.minEnrollmentDate}
        endDate={endDate || currentDate}
        onClick={handleChartClick}
      />

      {/* Top 10 Courses Tables */}
      <div className="row py-2 gx-4 mb-2">
        {/* Top 10 Courses By Enrollment */}
        <div className="col-6">
          <div className="bg-primary-100 rounded-lg container-fluid h-100 p-4">
            <TopCoursesByEnrollmentTable
              isFetching={isEnrollmentsFetching}
              data={enrollmentsData?.topCoursesByEnrollments}
              startDate={startDate || statsData?.minEnrollmentDate}
              endDate={endDate || currentDate}
            />
          </div>
        </div>
        {/* Top 10 Courses By Learning Hours */}
        <div className="col-6">
          <div className="bg-primary-100 rounded-lg container-fluid h-100 p-4">
            <TopCoursesByLearningHoursTable
              isFetching={isEnrollmentsFetching}
              data={engagementData?.topCoursesByEngagement}
              startDate={startDate || statsData?.minEnrollmentDate}
              endDate={endDate || currentDate}
            />
          </div>
        </div>
      </div>

      {/* Top 10 Subjects Tables */}
      <div className="row py-2 gx-4">
        {/* Top 10 Subjects By Enrollment */}
        <div className="col-6">
          <div className="bg-primary-100 rounded-lg container-fluid h-100 p-4">
            <TopSubjectsByEnrollmentTable
              isFetching={isEnrollmentsFetching}
              data={enrollmentsData?.topSubjectsByEnrollments}
              startDate={startDate || statsData?.minEnrollmentDate}
              endDate={endDate || currentDate}
            />
          </div>
        </div>
        {/* Top 10 Subjects By Learning Hours */}
        <div className="col-6">
          <div className="bg-primary-100 rounded-lg container-fluid h-100 p-4">
            <TopSubjectsByLearningHoursTable
              isFetching={isEngagementFetching}
              data={engagementData?.topSubjectsByEngagement}
              startDate={startDate || statsData?.minEnrollmentDate}
              endDate={endDate || currentDate}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

Engagements.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

export default Engagements;
