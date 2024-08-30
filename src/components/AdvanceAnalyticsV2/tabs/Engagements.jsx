import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import Header from '../Header';
import { ANALYTICS_TABS, CHART_TYPES, chartColorMap } from '../data/constants';
import AnalyticsTable from './AnalyticsTable';
import ChartWrapper from '../charts/ChartWrapper';
import { useEnterpriseAnalyticsData } from '../data/hooks';

const Engagements = ({
  startDate, endDate, granularity, calculation, enterpriseId,
}) => {
  const intl = useIntl();
  const {
    isLoading, isError, data,
  } = useEnterpriseAnalyticsData({
    enterpriseCustomerUUID: enterpriseId,
    key: ANALYTICS_TABS.ENGAGEMENTS,
    startDate,
    endDate,
    granularity,
    calculation,
  });

  return (
    <div className="tab-engagements mt-4">
      <div className="learning-hours-over-time-chart-container mb-4">
        <Header
          title={intl.formatMessage({
            id: 'advance.analytics.engagement.tab.chart.learning.hours.over.time.title',
            defaultMessage: 'Learning Hours Over Time',
            description: 'Title for the learning hours over time chart.',
          })}
          subtitle={intl.formatMessage({
            id: 'advance.analytics.engagement.tab.chart.learning.hours.over.time.subtitle',
            defaultMessage: 'See audit and certificate track hours of learning over time.',
            description: 'Subtitle for the learning hours over time chart.',
          })}
          startDate={startDate}
          endDate={endDate}
          activeTab={ANALYTICS_TABS.ENGAGEMENTS}
          chartType={CHART_TYPES.ENGAGEMENTS_OVER_TIME}
          enterpriseId={enterpriseId}
          isDownloadCSV
        />
        <ChartWrapper
          isLoading={isLoading}
          isError={isError}
          chartType="LineChart"
          chartProps={{
            data: data?.engagementsOverTime,
            xKey: 'activityDate',
            yKey: 'sum',
            colorKey: 'enrollType',
            colorMap: chartColorMap,
            xAxisTitle: '',
            yAxisTitle: 'Number of Learning Hours',
            hovertemplate: 'Date: %{x}<br>Learning Hours: %{y}',
          }}
          loadingMessage={intl.formatMessage({
            id: 'advance.analytics.engagements.tab.chart.learning.hours.over.time.loading.message',
            defaultMessage: 'Loading learning hours over time chart data',
            description: 'Loading message for the learning hours over time chart.',
          })}
        />
      </div>
      <div className="top-10-courses-by-learning-hours-chart-container mb-4">
        <Header
          title={intl.formatMessage({
            id: 'advance.analytics.engagement.tab.chart.top.10.courses.by.learning.hours.title',
            defaultMessage: 'Top 10 Courses by Learning Hours',
            description: 'Title for the top 10 courses by learning hours chart.',
          })}
          subtitle={intl.formatMessage({
            id: 'advance.analytics.engagement.tab.chart.top.10.courses.by.learning.hours.subtitle',
            defaultMessage: 'See the courses in which your learners spend the most time.',
            description: 'Subtitle for the top 10 courses by learning hours chart.',
          })}
          startDate={startDate}
          endDate={endDate}
          activeTab={ANALYTICS_TABS.ENGAGEMENTS}
          chartType={CHART_TYPES.TOP_COURSES_BY_ENGAGEMENTS}
          enterpriseId={enterpriseId}
          isDownloadCSV
        />
        <ChartWrapper
          isLoading={isLoading}
          isError={isError}
          chartType="BarChart"
          chartProps={{
            data: data?.topCoursesByEngagement,
            xKey: 'courseKey',
            yKey: 'count',
            colorKey: 'enrollType',
            colorMap: chartColorMap,
            yAxisTitle: intl.formatMessage({
              id: 'advance.analytics.engagements.tab.chart.top.10.courses.by.learning.hours.y.axis.title',
              defaultMessage: 'Number of Learning Hours',
              description: 'Y-axis title for the top 10 courses by learning hours chart.',
            }),
            hovertemplate: 'Course: %{x}<br>Learning Hours: %{y}',
          }}
          loadingMessage={intl.formatMessage({
            id: 'advance.analytics.engagements.tab.chart.top.10.courses.by.learning.hours.loading.message',
            defaultMessage: 'Loading top 10 courses by learning hours chart data',
            description: 'Loading message for the top 10 courses by learning hours chart.',
          })}
        />
      </div>
      <div className="top-10-subjects-by-learning-hours-chart-container mb-4">
        <Header
          title={intl.formatMessage({
            id: 'advance.analytics.engagement.tab.chart.top.10.subjects.by.learning.hours.title',
            defaultMessage: 'Top 10 Subjects by Learning Hours',
            description: 'Title for the top 10 subjects by learning hours chart.',
          })}
          subtitle={intl.formatMessage({
            id: 'advance.analytics.engagement.tab.chart.top.10.subjects.by.learning.hours.subtitle',
            defaultMessage: 'See the subjects your learners are spending the most time in.',
            description: 'Subtitle for the top 10 subjects by learning hours chart.',
          })}
          startDate={startDate}
          endDate={endDate}
          activeTab={ANALYTICS_TABS.ENGAGEMENTS}
          chartType={CHART_TYPES.TOP_SUBJECTS_BY_ENGAGEMENTS}
          enterpriseId={enterpriseId}
          isDownloadCSV
        />
        <ChartWrapper
          isLoading={isLoading}
          isError={isError}
          chartType="BarChart"
          chartProps={{
            data: data?.topCoursesByEngagement,
            xKey: 'courseSubject',
            yKey: 'count',
            colorKey: 'enrollType',
            colorMap: chartColorMap,
            yAxisTitle: intl.formatMessage({
              id: 'advance.analytics.engagements.tab.chart.top.10.subjects.by.learning.hours.y.axis.title',
              defaultMessage: 'Number of Learning Hours',
              description: 'Y-axis title for the top 10 subjects by learning hours chart.',
            }),
            hovertemplate: 'Subject: %{x}<br>Learning Hours: %{y}',
          }}
          loadingMessage={intl.formatMessage({
            id: 'advance.analytics.engagements.tab.chart.top.10.subjects.by.learning.hours.loading.message',
            defaultMessage: 'Loading top 10 subjects by learning hours chart data',
            description: 'Loading message for the top 10 subjects by learning hours chart.',
          })}
        />
      </div>
      <div className="individual-engagements-datatable-container mb-4">
        <AnalyticsTable
          name={ANALYTICS_TABS.ENGAGEMENTS}
          tableTitle={intl.formatMessage({
            id: 'advance.analytics.engagement.tab.datatable.individual.engagements.title',
            defaultMessage: 'Individual Engagements',
            description: 'Title for the individual engagements datatable.',
          })}
          tableSubtitle={intl.formatMessage({
            id: 'advance.analytics.engagement.tab.datatable.individual.engagements.subtitle',
            defaultMessage: 'See the engagement levels of learners from your organization.',
            description: 'Subtitle for the individual engagements datatable.',
          })}
          startDate={startDate}
          endDate={endDate}
          enterpriseId={enterpriseId}
          enableCSVDownload
          tableColumns={[
            {
              Header: intl.formatMessage({
                id: 'advance.analytics.engagements.tab.table.header.email',
                defaultMessage: 'Email',
                description: 'Label for the email column in individual engagements table',
              }),
              accessor: 'email',
            },
            {
              Header: intl.formatMessage({
                id: 'advance.analytics.engagements.tab.table.header.course.title',
                defaultMessage: 'Course Title',
                description: 'Label for the course title column in individual engagements table',
              }),
              accessor: 'courseTitle',
            },
            {
              Header: intl.formatMessage({
                id: 'advance.analytics.engagements.tab.table.header.activity.date',
                defaultMessage: 'Activity Date',
                description: 'Label for the activity date column in individual engagements table',

              }),
              accessor: 'activityDate',
            },
            {
              Header: intl.formatMessage({
                id: 'advance.analytics.engagements.tab.table.header.course.subject',
                defaultMessage: 'Course Subject',
                description: 'Label fro the course subject column in individual engagements table',

              }),
              accessor: 'courseSubject',
            },
            {
              Header: intl.formatMessage({
                id: 'advance.analytics.engagements.tab.table.header.learning.hours',
                defaultMessage: 'Learning Hours',
                description: 'Label for the learning hours column in individual engagements table',

              }),
              accessor: 'learningTimeHours',
            },
          ]}
        />
      </div>
    </div>
  );
};

Engagements.propTypes = {
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  enterpriseId: PropTypes.string.isRequired,
  granularity: PropTypes.string.isRequired,
  calculation: PropTypes.string.isRequired,
};
export default Engagements;
