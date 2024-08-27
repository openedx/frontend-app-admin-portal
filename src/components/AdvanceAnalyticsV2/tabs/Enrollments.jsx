import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import EmptyChart from '../charts/EmptyChart';
import Header from '../Header';
import { ANALYTICS_TABS, CHART_TYPES } from '../data/constants';

const Enrollments = ({
  startDate, endDate, granularity, calculation, enterpriseId,
}) => {
  const intl = useIntl();

  return (
    <div className="tab-enrollments mt-4">
      <div className="enrollments-over-time-chart-container mb-4">
        <Header
          title={intl.formatMessage({
            id: 'advance.analytics.enrollment.tab.chart.enrollments.over.time.title',
            defaultMessage: 'Enrollments Over Time',
            description: 'Title for the enrollments over time chart.',
          })}
          subtitle={intl.formatMessage({
            id: 'advance.analytics.enrollment.tab.chart.enrollments.over.time.subtitle',
            defaultMessage: 'See audit and certificate track enrollments over time.',
            description: 'Subtitle for the enrollments over time chart.',
          })}
          startDate={startDate}
          endDate={endDate}
          granularity={granularity}
          calculation={calculation}
          activeTab={ANALYTICS_TABS.ENROLLMENTS}
          chartType={CHART_TYPES.ENROLLMENTS_OVER_TIME}
          enterpriseId={enterpriseId}
          isDownloadCSV
        />
        <EmptyChart />
      </div>
      <div className="top-10-courses-by-enrollment-chart-container mb-4">
        <Header
          title={intl.formatMessage({
            id: 'advance.analytics.enrollment.tab.chart.top.10.courses.by.enrollment.title',
            defaultMessage: 'Top 10 Courses by Enrollment',
            description: 'Title for the top 10 courses by enrollment chart.',
          })}
          subtitle={intl.formatMessage({
            id: 'advance.analytics.enrollment.tab.chart.top.10.courses.by.enrollment.subtitle',
            defaultMessage: 'See the most popular courses at your organization.',
            description: 'Subtitle for the top 10 courses by enrollment chart.',
          })}
          startDate={startDate}
          endDate={endDate}
          granularity={granularity}
          calculation={calculation}
          activeTab={ANALYTICS_TABS.ENROLLMENTS}
          chartType={CHART_TYPES.TOP_COURSES_BY_ENROLLMENTS}
          enterpriseId={enterpriseId}
          isDownloadCSV
        />
        <EmptyChart />
      </div>
      <div className="top-10-subjects-by-enrollment-chart-container mb-4">
        <Header
          title={intl.formatMessage({
            id: 'advance.analytics.enrollment.tab.chart.top.10.subjects.by.enrollment.title',
            defaultMessage: 'Top 10 Subjects by Enrollment',
            description: 'Title for the top 10 subjects by enrollment chart.',
          })}
          subtitle={intl.formatMessage({
            id: 'advance.analytics.enrollment.tab.chart.top.10.subjects.by.enrollment.subtitle',
            defaultMessage: 'See the most popular subjects at your organization.',
            description: 'Subtitle for the top 10 subjects by enrollment chart.',
          })}
          startDate={startDate}
          endDate={endDate}
          granularity={granularity}
          calculation={calculation}
          activeTab={ANALYTICS_TABS.ENROLLMENTS}
          chartType={CHART_TYPES.TOP_SUBJECTS_BY_ENROLLMENTS}
          enterpriseId={enterpriseId}
          isDownloadCSV
        />
        <EmptyChart />
      </div>
      <div className="individual-enrollments-datatable-container mb-4">
        <Header
          title={intl.formatMessage({
            id: 'advance.analytics.enrollment.tab.datatable.individual.enrollments.title',
            defaultMessage: 'Individual Enrollments',
            description: 'Title for the individual enrollments datatable.',
          })}
          subtitle={intl.formatMessage({
            id: 'advance.analytics.enrollment.tab.datatable.individual.enrollments.subtitle',
            defaultMessage: 'See the individual enrollments from your organization.',
            description: 'Subtitle for the individual enrollments datatable.',
          })}
          startDate={startDate}
          endDate={endDate}
          granularity={granularity}
          calculation={calculation}
          activeTab={ANALYTICS_TABS.ENROLLMENTS}
          enterpriseId={enterpriseId}
          isDownloadCSV
        />
        <EmptyChart />
      </div>
    </div>
  );
};

Enrollments.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  granularity: PropTypes.string.isRequired,
  calculation: PropTypes.string.isRequired,
};

export default Enrollments;
