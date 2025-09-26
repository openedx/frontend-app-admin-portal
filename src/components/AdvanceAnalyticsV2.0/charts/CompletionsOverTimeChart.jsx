import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import dayjs from 'dayjs';
import Header from '../Header';
import ChartWrapper from './ChartWrapper';
import DownloadCSVButton from '../DownloadCSVButton';
import { constructChartHoverTemplate, sumEntitiesByMetric } from '../data/utils';

const CompletionsOverTimeChart = ({
  isFetching, isError, data, startDate, endDate, granularity, calculation, trackChartClick, trackCsvDownloadClick,
}) => {
  const intl = useIntl();

  // Aggregate "audit" and "certificate" data to single completions series per date
  // Groups all records by passedDate. Adds up completionCount for each day.
  const aggregatedData = React.useMemo(
    () => sumEntitiesByMetric(data, 'passedDate', ['completionCount']),
    [data],
  );

  const completionsOverTimeForCSV = useMemo(
    () => aggregatedData.map(({ passedDate, completionCount }) => ({
      activity_date: dayjs.utc(passedDate).toISOString().split('T')[0],
      completion_count: completionCount,
    })),
    [aggregatedData],
  );

  return (
    <div className="bg-primary-100 rounded-lg container-fluid p-3 mb-3 mt-3 outcomes-chart-container">
      <div className="mb-4 h-100 overflow-hidden">
        <Header
          title={intl.formatMessage({
            id: 'analytics.outcomes.tab.chart.completions.over.time.title',
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
              entityId="completions-over-time-chart"
              trackCsvDownloadClick={trackCsvDownloadClick}
            />
        )}
        />
        <ChartWrapper
          isFetching={isFetching}
          isError={isError}
          chartType="LineChart"
          chartProps={{
            chartId: 'completions-over-time-chart',
            data: aggregatedData,
            trackChartClick,
            xKey: 'passedDate',
            yKey: 'completionCount',
            colorKey: null,
            colorMap: {},
            xAxisTitle: '',
            yAxisTitle: 'Number of Completions',
            hovertemplate: constructChartHoverTemplate(intl, {
              date: '%{x}',
              completions: '%{y}',
            }),
          }}
          loadingMessage={intl.formatMessage({
            id: 'analytics.outcomes.tab.chart.top.courses.by.completions.loading.message',
            defaultMessage: 'Loading top courses by completions chart data',
            description: 'Loading message for the top courses by completions chart.',
          })}
        />
      </div>
    </div>
  );
};

CompletionsOverTimeChart.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  granularity: PropTypes.string.isRequired,
  calculation: PropTypes.string.isRequired,
  trackChartClick: PropTypes.func,
  trackCsvDownloadClick: PropTypes.func,
};

export default CompletionsOverTimeChart;
