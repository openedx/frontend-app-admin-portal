import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import Header from '../Header';
import ChartWrapper from './ChartWrapper';
import DownloadCSVButton from '../DownloadCSVButton';
import { constructChartHoverTemplate, modifyDataToIntroduceEnrollTypeCount } from '../data/utils';

const EnrollmentsOverTimeChart = ({
  isFetching, isError, data, startDate, endDate,
}) => {
  const intl = useIntl();

  // Aggregate "audit" and "certificate" data to single enrollments series per date
  // Groups all records by enterpriseEnrollmentDate. Adds up enrollmentCount for each day.
  const aggregatedData = useMemo(() => {
    const rawData = data ?? [];

    const aggregated = rawData.reduce((acc, curr) => {
      const { enterpriseEnrollmentDate, enrollmentCount } = curr;
      if (!acc[enterpriseEnrollmentDate]) {
        acc[enterpriseEnrollmentDate] = { enterpriseEnrollmentDate, enrollmentCount: 0 };
      }
      acc[enterpriseEnrollmentDate].enrollmentCount += enrollmentCount;
      return acc;
    }, {});

    return Object.values(aggregated).sort(
      (a, b) => new Date(a.enterpriseEnrollmentDate) - new Date(b.enterpriseEnrollmentDate),
    );
  }, [data]);

  const enrollmentsOverTimeForCSV = useMemo(() => {
    const enrollmentsOverTime = modifyDataToIntroduceEnrollTypeCount(
      data,
      'enterpriseEnrollmentDate',
      'enrollmentCount',
    );
    return enrollmentsOverTime.map(({ enterpriseEnrollmentDate, certificate, audit }) => ({
      enterprise_enrollment_date: dayjs.utc(enterpriseEnrollmentDate).toISOString().split('T')[0],
      certificate,
      audit,
    }));
  }, [data]);

  return (
    <div className="bg-primary-100 rounded-lg container-fluid p-3 mb-3 enrollment-chart-container">
      <div className="enrollments-over-time-chart-container mb-4 h-100 overflow-hidden">
        <Header
          title={intl.formatMessage({
            id: 'advance.analytics.enrollment.tab.chart.enrollments.over.time.title',
            defaultMessage: 'Enrollments over time',
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
              id: 'advance.analytics.enrollments.tab.chart.enrollments.over.time.loading.message',
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
