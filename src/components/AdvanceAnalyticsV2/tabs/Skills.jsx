import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import Header from '../Header';
import EmptyChart from '../charts/EmptyChart';
import { ANALYTICS_TABS, CHART_TYPES } from '../data/constants';

const Skills = ({ startDate, endDate, enterpriseId }) => {
  const intl = useIntl();

  return (
    <div className="tab-skills mt-4">
      <div className="top-skill-chart-container mb-4">
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
          startDate={startDate}
          endDate={endDate}
          activeTab={ANALYTICS_TABS.SKILLS}
          chartType={CHART_TYPES.BUBBLE}
          enterpriseId={enterpriseId}
          isDownloadCSV
        />
        <EmptyChart />
      </div>
      <div className="row">
        <div className="col-md-6">
          <div className="top-skills-by-enrollment-chart-container mb-4">
            <Header
              title={intl.formatMessage({
                id: 'advance.analytics.skills.tab.chart.top.skills.by.enrollment.title',
                defaultMessage: 'Top Skills by Enrollment',
                description: 'Title for the top skills by enrollment chart.',
              })}
            />
            <EmptyChart />
          </div>
        </div>
        <div className="col-md-6">
          <div className="top-skills-by-completion-chart-container mb-4">
            <Header
              title={intl.formatMessage({
                id: 'advance.analytics.skills.tab.chart.top.skills.by.completion.title',
                defaultMessage: 'Top Skills by Completion',
                description: 'Title for the top skills by completion chart.',
              })}
            />
            <EmptyChart />
          </div>
        </div>
      </div>
    </div>
  );
};

Skills.propTypes = {
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  enterpriseId: PropTypes.string.isRequired,
};

export default Skills;
