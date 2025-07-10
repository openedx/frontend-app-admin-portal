import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import Header from '../Header';
import ChartWrapper from './ChartWrapper';
import DownloadCSVButton from '../DownloadCSVButton';
import { constructChartHoverTemplate, sumEntitiesByMetric } from '../data/utils';

const LearningHoursOverTimeChart = ({
  isFetching, isError, data, startDate, endDate, onClick,
}) => {
  const intl = useIntl();

  // Aggregate "audit" and "certificate" data to single learning hours series per date
  // Groups all records by activityDate. Adds up learningTimeHours for each day.
  const aggregatedData = React.useMemo(
    () => sumEntitiesByMetric(data, 'activityDate', ['learningTimeHours']),
    [data],
  );

  const engagementOverTimeForCSV = useMemo(
    () => aggregatedData.map(({ activityDate, learningTimeHours }) => ({
      activity_date: dayjs.utc(activityDate).toISOString().split('T')[0],
      learning_time_hours: learningTimeHours,
    })),
    [aggregatedData],
  );

  return (
    <div className="bg-primary-100 rounded-lg container-fluid p-3 learning-hours-over-time-chart-container mb-3 engagement-chart-container">
      <div className="top-skills-by-enrollment-chart-container mb-4 h-100 overflow-hidden">
        <Header
          title={intl.formatMessage({
            id: 'advance.analytics.engagement.tab.learning.hours.over.time.chart.title',
            defaultMessage: 'Learning hours over time',
            description: 'Title for the learning hours over time chart.',
          })}
          subtitle={intl.formatMessage({
            id: 'advance.analytics.engagement.tab.learning.hours.over.time.chart.subtitle',
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
              chartId: 'learning-hours-over-time-chart',
              data: aggregatedData,
              onClick,
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
              id: 'advance.analytics.engagements.tab.learning.hours.over.time.chart.loading.message',
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
  onClick: PropTypes.func,
};

export default LearningHoursOverTimeChart;
