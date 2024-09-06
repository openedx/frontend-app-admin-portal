import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import Header from '../Header';
import { ANALYTICS_TABS, CHART_TYPES, chartColorMap } from '../data/constants';
import AnalyticsTable from './AnalyticsTable';
import ChartWrapper from '../charts/ChartWrapper';
import { useEnterpriseAnalyticsData } from '../data/hooks';

const Completions = ({
  startDate, endDate, granularity, calculation, enterpriseId,
}) => {
  const intl = useIntl();

  const {
    isFetching, isError, data,
  } = useEnterpriseAnalyticsData({
    enterpriseCustomerUUID: enterpriseId,
    key: ANALYTICS_TABS.COMPLETIONS,
    startDate,
    endDate,
    granularity,
    calculation,
  });

  return (
    <div className="tab-completions mt-4">
      <div className="completions-over-time-chart-container mb-4">
        <Header
          title={intl.formatMessage({
            id: 'advance.analytics.completion.tab.chart.completions.over.time.title',
            defaultMessage: 'Completions Over Time',
            description: 'Title for the completions over time chart.',
          })}
          subtitle={intl.formatMessage({
            id: 'advance.analytics.completion.tab.chart.completions.over.time.subtitle',
            defaultMessage: 'See the course completions that result in a passing grade over time.',
            description: 'Subtitle for the completions over time chart.',
          })}
          startDate={startDate}
          endDate={endDate}
          activeTab={ANALYTICS_TABS.COMPLETIONS}
          granularity={granularity}
          calculation={calculation}
          chartType={CHART_TYPES.COMPLETIONS_OVER_TIME}
          enterpriseId={enterpriseId}
          isDownloadCSV
        />
        <ChartWrapper
          isFetching={isFetching}
          isError={isError}
          chartType="LineChart"
          chartProps={{
            data: data?.completionsOverTime,
            xKey: 'passedDate',
            yKey: 'count',
            colorKey: 'enrollType',
            colorMap: chartColorMap,
            xAxisTitle: '',
            yAxisTitle: 'Number of Completions',
            hovertemplate: 'Date: %{x}<br>Number of Completions: %{y}',
          }}
          loadingMessage={intl.formatMessage({
            id: 'advance.analytics.completions.tab.chart.top.courses.by.completions.loading.message',
            defaultMessage: 'Loading top courses by completions chart data',
            description: 'Loading message for the top courses by completions chart.',
          })}
        />
      </div>
      <div className="top-10-courses-by-completions-chart-container mb-4">
        <Header
          title={intl.formatMessage({
            id: 'advance.analytics.completion.tab.chart.top.10.courses.by.completions.title',
            defaultMessage: 'Top 10 Courses by Completions',
            description: 'Title for the top 10 courses by completions chart.',
          })}
          subtitle={intl.formatMessage({
            id: 'advance.analytics.completion.tab.chart.top.10.courses.by.completions.subtitle',
            defaultMessage: 'See the courses in which your learners are most often achieving a passing grade.',
            description: 'Subtitle for the top 10 courses by completions chart.',
          })}
          startDate={startDate}
          endDate={endDate}
          activeTab={ANALYTICS_TABS.COMPLETIONS}
          granularity={granularity}
          calculation={calculation}
          chartType={CHART_TYPES.TOP_COURSES_BY_COMPLETIONS}
          enterpriseId={enterpriseId}
          isDownloadCSV
        />
        <ChartWrapper
          isFetching={isFetching}
          isError={isError}
          chartType="BarChart"
          chartProps={{
            data: data?.topCoursesByCompletions,
            xKey: 'courseKey',
            yKey: 'count',
            colorKey: 'enrollType',
            colorMap: chartColorMap,
            yAxisTitle: intl.formatMessage({
              id: 'advance.analytics.completions.tab.chart.top.courses.by.completion.y.axis.title',
              defaultMessage: 'Number of Completions',
              description: 'Y-axis title for the top courses by completions chart.',
            }),
            hovertemplate: 'Course: %{x}<br>Number of Completions: %{y}',
          }}
          loadingMessage={intl.formatMessage({
            id: 'advance.analytics.completions.tab.chart.top.10.courses.by.completions.loading.message',
            defaultMessage: 'Loading top 10 courses by completions chart data',
            description: 'Loading message for the top 10 courses by completions chart.',
          })}
        />
      </div>
      <div className="top-10-subjects-by-completion-chart-container mb-4">
        <Header
          title={intl.formatMessage({
            id: 'advance.analytics.completion.tab.chart.top.10.subjects.by.completion.title',
            defaultMessage: 'Top 10 Subjects by Completion',
            description: 'Title for the top 10 subjects by completion chart.',
          })}
          subtitle={intl.formatMessage({
            id: 'advance.analytics.completion.tab.chart.top.10.subjects.by.completion.subtitle',
            defaultMessage: 'See the subjects your learners are most often achieving a passing grade.',
            description: 'Subtitle for the top 10 subjects by completion chart.',
          })}
          startDate={startDate}
          endDate={endDate}
          activeTab={ANALYTICS_TABS.COMPLETIONS}
          granularity={granularity}
          calculation={calculation}
          chartType={CHART_TYPES.TOP_SUBJECTS_BY_COMPLETIONS}
          enterpriseId={enterpriseId}
          isDownloadCSV
        />
        <ChartWrapper
          isFetching={isFetching}
          isError={isError}
          chartType="BarChart"
          chartProps={{
            data: data?.topSubjectsByCompletions,
            xKey: 'courseSubject',
            yKey: 'count',
            colorKey: 'enrollType',
            colorMap: chartColorMap,
            yAxisTitle: intl.formatMessage({
              id: 'advance.analytics.completions.tab.chart.top.subjects.by.completion.y.axis.title',
              defaultMessage: 'Number of Completions',
              description: 'Y-axis title for the top subjects by completions chart.',
            }),
            hovertemplate: 'Subject: %{x}<br>Number of Completions: %{y}',
          }}
          loadingMessage={intl.formatMessage({
            id: 'advance.analytics.completions.tab.chart.top.subjects.by.completions.loading.message',
            defaultMessage: 'Loading top 10 subjects by completions chart data',
            description: 'Loading message for the top 10 subjects by completions chart.',
          })}
        />
      </div>
      <div className="individual-completions-datatable-container mb-4">
        <AnalyticsTable
          name={ANALYTICS_TABS.COMPLETIONS}
          tableTitle={intl.formatMessage({
            id: 'advance.analytics.completion.tab.datatable.individual.completions.title',
            defaultMessage: 'Individual Completions',
            description: 'Title for the individual completions datatable.',
          })}
          tableSubtitle={intl.formatMessage({
            id: 'advance.analytics.completion.tab.datatable.individual.completions.subtitle',
            defaultMessage: 'See the individual completions from your organization.',
            description: 'Subtitle for the individual completions datatable.',
          })}
          startDate={startDate}
          endDate={endDate}
          enterpriseId={enterpriseId}
          enableCSVDownload
          tableColumns={[
            {
              Header: intl.formatMessage({
                id: 'advance.analytics.completions.tab.table.header.email',
                defaultMessage: 'Email',
                description: 'Label for the email column in individual completions table',
              }),
              accessor: 'email',
            },
            {
              Header: intl.formatMessage({
                id: 'advance.analytics.completions.tab.table.header.course.title',
                defaultMessage: 'Course Title',
                description: 'Label for the course title column in individual completions table',
              }),
              accessor: 'courseTitle',
            },
            {
              Header: intl.formatMessage({
                id: 'advance.analytics.completions.tab.table.header.course.subject',
                defaultMessage: 'Course Subject',
                description: 'Label for the course subject column in individual completions table',

              }),
              accessor: 'courseSubject',
            },
            {
              Header: intl.formatMessage({
                id: 'advance.analytics.completions.tab.table.header.passed.date',
                defaultMessage: 'Passed Date',
                description: 'Label for the passed date column in individual completions table',

              }),
              accessor: 'passedDate',
            },
          ]}
        />
      </div>
    </div>
  );
};
Completions.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  granularity: PropTypes.string.isRequired,
  calculation: PropTypes.string.isRequired,
};
export default Completions;
