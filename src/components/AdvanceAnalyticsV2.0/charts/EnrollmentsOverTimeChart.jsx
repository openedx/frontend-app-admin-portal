import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import Header from '../Header';
import ChartWrapper from './ChartWrapper';
import DownloadCSVButton from '../DownloadCSVButton';
import { constructChartHoverTemplate, sumEntitiesByMetric } from '../data/utils';

const EnrollmentsOverTimeChart = ({
  isFetching, isError, data, startDate, endDate,
}) => {
  const intl = useIntl();

  // Aggregate "audit" and "certificate" data to single enrollments series per date
  // Groups all records by enterpriseEnrollmentDate. Adds up enrollmentCount for each day.
  const aggregatedData = React.useMemo(
    () => sumEntitiesByMetric(data, 'enterpriseEnrollmentDate', ['enrollmentCount']),
    [data],
  );

  const enrollmentsOverTimeForCSV = useMemo(
    () => aggregatedData.map(({ enterpriseEnrollmentDate, enrollmentCount }) => ({
      enterprise_enrollment_date: dayjs.utc(enterpriseEnrollmentDate).toISOString().split('T')[0],
      enrollment_count: enrollmentCount,
    })),
    [aggregatedData],
  );

  return (
    <div className="bg-primary-100 rounded-lg container-fluid p-3 mb-3 enrollment-chart-container">
      <div className="enrollments-over-time-chart-container mb-4 h-100 overflow-hidden">
        <Header
          title={intl.formatMessage({
            id: 'advance.analytics.enrollment.tab.chart.enrollments.over.time.heading',
            defaultMessage: 'Enrollments over time',
            description: 'Title for the enrollments over time chart.',
          })}
          subtitle={intl.formatMessage({
            id: 'advance.analytics.enrollment.tab.chart.enrollments.over.time.subheading',
            defaultMessage: 'See audit and certificate track enrollments over time.',
            description: 'Subtitle for the enrollments over time chart.',
          })}
          DownloadCSVComponent={(
            <DownloadCSVButton
              jsonData={enrollmentsOverTimeForCSV}
              csvFileName={`Enrolments over time - ${startDate} - ${endDate}`}
            />
      )}
        />
        <div className="bg-white border-white py-3 mb-2 rounded-lg container-fluid">
          <ChartWrapper
            isFetching={isFetching}
            isError={isError}
            chartType="LineChart"
            chartProps={{
              data: aggregatedData,
              xKey: 'enterpriseEnrollmentDate',
              yKey: 'enrollmentCount',
              colorKey: null,
              colorMap: {},
              xAxisTitle: '',
              yAxisTitle: 'Number of Enrollments',
              hovertemplate: constructChartHoverTemplate(intl, {
                date: '%{x}',
                enrollments: '%{y}',
              }),
            }}
            loadingMessage={intl.formatMessage({
              id: 'advance.analytics.enrollments.tab.enrollments.over.time.chart.loading.message',
              defaultMessage: 'Loading enrollments over time chart data',
              description: 'Loading message for the enrollments over time chart.',
            })}
          />
        </div>
      </div>
    </div>
  );
};

EnrollmentsOverTimeChart.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
};

export default EnrollmentsOverTimeChart;
