import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import { ANALYTICS_TABS } from '../data/constants';
import AnalyticsTable from './AnalyticsTable';

const Leaderboard = ({ startDate, endDate, enterpriseId }) => {
  const intl = useIntl();

  return (
    <div className="tab-leaderboard mt-4">
      <div className="leaderboard-datatable-container mb-4">
        <AnalyticsTable
          name={ANALYTICS_TABS.LEADERBOARD}
          tableTitle={intl.formatMessage({
            id: 'advance.analytics.leaderboard.tab.datatable.leaderboard.title',
            defaultMessage: 'Leaderboard',
            description: 'Title for the leaderboard datatable.',
          })}
          tableSubtitle={intl.formatMessage({
            id: 'advance.analytics.leaderboard.tab.datatable.leaderboard.subtitle',
            defaultMessage: 'See the top learners by different measures of engagement. The results are defaulted to sort by learning hours. Download the full CSV below to sort by other metrics.',
            description: 'Subtitle for the leaderboard datatable.',
          })}
          startDate={startDate}
          endDate={endDate}
          enterpriseId={enterpriseId}
          enableCSVDownload
          tableColumns={[
            {
              Header: intl.formatMessage({
                id: 'advance.analytics.leaderboard.tab.table.header.email',
                defaultMessage: 'Email',
                description: 'Label for the email column in leaderboard table',
              }),
              accessor: 'email',
            },
            {
              Header: intl.formatMessage({
                id: 'advance.analytics.leaderboard.tab.table.header.learning.hours',
                defaultMessage: 'Learning Hours',
                description: 'Label for the learning hours column in the leaderboard table',
              }),
              accessor: 'learningTimeHours',
            },
            {
              Header: intl.formatMessage({
                id: 'advance.analytics.leaderboard.tab.table.header.daily.sessions',
                defaultMessage: 'Daily Sessions',
                description: 'Label for the daily sessions column in the leaderboard table',

              }),
              accessor: 'sessionCount',
            },
            {
              Header: intl.formatMessage({
                id: 'advance.analytics.leaderboard.tab.table.header.average.session.length',
                defaultMessage: 'Average Session Length (Hours)',
                description: 'Label for the average session length column in the leaderboard table',

              }),
              accessor: 'averageSessionLength',
            },
            {
              Header: intl.formatMessage({
                id: 'advance.analytics.leaderboard.tab.table.header.course.completions',
                defaultMessage: 'Course Completions',
                description: 'Label for the course completions column in the leaderboard table',
              }),
              accessor: 'courseCompletionCount',
            },
          ]}
        />
      </div>
    </div>
  );
};

Leaderboard.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
};

export default Leaderboard;
