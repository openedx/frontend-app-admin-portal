import React, { useMemo } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import { DataTable } from '@openedx/paragon';
import DownloadCSVButton from '../DownloadCSVButton';
import { sumEntitiesByMetric } from '../data/utils';
import Header from '../Header';

const TopSubjectsByLearningHoursTable = ({
  isFetching,
  data = [],
  startDate,
  endDate,
}) => {
  const intl = useIntl();

  // Aggregate "audit" and "certificate" data. Groups all records by courseSubject.
  // Adds up learningTimeHours for each course.
  const topSubjectsByEngagement = React.useMemo(
    () => sumEntitiesByMetric(data, 'courseSubject', ['learningTimeHours']),
    [data],
  );

  const columns = [
    {
      header: {
        id: 'analytics.top.subject.by.learning.hours.subjects.column.header',
        defaultMessage: 'Subjects',
        description: 'Column header for subjects in top subjects by learning hours table',
      },
      accessor: 'courseSubject',
    },
    {
      header: {
        id: 'analytics.top.subject.by.learning.hours.column.header',
        defaultMessage: 'Learning hours',
        description: 'Column header for learning hours in top subjects by learning hours table',
      },
      accessor: 'learningTimeHours',
    },
  ];

  const topSubjectsByEngagementForCSV = useMemo(
    () => topSubjectsByEngagement.map(({ courseSubject, learningTimeHours }) => ({
      course_subject: courseSubject,
      learning_time_hours: learningTimeHours,
    })),
    [topSubjectsByEngagement],
  );

  return (
    <div className="mb-4 rounded-lg">
      <Header
        title={intl.formatMessage({
          id: 'analytics.top.subjects.by.engagement.title',
          defaultMessage: 'Top 10 subjects by learning hours',
          description: 'Chart title for top 10 subjects by learning hours',
        })}
        subtitle={intl.formatMessage({
          id: 'analytics.top.subjects.by.engagement.subtitle',
          defaultMessage: 'See the subjects your learners are spending the most time in.',
          description: 'Subtitle for top 10 subjects by learning hours chart',
        })}
        DownloadCSVComponent={(
          <DownloadCSVButton
            jsonData={topSubjectsByEngagementForCSV}
            csvFileName={`Top subjects by learning hours - ${startDate} - ${endDate}`}
            className="px-1"
          />
          )}
      />

      <DataTable
        isLoading={isFetching}
        isSortable
        data={topSubjectsByEngagement}
        itemCount={topSubjectsByEngagement.length}
        pageCount={1}
        initialState={{ pageSize: 10, pageIndex: 0 }}
        columns={columns.map(col => ({
          Header: intl.formatMessage(col.header),
          accessor: col.accessor,
        }))}
      >
        <DataTable.TableControlBar />
        <DataTable.Table />
        <DataTable.EmptyTable content={intl.formatMessage({
          id: 'advance.analytics.top.records.table.empty.label',
          defaultMessage: 'No results found.',
          description: 'Default empty message if no data provided for top records table',
        })}
        />
        <DataTable.TableFooter />
      </DataTable>
    </div>
  );
};

TopSubjectsByLearningHoursTable.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  startDate: PropTypes.string,
  endDate: PropTypes.string,
};

export default TopSubjectsByLearningHoursTable;
