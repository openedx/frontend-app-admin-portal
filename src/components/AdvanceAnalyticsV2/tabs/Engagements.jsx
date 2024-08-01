import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import EmptyChart from '../charts/EmptyChart';
import Header from '../Header';

const Engagements = () => {
  const intl = useIntl();

  return (
    <div className="tab-engagements mt-4">
      <div className="learning-hours-over-time-chart-container mb-4">
        <Header
          title={intl.formatMessage({
            id: 'advance.analytics.engagement.tab.chart.learning.hours.over.time.title',
            defaultMessage: 'Learning Hours Over Time',
            description: 'Title for the learning hours over time chart.',
          })}
          subtitle={intl.formatMessage({
            id: 'advance.analytics.engagement.tab.chart.learning.hours.over.time.subtitle',
            defaultMessage: 'See audit and certificate track hours of learning over time.',
            description: 'Subtitle for the learning hours over time chart.',
          })}
        />
        <EmptyChart />
      </div>
      <div className="top-10-courses-by-learning-hours-chart-container mb-4">
        <Header
          title={intl.formatMessage({
            id: 'advance.analytics.engagement.tab.chart.top.10.courses.by.learning.hours.title',
            defaultMessage: 'Top 10 Courses by Learning Hours',
            description: 'Title for the top 10 courses by learning hours chart.',
          })}
          subtitle={intl.formatMessage({
            id: 'advance.analytics.engagement.tab.chart.top.10.courses.by.learning.hours.subtitle',
            defaultMessage: 'See the courses in which your learners spend the most time.',
            description: 'Subtitle for the top 10 courses by learning hours chart.',
          })}
        />
        <EmptyChart />
      </div>
      <div className="top-10-subjects-by-learning-hours-chart-container mb-4">
        <Header
          title={intl.formatMessage({
            id: 'advance.analytics.engagement.tab.chart.top.10.subjects.by.learning.hours.title',
            defaultMessage: 'Top 10 Subjects by Learning Hours',
            description: 'Title for the top 10 subjects by learning hours chart.',
          })}
          subtitle={intl.formatMessage({
            id: 'advance.analytics.engagement.tab.chart.top.10.subjects.by.learning.hours.subtitle',
            defaultMessage: 'See the subjects your learners are spending the most time in.',
            description: 'Subtitle for the top 10 subjects by learning hours chart.',
          })}
        />
        <EmptyChart />
      </div>
      <div className="individual-engagements-datatable-container mb-4">
        <Header
          title={intl.formatMessage({
            id: 'advance.analytics.engagement.tab.datatable.individual.engagements.title',
            defaultMessage: 'Individual Engagements',
            description: 'Title for the individual engagements datatable.',
          })}
          subtitle={intl.formatMessage({
            id: 'advance.analytics.engagement.tab.datatable.individual.engagements.subtitle',
            defaultMessage: 'See the engagement levels of learners from your organization.',
            description: 'Subtitle for the individual engagements datatable.',
          })}
        />
        <EmptyChart />
      </div>
    </div>
  );
};

export default Engagements;
