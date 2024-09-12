import React, { useMemo } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import Header from '../Header';
import { ANALYTICS_TABS, chartColorMap } from '../data/constants';
import AnalyticsTable from './AnalyticsTable';
import ChartWrapper from '../charts/ChartWrapper';
import { useEnterpriseEnrollmentsData } from '../data/hooks';
import DownloadCSVButton from '../DownloadCSVButton';
import { modifyDataToIntroduceEnrollTypeCount } from '../data/utils';

dayjs.extend(utc);
import { constructChartHoverTemplate } from '../data/utils';

const Enrollments = ({
  startDate, endDate, granularity, calculation, enterpriseId,
}) => {
  const intl = useIntl();
  const {
    isFetching, isError, data,
  } = useEnterpriseEnrollmentsData({
    enterpriseCustomerUUID: enterpriseId,
    startDate,
    endDate,
    granularity,
    calculation,
  });
  const enrollmentsOverTimeForCSV = useMemo(() => {
    const enrollmentsOverTime = modifyDataToIntroduceEnrollTypeCount(
      data?.enrollmentsOverTime,
      'enterpriseEnrollmentDate',
      'enrollmentCount',
    );
    return enrollmentsOverTime.map(({ enterpriseEnrollmentDate, certificate, audit }) => ({
      enterprise_enrollment_date: dayjs.utc(enterpriseEnrollmentDate).toISOString().split('T')[0],
      certificate,
      audit,
    }));
  }, [data]);

  const topCoursesByEnrollmentsForCSV = useMemo(() => {
    const topCoursesByEnrollments = modifyDataToIntroduceEnrollTypeCount(
      data?.topCoursesByEnrollments,
      'courseKey',
      'enrollmentCount',
    );
    return topCoursesByEnrollments.map(({
      courseKey, courseTitle, certificate, audit,
    }) => ({
      course_key: courseKey,
      course_title: courseTitle,
      certificate,
      audit,
    }));
  }, [data]);

  const topSubjectsByEnrollmentsForCSV = useMemo(() => {
    const topSubjectsByEnrollments = modifyDataToIntroduceEnrollTypeCount(
      data?.topSubjectsByEnrollments,
      'courseSubject',
      'enrollmentCount',
    );
    return topSubjectsByEnrollments.map(({ courseSubject, certificate, audit }) => ({
      course_subject: courseSubject,
      certificate,
      audit,
    }));
  }, [data]);

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
          DownloadCSVComponent={(
            <DownloadCSVButton
              jsonData={enrollmentsOverTimeForCSV}
              csvFileName={`Enrolments over time - ${startDate} - ${endDate} (${granularity} ${calculation})`}
            />
          )}
        />
        <ChartWrapper
          isFetching={isFetching}
          isError={isError}
          chartType="LineChart"
          chartProps={{
            data: data?.enrollmentsOverTime,
            xKey: 'enterpriseEnrollmentDate',
            yKey: 'enrollmentCount',
            colorKey: 'enrollType',
            colorMap: chartColorMap,
            xAxisTitle: '',
            yAxisTitle: 'Number of Enrollments',
            hovertemplate: constructChartHoverTemplate(intl, {
              date: '%{x}',
              enrollments: '%{y}',
            }),
          }}
          loadingMessage={intl.formatMessage({
            id: 'advance.analytics.enrollments.tab.chart.enrollments.over.time.loading.message',
            defaultMessage: 'Loading enrollments over time chart data',
            description: 'Loading message for the enrollments over time chart.',
          })}
        />
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
          DownloadCSVComponent={(
            <DownloadCSVButton
              jsonData={topCoursesByEnrollmentsForCSV}
              csvFileName={`Top Courses by Enrollment - ${startDate} - ${endDate} (${granularity} ${calculation})`}
            />
          )}
        />
        <ChartWrapper
          isFetching={isFetching}
          isError={isError}
          chartType="BarChart"
          chartProps={{
            data: data?.topCoursesByEnrollments,
            xKey: 'courseKey',
            yKey: 'enrollmentCount',
            colorKey: 'enrollType',
            colorMap: chartColorMap,
            xAxisTitle: '',
            yAxisTitle: 'Number of Enrollments',
            hovertemplate: constructChartHoverTemplate(intl, {
              course: '%{x}',
              enrollments: '%{y}',
            }),
          }}
          loadingMessage={intl.formatMessage({
            id: 'advance.analytics.enrollments.tab.chart.top.courses.by.enrollments.loading.message',
            defaultMessage: 'Loading top courses by enrollments chart data',
            description: 'Loading message for the top courses by enrollments chart.',
          })}
        />
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
          DownloadCSVComponent={(
            <DownloadCSVButton
              jsonData={topSubjectsByEnrollmentsForCSV}
              csvFileName={`Top Subjects by Enrollment - ${startDate} - ${endDate} (${granularity} ${calculation})`}
            />
          )}
        />
        <ChartWrapper
          isFetching={isFetching}
          isError={isError}
          chartType="BarChart"
          chartProps={{
            data: data?.topSubjectsByEnrollments,
            xKey: 'courseSubject',
            yKey: 'enrollmentCount',
            colorKey: 'enrollType',
            colorMap: chartColorMap,
            xAxisTitle: '',
            yAxisTitle: 'Number of Enrollments',
            hovertemplate: 'Subject: %{x}<br>Enrolls: %{y}',
            hovertemplate: constructChartHoverTemplate(intl, {
              subject: '%{x}',
              enrollments: '%{y}',
            }),
          }}
          loadingMessage={intl.formatMessage({
            id: 'advance.analytics.enrollments.tab.chart.top.subjects.by.enrollments.loading.message',
            defaultMessage: 'Loading top subjects by enrollments chart data',
            description: 'Loading message for the top subjects by enrollments chart.',
          })}
        />
      </div>
      <div className="individual-enrollments-datatable-container mb-4">
        <AnalyticsTable
          name={ANALYTICS_TABS.ENROLLMENTS}
          tableTitle={intl.formatMessage({
            id: 'advance.analytics.enrollment.tab.datatable.individual.enrollments.title',
            defaultMessage: 'Individual Enrollments',
            description: 'Title for the individual enrollments datatable.',
          })}
          tableSubtitle={intl.formatMessage({
            id: 'advance.analytics.enrollment.tab.datatable.individual.enrollments.subtitle',
            defaultMessage: 'See the individual enrollments from your organization.',
            description: 'Subtitle for the individual enrollments datatable.',
          })}
          startDate={startDate}
          endDate={endDate}
          enterpriseId={enterpriseId}
          enableCSVDownload
          tableColumns={[
            {
              Header: intl.formatMessage({
                id: 'advance.analytics.enrollments.tab.table.header.email',
                defaultMessage: 'Email',
                description: 'Label for the email column in individual enrollments table',
              }),
              accessor: 'email',
            },
            {
              Header: intl.formatMessage({
                id: 'advance.analytics.enrollments.tab.table.header.course.title',
                defaultMessage: 'Course Title',
                description: 'Label for the course title column in individual enrollments table',
              }),
              accessor: 'courseTitle',
            },
            {
              Header: intl.formatMessage({
                id: 'advance.analytics.enrollments.tab.table.header.course.subject',
                defaultMessage: 'Course Subject',
                description: 'Label fro the course subject column in individual enrollments table',

              }),
              accessor: 'courseSubject',
            },
            {
              Header: intl.formatMessage({
                id: 'advance.analytics.enrollments.tab.table.header.enroll.type',
                defaultMessage: 'Enroll Type',
                description: 'Label for the enrollment type column in individual enrollments table',

              }),
              accessor: 'enrollType',
            },
            {
              Header: intl.formatMessage({
                id: 'advance.analytics.enrollments.tab.table.header.enterprise.enrollment.date',
                defaultMessage: 'Enterprise Enrollment Date',
                description: 'Label fro the enterprise enrollment date column in individual enrollments table',

              }),
              accessor: 'enterpriseEnrollmentDate',
            },
          ]}
        />
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
