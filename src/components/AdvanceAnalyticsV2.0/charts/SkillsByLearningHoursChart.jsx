import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import ChartWrapper from './ChartWrapper';

const SkillsByLearningHoursChart = ({
  isFetching, isError, data, trackChartClick,
}) => {
  const intl = useIntl();
  const parentLabel = intl.formatMessage({
    id: 'advance.analytics.engagements.tab.skills.by.learning.hours.parent.label',
    defaultMessage: 'Learning Hours',
  });
  let labels = [];
  let values = [];
  let parents = [];

  if (data?.length) {
    const skillNames = data.map(item => item.skillName);
    labels = [parentLabel, ...skillNames];
    values = ['', ...data.map(item => item.learningHours.toFixed(2))];
    parents = ['', ...Array(skillNames.length).fill(parentLabel)];
  }

  return (
    <div className="bg-primary-100 rounded-lg p-3 skills-chart-container h-100">
      <div className="skills-by-learning-hours-chart-container h-100 overflow-hidden">
        <h2 className="font-weight-bold">
          <FormattedMessage
            id="advance.analytics.engagements.tab.skills.by.learning.hours.chart.heading"
            defaultMessage="Skills by learning hours"
          />
        </h2>
        <div className="bg-white border-white py-3 mb-2 rounded-lg container-fluid">
          <ChartWrapper
            isFetching={isFetching}
            isError={isError || !data?.length}
            chartType="Treemap"
            chartProps={{
              chartId: 'skills-by-learning-hours-chart',
              data: !!data,
              trackChartClick,
              labels,
              values,
              parents,
            }}
            loadingMessage={intl.formatMessage({
              id: 'advance.analytics.engagements.tab.skills.by.learning.hours.loading.message',
              defaultMessage: 'Loading skills by learning hours chart data',
            })}
          />
        </div>
      </div>
    </div>
  );
};

SkillsByLearningHoursChart.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  trackChartClick: PropTypes.func,
};

export default SkillsByLearningHoursChart;
