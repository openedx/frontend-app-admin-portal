import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import Header from '../Header';
import ChartWrapper from './ChartWrapper';
import DownloadCSVButton from '../DownloadCSVButton';
import { constructChartHoverTemplate, sumEntitiesByMetric, isDataEmpty } from '../data/utils';

const EnrollmentsOverTimeChart = ({
  isFetching, isError, data, startDate, endDate, trackChartClick, trackCsvDownloadClick,
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
    <div className="bg-primary-100 rounded-lg p-3 mb-3">
      <div className="chart-header">
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
              entityId="enrollments-over-time-chart"
              trackCsvDownloadClick={trackCsvDownloadClick}
            />
      )}
        />
        <div className="bg-white border-white py-3 rounded-lg container-fluid">
          <ChartWrapper
            isFetching={isFetching}
            isError={isError || isDataEmpty(isFetching, aggregatedData)}
            chartType="LineChart"
            chartProps={{
              chartId: 'enrollments-over-time-chart',
              data: aggregatedData,
              trackChartClick,
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
              chartMargin: { b: 40, r: 40 },
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
  trackChartClick: PropTypes.func,
  trackCsvDownloadClick: PropTypes.func,
};

export default EnrollmentsOverTimeChart;
