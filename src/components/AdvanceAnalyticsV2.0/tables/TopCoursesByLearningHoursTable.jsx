import React, { useMemo } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import { DataTable } from '@openedx/paragon';
import DownloadCSVButton from '../DownloadCSVButton';
import { sumEntitiesByMetric, modifyDataToIntroduceEnrollTypeCount } from '../data/utils';
import Header from '../Header';

const TopCoursesByLearningHoursTable = ({
  isFetching,
  data = [],
  startDate,
  endDate,
}) => {
  const intl = useIntl();

  const topCoursesByEngagement = React.useMemo(
    () => sumEntitiesByMetric(data, 'courseKey', ['learningTimeHours']),
    [data],
  );

  const columns = [
    {
      header: {
        id: 'analytics.top.course.by.learning.hours.courses.column.header',
        defaultMessage: 'Courses',
        description: 'Column header for courses in top courses by learning hours table',
      },
      accessor: 'courseTitle',
    },
    {
      header: {
        id: 'analytics.top.course.by.learning.hours.column.header',
        defaultMessage: 'Learning hours',
        description: 'Column header for learning hours in top courses by learning hours table',
      },
      accessor: 'learningTimeHours',
    },
  ];

  const topCoursesByEngagementForCSV = useMemo(() => {
    const topCoursesByEngagementCSV = modifyDataToIntroduceEnrollTypeCount(
      data,
      'courseKey',
      'learningTimeHours',
    );
    return topCoursesByEngagementCSV.map(({
      courseKey, courseTitle, certificate, audit,
    }) => ({
      course_key: courseKey,
      course_title: courseTitle,
      certificate,
      audit,
    }));
  }, [data]);

  return (
    <div className="mb-4 rounded-lg">
      <Header
        title={intl.formatMessage({
          id: 'analytics.top.courses.by.engagement.title',
          defaultMessage: 'Top 10 courses by learning hours',
          description: 'Chart title for top 10 courses by learning hours',
        })}
        subtitle={intl.formatMessage({
          id: 'analytics.top.courses.by.engagement.subtitle',
          defaultMessage: 'See the most popular courses at your organization.',
          description: 'Subtitle for top 10 courses by learning hours chart',
        })}
        DownloadCSVComponent={(
          <DownloadCSVButton
            jsonData={topCoursesByEngagementForCSV}
            csvFileName={`Top Courses by learning hours - ${startDate} - ${endDate}`}
            className="px-1"
          />
          )}
      />

      <DataTable
        isLoading={isFetching}
        isSortable
        data={topCoursesByEngagement}
        itemCount={topCoursesByEngagement.length}
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

TopCoursesByLearningHoursTable.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  startDate: PropTypes.string,
  endDate: PropTypes.string,
};

export default TopCoursesByLearningHoursTable;
