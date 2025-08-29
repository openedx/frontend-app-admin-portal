import React, { useMemo } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import { DataTable } from '@openedx/paragon';
import DownloadCSVButton from '../DownloadCSVButton';
import { sumEntitiesByMetric } from '../data/utils';
import Header from '../Header';

const TopSubjectsByCompletionTable = ({
  isFetching,
  data = [],
  startDate,
  endDate,
  granularity,
  calculation,
}) => {
  const intl = useIntl();

  // Aggregate "audit" and "certificate" data. Groups all records by courseSubject.
  // Adds up completionCount for each course.
  const topSubjectsByCompletion = React.useMemo(
    () => sumEntitiesByMetric(data, 'courseSubject', ['completionCount']),
    [data],
  );

  const columns = [
    {
      header: {
        id: 'analytics.top.course.by.completion.subject.column.header',
        defaultMessage: 'Subject',
        description: 'Column header for subject in top subjects by completion table',
      },
      accessor: 'courseSubject',
    },
    {
      header: {
        id: 'analytics.top.course.by.completion.column.header.completion',
        defaultMessage: 'Completion',
        description: 'Column header for completion in top subjects by completion table',
      },
      accessor: 'completionCount',
    },
  ];

  const topSubjectsByCompletionsForCSV = useMemo(
    () => topSubjectsByCompletion.map(({ courseSubject, completionCount }) => ({
      course_subject: courseSubject,
      completion_count: completionCount,
    })),
    [topSubjectsByCompletion],
  );

  return (
    <div className="mb-4 rounded-lg">
      <Header
        title={intl.formatMessage({
          id: 'analytics.top.subjects.by.completion.title',
          defaultMessage: 'Top 10 subjects by completion',
          description: 'Chart title for top 10 subjects by completion',
        })}
        subtitle={intl.formatMessage({
          id: 'analytics.top.subjects.by.completion.subtitle',
          defaultMessage: 'See the subjects in which your learners are most often achieving a passing grade.',
          description: 'Subtitle for top 10 subjects by completion table',
        })}
        DownloadCSVComponent={(
          <DownloadCSVButton
            jsonData={topSubjectsByCompletionsForCSV}
            csvFileName={`Top Subjects by Completion - ${startDate} - ${endDate} (${granularity} ${calculation})`}
            className="px-1"
          />
          )}
      />

      <DataTable
        isLoading={isFetching}
        isSortable
        data={topSubjectsByCompletion}
        itemCount={topSubjectsByCompletion.length}
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

TopSubjectsByCompletionTable.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  granularity: PropTypes.string,
  calculation: PropTypes.string,
};

export default TopSubjectsByCompletionTable;
