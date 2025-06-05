import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import Header from '../Header';
import ChartWrapper from './ChartWrapper';
import DownloadCSVButton from '../DownloadCSVButton';
import { constructChartHoverTemplate, modifyDataToIntroduceEnrollTypeCount } from '../data/utils';

const LearningHoursOverTimeChart = ({
  isFetching, isError, data, startDate, endDate,
}) => {
  const intl = useIntl();

  // Aggregate "audit" and "certificate" data to single learning hours series per date
  // Groups all records by activityDate. Adds up learningTimeHours for each day.
  const aggregatedData = useMemo(() => {
    const rawData = data ?? [];

    const aggregated = rawData.reduce((acc, curr) => {
      const { activityDate, learningTimeHours } = curr;
      if (!acc[activityDate]) {
        acc[activityDate] = { activityDate, learningTimeHours: 0 };
      }
      acc[activityDate].learningTimeHours += learningTimeHours;
      return acc;
    }, {});

    return Object.values(aggregated).sort(
      (a, b) => new Date(a.activityDate) - new Date(b.activityDate),
    );
  }, [data]);

  const engagementOverTimeForCSV = useMemo(() => {
    const engagementOverTime = modifyDataToIntroduceEnrollTypeCount(
      data,
      'activityDate',
      'learningTimeHours',
    );
    return engagementOverTime.map(({ activityDate, certificate, audit }) => ({
      activity_date: dayjs.utc(activityDate).toISOString().split('T')[0],
      certificate,
      audit,
    }));
  }, [data]);

  return (
    <div className="bg-primary-100 rounded-lg container-fluid p-3 learning-hours-over-time-chart-container mb-3 engagement-chart-container">
      <div className="top-skills-by-enrollment-chart-container mb-4 h-100 overflow-hidden">
        <Header
          title={intl.formatMessage({
            id: 'advance.analytics.engagement.tab.chart.learning.hours.over.time.title',
            defaultMessage: 'Learning hours over time',
            description: 'Title for the learning hours over time chart.',
          })}
          subtitle={intl.formatMessage({
            id: 'advance.analytics.engagement.tab.chart.learning.hours.over.time.subtitle',
            defaultMessage: 'See audit and certificate track hours of learning over time.',
            description: 'Subtitle for the learning hours over time chart.',
          })}
          DownloadCSVComponent={(
            <DownloadCSVButton
              jsonData={engagementOverTimeForCSV}
              csvFileName={`Engagement over time - ${startDate} - ${endDate}`}
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
              xKey: 'activityDate',
              yKey: 'learningTimeHours',
              colorKey: null,
              colorMap: {},
              xAxisTitle: '',
              yAxisTitle: 'Number of Learning Hours',
              hovertemplate: constructChartHoverTemplate(intl, {
                date: '%{x}',
                learningHours: '%{y}',
              }),
            }}
            loadingMessage={intl.formatMessage({
              id: 'advance.analytics.engagements.tab.chart.learning.hours.over.time.loading.message',
              defaultMessage: 'Loading learning hours over time chart data',
              description: 'Loading message for the learning hours over time chart.',
            })}
          />
        </div>
      </div>
    </div>
  );
};

LearningHoursOverTimeChart.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
};

export default LearningHoursOverTimeChart;
