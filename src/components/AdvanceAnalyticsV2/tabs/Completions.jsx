import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import EmptyChart from '../charts/EmptyChart';
import Header from '../Header';

const Completions = () => {
  const intl = useIntl();

  return (
    <div className="tab-completions mt-4">
      <div className="completions-over-time-chart-container mb-4">
        <Header
          title={intl.formatMessage({
            id: 'advance.analytics.completion.tab.chart.completions.over.time.title',
            defaultMessage: 'Completions Over Time',
            description: 'Title for the completions over time chart.',
          })}
          subtitle={intl.formatMessage({
            id: 'advance.analytics.completion.tab.chart.completions.over.time.subtitle',
            defaultMessage: 'See the course completions that result in a passing grade over time.',
            description: 'Subtitle for the completions over time chart.',
          })}
        />
        <EmptyChart />
      </div>
      <div className="top-10-courses-by-completions-chart-container mb-4">
        <Header
          title={intl.formatMessage({
            id: 'advance.analytics.completion.tab.chart.top.10.courses.by.completions.title',
            defaultMessage: 'Top 10 Courses by Completions',
            description: 'Title for the top 10 courses by completions chart.',
          })}
          subtitle={intl.formatMessage({
            id: 'advance.analytics.completion.tab.chart.top.10.courses.by.completions.subtitle',
            defaultMessage: 'See the courses in which your learners are most often achieving a passing grade.',
            description: 'Subtitle for the top 10 courses by completions chart.',
          })}
        />
        <EmptyChart />
      </div>
      <div className="top-10-subjects-by-completion-chart-container mb-4">
        <Header
          title={intl.formatMessage({
            id: 'advance.analytics.completion.tab.chart.top.10.subjects.by.completion.title',
            defaultMessage: 'Top 10 Subjects by Completion',
            description: 'Title for the top 10 subjects by completion chart.',
          })}
          subtitle={intl.formatMessage({
            id: 'advance.analytics.completion.tab.chart.top.10.subjects.by.completion.subtitle',
            defaultMessage: 'See the subjects your learners are most often achieving a passing grade.',
            description: 'Subtitle for the top 10 subjects by completion chart.',
          })}
        />
        <EmptyChart />
      </div>
      <div className="individual-completions-datatable-container mb-4">
        <Header
          title={intl.formatMessage({
            id: 'advance.analytics.completion.tab.datatable.individual.completions.title',
            defaultMessage: 'Individual Completions',
            description: 'Title for the individual completions datatable.',
          })}
          subtitle={intl.formatMessage({
            id: 'advance.analytics.completion.tab.datatable.individual.completions.subtitle',
            defaultMessage: 'See the individual completions from your organization.',
            description: 'Subtitle for the individual completions datatable.',
          })}
        />
        <EmptyChart />
      </div>
    </div>
  );
};

export default Completions;
