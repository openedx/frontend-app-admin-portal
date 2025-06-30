import React, { useMemo } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import { DataTable } from '@openedx/paragon';
import DownloadCSVButton from '../DownloadCSVButton';
import { sumEntitiesByMetric } from '../data/utils';
import Header from '../Header';

const TopCoursesByCompletionTable = ({
  isFetching,
  data = [],
  startDate,
  endDate,
  granularity,
  calculation,
}) => {
  const intl = useIntl();

  // Aggregate "audit" and "certificate" data. Groups all records by courseKey.
  // Adds up completionCount for each course.
  const topCoursesByCompletion = React.useMemo(
    () => sumEntitiesByMetric(data, 'courseKey', ['completionCount']),
    [data],
  );

  const columns = [
    {
      header: {
        id: 'analytics.top.course.by.completion.courses.column.header',
        defaultMessage: 'Courses',
        description: 'Column header for courses in top courses by completion table',
      },
      accessor: 'courseTitle',
    },
    {
      header: {
        id: 'analytics.top.course.by.completion.column.header.completion',
        defaultMessage: 'Completion',
        description: 'Column header for completion in top courses by completion table',
      },
      accessor: 'completionCount',
    },
  ];

  const topCoursesByCompletionsForCSV = useMemo(
    () => topCoursesByCompletion.map(({ courseKey, courseTitle, completionCount }) => ({
      course_key: courseKey,
      course_title: courseTitle,
      completion_count: completionCount,
    })),
    [topCoursesByCompletion],
  );

  return (
    <div className="mb-4 rounded-lg">
      <Header
        title={intl.formatMessage({
          id: 'analytics.top.courses.by.completion.title',
          defaultMessage: 'Top 10 courses by completion',
          description: 'Chart title for top 10 courses by completion',
        })}
        subtitle={intl.formatMessage({
          id: 'analytics.top.courses.by.completion.subtitle',
          defaultMessage: 'See the courses in which your learners are most often achieving a passing grade.',
          description: 'Subtitle for top 10 courses by completion table',
        })}
        DownloadCSVComponent={(
          <DownloadCSVButton
            jsonData={topCoursesByCompletionsForCSV}
            csvFileName={`Top Courses by Completion - ${startDate} - ${endDate} (${granularity} ${calculation})`}
            className="px-1"
          />
          )}
      />

      <DataTable
        isLoading={isFetching}
        isSortable
        data={topCoursesByCompletion}
        itemCount={topCoursesByCompletion.length}
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

TopCoursesByCompletionTable.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  granularity: PropTypes.string,
  calculation: PropTypes.string,
};

export default TopCoursesByCompletionTable;
