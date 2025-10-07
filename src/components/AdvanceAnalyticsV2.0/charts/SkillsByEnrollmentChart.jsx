import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import ChartWrapper from './ChartWrapper';
import { constructChartHoverTemplate, isDataEmpty } from '../data/utils';
import { skillsColorMap } from '../data/constants';

const SkillsByEnrollmentChart = ({
  isFetching, isError, data, trackChartClick,
}) => {
  const intl = useIntl();

  return (
    <div className="bg-primary-100 rounded-lg p-3 skills-chart-container h-100">
      <div className="top-skills-by-enrollment-chart-container h-100 overflow-hidden">
        <h2 className="font-weight-bold">
          <FormattedMessage
            id="advance.analytics.skills.by.enrollment.chart.heading"
            defaultMessage="Skills by enrollment"
          />
        </h2>
        <div className="bg-white border-white py-3 mb-2 rounded-lg container-fluid">
          <ChartWrapper
            isFetching={isFetching}
            isError={isError || isDataEmpty(isFetching, data)}
            chartType="BarChart"
            chartProps={{
              chartId: 'skills-by-enrollment-chart',
              data,
              trackChartClick,
              xKey: 'skillName',
              yKey: 'count',
              colorKey: 'subjectName',
              colorMap: skillsColorMap,
              yAxisTitle: intl.formatMessage({
                id: 'advance.analytics.skills.chart.top.skills.by.enrollment.y.axis.title',
                defaultMessage: 'Number of Enrollments',
              }),
              hovertemplate: constructChartHoverTemplate(intl, {
                skill: '%{x}',
                enrollments: '%{y}',
              }),
            }}
            loadingMessage={intl.formatMessage({
              id: 'advance.analytics.skills.chart.top.skills.by.enrollment.loading.message',
              defaultMessage: 'Loading top skills by enrollment chart data',
            })}
          />
        </div>
      </div>
    </div>
  );
};

SkillsByEnrollmentChart.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  trackChartClick: PropTypes.func,
};

export default SkillsByEnrollmentChart;
