import React, { useMemo } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import Header from '../Header';
import { ANALYTICS_TABS, chartColorMap } from '../data/constants';
import AnalyticsTable from './AnalyticsTable';
import ChartWrapper from '../charts/ChartWrapper';
import { useEnterpriseCompletionsData } from '../data/hooks';
import DownloadCSVButton from '../DownloadCSVButton';
import { constructChartHoverTemplate, modifyDataToIntroduceEnrollTypeCount } from '../data/utils';

const Completions = ({
  startDate, endDate, granularity, calculation, enterpriseId,
}) => {
  const intl = useIntl();

  const {
    isFetching, isError, data,
  } = useEnterpriseCompletionsData({
    enterpriseCustomerUUID: enterpriseId,
    key: ANALYTICS_TABS.COMPLETIONS,
    startDate,
    endDate,
    granularity,
    calculation,
  });

  const completionsOverTimeForCSV = useMemo(() => {
    const completionsOverTime = modifyDataToIntroduceEnrollTypeCount(
      data?.completionsOverTime,
      'passedDate',
      'completionCount',
    );
    return completionsOverTime.map(({ activityDate, certificate, audit }) => ({
      activity_date: dayjs.utc(activityDate).toISOString().split('T')[0],
      certificate,
      audit,
    }));
  }, [data]);

  const topCoursesByCompletionForCSV = useMemo(() => {
    const topCoursesByCompletions = modifyDataToIntroduceEnrollTypeCount(
      data?.topCoursesByCompletions,
      'courseKey',
      'completionCount',
    );
    return topCoursesByCompletions.map(({
      courseKey, courseTitle, certificate, audit,
    }) => ({
      course_key: courseKey,
      course_title: courseTitle,
      certificate,
      audit,
    }));
  }, [data]);

  const topSubjectsByCompletionsForCSV = useMemo(() => {
    const topSubjectsByCompletions = modifyDataToIntroduceEnrollTypeCount(
      data?.topSubjectsByCompletions,
      'courseSubject',
      'completionCount',
    );
    return topSubjectsByCompletions.map(({ courseSubject, certificate, audit }) => ({
      course_subject: courseSubject,
      certificate,
      audit,
    }));
  }, [data]);

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
          DownloadCSVComponent={(
            <DownloadCSVButton
              jsonData={completionsOverTimeForCSV}
              csvFileName={`Completions over time - ${startDate} - ${endDate} (${granularity} ${calculation})`}
            />
          )}
        />
        <ChartWrapper
          isFetching={isFetching}
          isError={isError}
          chartType="LineChart"
          chartProps={{
            data: data?.completionsOverTime,
            xKey: 'passedDate',
            yKey: 'completionCount',
            colorKey: 'enrollType',
            colorMap: chartColorMap,
            xAxisTitle: '',
            yAxisTitle: 'Number of Completions',
            hovertemplate: constructChartHoverTemplate(intl, {
              date: '%{x}',
              completions: '%{y}',
            }),
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
          DownloadCSVComponent={(
            <DownloadCSVButton
              jsonData={topCoursesByCompletionForCSV}
              csvFileName={`Top Courses by Completion - ${startDate} - ${endDate} (${granularity} ${calculation})`}
            />
          )}
        />
        <ChartWrapper
          isFetching={isFetching}
          isError={isError}
          chartType="BarChart"
          chartProps={{
            data: data?.topCoursesByCompletions,
            xKey: 'courseKey',
            yKey: 'completionCount',
            colorKey: 'enrollType',
            colorMap: chartColorMap,
            yAxisTitle: intl.formatMessage({
              id: 'advance.analytics.completions.tab.chart.top.courses.by.completion.y.axis.title',
              defaultMessage: 'Number of Completions',
              description: 'Y-axis title for the top courses by completions chart.',
            }),
            hovertemplate: constructChartHoverTemplate(intl, {
              course: '%{x}',
              completions: '%{y}',
            }),
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
          DownloadCSVComponent={(
            <DownloadCSVButton
              jsonData={topSubjectsByCompletionsForCSV}
              csvFileName={`Top Subjects by Completion - ${startDate} - ${endDate} (${granularity} ${calculation})`}
            />
          )}
        />
        <ChartWrapper
          isFetching={isFetching}
          isError={isError}
          chartType="BarChart"
          chartProps={{
            data: data?.topSubjectsByCompletions,
            xKey: 'courseSubject',
            yKey: 'completionCount',
            colorKey: 'enrollType',
            colorMap: chartColorMap,
            yAxisTitle: intl.formatMessage({
              id: 'advance.analytics.completions.tab.chart.top.subjects.by.completion.y.axis.title',
              defaultMessage: 'Number of Completions',
              description: 'Y-axis title for the top subjects by completions chart.',
            }),
            hovertemplate: constructChartHoverTemplate(intl, {
              subject: '%{x}',
              completions: '%{y}',
            }),
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
