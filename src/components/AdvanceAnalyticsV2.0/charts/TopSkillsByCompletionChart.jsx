import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import ChartWrapper from './ChartWrapper';
import { constructChartHoverTemplate } from '../data/utils';
import DownloadCSVButton from '../DownloadCSVButton';
import Header from '../Header';
import { skillsColorMap } from '../data/constants';

const TopSkillsByCompletionChart = ({
  isFetching, isError, data, startDate, endDate, trackChartClick, trackCsvDownloadClick,
}) => {
  const intl = useIntl();

  const topSkillsByCompletionForCSV = useMemo(
    () => data?.map(({ count, skillName, subjectName }) => ({
      skill_name: skillName,
      subject_name: subjectName,
      completion_count: count,
    })),
    [data],
  );

  return (
    <div className="bg-primary-100 rounded-lg p-3">
      <div className="rounded-lg">
        <div className="mb-3">
          <Header
            title={intl.formatMessage({
              id: 'analytics.outcomes.tab.chart.top.skills.by.completion.title',
              defaultMessage: 'Top Skills by Completion',
              description: 'Title for the top skills by completion chart.',
            })}
            DownloadCSVComponent={(
              <DownloadCSVButton
                jsonData={topSkillsByCompletionForCSV || []}
                csvFileName={`Top Skills by Completion - ${startDate} - ${endDate}`}
                entityId="top-skills-by-completions-chart"
                trackCsvDownloadClick={trackCsvDownloadClick}
              />
          )}
          />
        </div>
        <ChartWrapper
          isFetching={isFetching}
          isError={isError}
          chartType="BarChart"
          chartProps={{
            chartId: 'top-skills-by-completins-chart',
            data,
            trackChartClick,
            xKey: 'skillName',
            yKey: 'count',
            colorKey: 'subjectName',
            colorMap: skillsColorMap,
            yAxisTitle: intl.formatMessage({
              id: 'analytics.outcomes.tab.chart.top.skills.by.completion.y.axis.title',
              defaultMessage: 'Number of Completions',
              description: 'Y-axis title for the top skills by completion chart.',
            }),
            hovertemplate: constructChartHoverTemplate(intl, {
              skill: '%{x}',
              completions: '%{y}',
            }),
          }}
          loadingMessage={intl.formatMessage({
            id: 'analytics.outcomes.tab.chart.top.skills.by.completion.loading.message',
            defaultMessage: 'Loading top skills by completions chart data',
            description: 'Loading message for the top skills by completions chart.',
          })}
        />
      </div>
    </div>
  );
};

TopSkillsByCompletionChart.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  trackChartClick: PropTypes.func,
  trackCsvDownloadClick: PropTypes.func,
};

export default TopSkillsByCompletionChart;
