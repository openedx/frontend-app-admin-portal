import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import Header from '../Header';
import ChartWrapper from './ChartWrapper';
import { skillsTypeColorMap } from '../data/constants';
import DownloadCSVButton from '../DownloadCSVButton';
import { constructChartHoverTemplate, calculateMarkerSizes, isDataEmpty } from '../data/utils';

const TopSkillsChart = ({
  isFetching, isError, data, startDate, endDate, trackChartClick, trackCsvDownloadClick,
}) => {
  const intl = useIntl();

  const markerSizes = calculateMarkerSizes(data, 'completions');

  return (
    <div className="bg-primary-100 rounded-lg container-fluid p-3 mb-3 outcomes-chart-container">
      <div className="mb-4 h-100 overflow-hidden">
        <Header
          title={intl.formatMessage({
            id: 'advance.analytics.skills.tab.chart.top.skills.title',
            defaultMessage: 'Top Skills',
            description: 'Title for the top skills chart.',
          })}
          subtitle={intl.formatMessage({
            id: 'advance.analytics.skills.tab.chart.top.skills.subtitle',
            defaultMessage: 'See the top skills that are the most in demand in your organization, based on enrollments and completions.',
            description: 'Subtitle for the top skills chart.',
          })}
          DownloadCSVComponent={(
            <DownloadCSVButton
              jsonData={data || []}
              csvFileName={`Skills by Enrollment and Completion - ${startDate} - ${endDate}`}
              entityId="top-skills-chart"
              trackCsvDownloadClick={trackCsvDownloadClick}
            />
          )}
        />
        <div className="bg-white border-white rounded-lg container-fluid">
          <ChartWrapper
            isFetching={isFetching}
            isError={isError || isDataEmpty(isFetching, data)}
            chartType="ScatterChart"
            chartProps={{
              chartId: 'top-skills-chart',
              data,
              trackChartClick,
              xKey: 'enrolls',
              yKey: 'completions',
              colorKey: 'skillType',
              colorMap: skillsTypeColorMap,
              xAxisTitle: intl.formatMessage({
                id: 'advance.analytics.skills.tab.chart.top.skills.x.axis.title',
                defaultMessage: 'Enrollments',
                description: 'X-axis title for the top skills chart.',
              }),
              yAxisTitle: intl.formatMessage({
                id: 'advance.analytics.skills.tab.chart.top.skills.y.axis.title',
                defaultMessage: 'Completions',
                description: 'Y-axis title for the top skills chart.',
              }),
              markerSizes, // Pass marker sizes directly to ScatterChart
              customDataKeys: ['skillName', 'skillType'],
              hovertemplate: constructChartHoverTemplate(intl, {
                skill: '%{customdata[0]}',
                enrollments: '%{x}',
                completions: '%{y}',
              }),
            }}
            loadingMessage={intl.formatMessage({
              id: 'advance.analytics.skills.tab.chart.top.skills.loading.message',
              defaultMessage: 'Loading top skills chart data',
              description: 'Loading message for the top skills chart.',
            })}
          />
        </div>
      </div>
    </div>
  );
};

TopSkillsChart.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  trackChartClick: PropTypes.func,
  trackCsvDownloadClick: PropTypes.func,
};

export default TopSkillsChart;
