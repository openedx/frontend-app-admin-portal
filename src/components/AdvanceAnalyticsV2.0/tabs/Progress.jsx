import { useState } from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import { ANALYTICS_TABS } from '../constants';
import {
  useEnterpriseCompletionsData,
  useEnterpriseCourses,
} from '../data/hooks';
import AnalyticsFilters from '../AnalyticsFilters';
import TopCoursesByCompletionTable from '../tables/TopCoursesByCompletionTable';
import TopSubjectsByCompletionTable from '../tables/TopSubjectsByCompletionTable';
import IndividualCompletionsTable from '../tables/IndividualCompletionsTable';
import { get90DayPriorDate } from '../data/utils';
import { ALL_COURSES, GRANULARITY, CALCULATION } from '../data/constants';
import { START_DATE_DEFAULT_TO_TODAY_THRESHOLD_DAYS, useAllFlexEnterpriseGroups } from '../../learner-credit-management/data';

const Progress = ({ enterpriseId }) => {
  const currentDate = new Date().toISOString().split('T')[0];

  // Filters
  const [startDate, setStartDate] = useState(get90DayPriorDate());
  const [endDate, setEndDate] = useState(currentDate);
  const [granularity, setGranularity] = useState(GRANULARITY.WEEKLY);
  const [calculation, setCalculation] = useState(CALCULATION.TOTAL);
  const [groupUUID, setGroupUUID] = useState('');
  const [course, setCourse] = useState(ALL_COURSES);

  // Completions data
  const {
    isFetching, data: completionsData,
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

  return (
    <div className="tab-Progress mt-4">
      <div className="mt-3">
        <h2 className="font-weight-bold">
          <FormattedMessage
            id="advance.analytics.progress.tab.heading"
            defaultMessage="Progress"
            description="Heading for progress tab"
          />
        </h2>
        <p className="text-justify small mt-1">
          <FormattedMessage
            id="advance.analytics.progress.tab.description"
            defaultMessage="This tab displays metrics that describe your learners and their learning progress, as well as popular subjects and courses in your organization. Use the date range and filters section to filter all the visualizations below it on the page. Dig deeper into the specific topics by downloading their associated CSVs."
            description="Description for progress tab"
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
          activeTab={ANALYTICS_TABS.PROGRESS}
          isEnterpriseCoursesFetching={isEnterpriseCoursesFetching}
          enterpriseCourses={enterpriseCourses}
        />
      </div>

      {/* Top 10 Courses/Subjects Tables */}
      <div className="row py-2 gx-4 mb-3">
        {/* Top 10 Courses By Completion */}
        <div className="col-6">
          <div className="bg-primary-100 rounded-lg container-fluid h-100 p-4">
            <TopCoursesByCompletionTable
              isFetching={isFetching}
              data={completionsData?.topCoursesByCompletions}
              startDate={startDate}
              endDate={endDate || currentDate}
              granularity={granularity}
              calculation={calculation}
            />
          </div>
        </div>
        {/* Top 10 Subjects By Completion */}
        <div className="col-6">
          <div className="bg-primary-100 rounded-lg container-fluid h-100 p-4">
            <TopSubjectsByCompletionTable
              isFetching={isFetching}
              data={completionsData?.topSubjectsByCompletions}
              startDate={START_DATE_DEFAULT_TO_TODAY_THRESHOLD_DAYS}
              endDate={endDate || currentDate}
              granularity={granularity}
              calculation={calculation}
            />
          </div>
        </div>
      </div>

      {/* Individual Completions */}
      <div className="bg-primary-100 rounded-lg container-fluid mb-3">
        <div className="h-100 overflow-hidden">
          <IndividualCompletionsTable
            startDate={startDate}
            endDate={endDate || currentDate}
            enterpriseId={enterpriseId}
            groupUUID={groupUUID}
            course={course}
          />
        </div>
      </div>
    </div>
  );
};

Progress.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

export default Progress;
