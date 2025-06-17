import { FormattedMessage } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import { ANALYTICS_TABS } from '../constants';
import {
  useEnterpriseEngagementData,
  useEnterpriseAnalyticsAggregatesData,
  useEnterpriseAnalyticsData,
  useEnterpriseEnrollmentsData,
} from '../data/hooks';
import AnalyticsFilters from '../AnalyticsFilters';
import { useAnalyticsFilters } from '../AnalyticsFiltersContext';
import Stats from '../Stats';
import SkillsByEnrollmentChart from '../charts/SkillsByEnrollmentChart';
import Leaderboard from '../tables/LeaderboardTable';
import EnrollmentsOverTimeChart from '../charts/EnrollmentsOverTimeChart';
import LearningHoursOverTimeChart from '../charts/LearningHoursOverTimeChart';
import TopCoursesByEnrollmentTable from '../tables/TopCoursesByEnrollmentTable';
import TopCoursesByLearningHoursTable from '../tables/TopCoursesByLearningHoursTable';
import TopSubjectsByEnrollmentTable from '../tables/TopSubjectsByEnrollmentTable';
import TopSubjectsByLearningHoursTable from '../tables/TopSubjectsByLearningHoursTable';

const Engagements = ({ enterpriseId }) => {
  // Filters
  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
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
  });

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
            defaultMessage=" This tab displays metrics that measure your learners’ engagement with learning content.
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
          granularity={granularity}
          setGranularity={setGranularity}
          calculation={calculation}
          setCalculation={setCalculation}
          groupUUID={groupUUID}
          setGroupUUID={setGroupUUID}
          currentDate={currentDate}
          groups={groups}
          isGroupsLoading={isGroupsLoading}
        />
      </div>

      {/* Stats */}
      <Stats
        tabName="Engagement"
        data={statsData}
        isFetching={isStatsFetching}
        isError={isStatsError}
      />

      {/* Skills Chart */}
      <div className="row py-3 gx-4 mb-2">
        {/* Skills By Enrollment Chart */}
        <div className="col-6">
          <SkillsByEnrollmentChart
            isFetching={isSkillsFetching}
            isError={isSkillsError}
            data={skillsData?.topSkillsByEnrollments}
          />
        </div>
        {/* Skills By Learning Hours Charts */}
        <div className="col-6">
          <div className="bg-primary-100 rounded-lg p-3 skills-chart-container h-100">
            <div className="h-100 overflow-hidden">
              <h2 className="font-weight-bold">
                <FormattedMessage
                  id="advance.analytics.skills.by.learning.hours.chart.heading"
                  defaultMessage="Skills by learning hours"
                  description="Heading for skills by learning hours chart on advance analytics"
                />
              </h2>
              <div className="bg-white border-white py-3 mb-2 rounded-lg container-fluid w-100 h-100" />
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-primary-100 rounded-lg container-fluid mb-3">
        <div className="h-100 overflow-hidden">
          <Leaderboard
            startDate={startDate || statsData?.minEnrollmentDate}
            endDate={endDate || currentDate}
            enterpriseId={enterpriseId}
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

      />

      {/* Enrollments Over Time Chart */}
      <EnrollmentsOverTimeChart
        isFetching={isEnrollmentsFetching}
        isError={isEnrollmentsError}
        data={enrollmentsData?.enrollmentsOverTime}
        startDate={startDate || statsData?.minEnrollmentDate}
        endDate={endDate || currentDate}
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
