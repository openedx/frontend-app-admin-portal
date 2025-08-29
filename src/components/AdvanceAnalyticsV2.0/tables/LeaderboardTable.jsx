import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import AnalyticsTable from './AnalyticsTable';

const Leaderboard = ({
  startDate, endDate, enterpriseId, courseType, course,
}) => {
  const intl = useIntl();

  return (
    <div className="tab-leaderboard mt-4">
      <div className="leaderboard-datatable-container mb-4 rounded-lg">
        <AnalyticsTable
          name="leaderboard"
          tableTitle={intl.formatMessage({
            id: 'advance.analytics.leaderboard.datatable.title',
            defaultMessage: 'Leaderboard',
            description: 'Title for the leaderboard datatable.',
          })}
          tableSubtitle={intl.formatMessage({
            id: 'advance.analytics.leaderboard.datatable.subtitle',
            defaultMessage: 'Explore the top learners ranked by engagement metrics. The list is sorted by learning hours by default. To dive deeper, download the full CSV to explore and sort by other metrics. Only learners who have passed the course and completed at least one engagement activity (watching a video, submitting a problem, or posting in forums) are included.',
            description: 'Subtitle for the leaderboard datatable.',
          })}
          startDate={startDate}
          endDate={endDate}
          enterpriseId={enterpriseId}
          courseType={courseType}
          course={course}
          enableCSVDownload
          tableColumns={[
            {
              Header: intl.formatMessage({
                id: 'advance.analytics.leaderboard.table.header.email',
                defaultMessage: 'Email',
                description: 'Label for the email column in leaderboard table',
              }),
              accessor: 'email',
            },
            {
              Header: intl.formatMessage({
                id: 'advance.analytics.leaderboard.table.header.learning.hours',
                defaultMessage: 'Learning Hours',
                description: 'Label for the learning hours column in the leaderboard table',
              }),
              accessor: 'learningTimeHours',
            },
            {
              Header: intl.formatMessage({
                id: 'advance.analytics.leaderboard.table.header.daily.sessions',
                defaultMessage: 'Daily Sessions',
                description: 'Label for the daily sessions column in the leaderboard table',

              }),
              accessor: 'sessionCount',
            },
            {
              Header: intl.formatMessage({
                id: 'advance.analytics.leaderboard.table.header.average.session.length',
                defaultMessage: 'Average Session Length (Hours)',
                description: 'Label for the average session length column in the leaderboard table',

              }),
              accessor: 'averageSessionLength',
            },
            {
              Header: intl.formatMessage({
                id: 'advance.analytics.leaderboard.table.header.course.completions',
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
  courseType: PropTypes.string,
  course: PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  }),
};

export default Leaderboard;
