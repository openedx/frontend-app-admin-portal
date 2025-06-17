import React, { useMemo } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import { DataTable } from '@openedx/paragon';
import DownloadCSVButton from '../DownloadCSVButton';
import { sumEntitiesByMetric } from '../data/utils';
import Header from '../Header';

const TopCoursesByEnrollmentTable = ({
  isFetching,
  data = [],
  startDate,
  endDate,
}) => {
  const intl = useIntl();

  // Aggregate "audit" and "certificate" data. Groups all records by courseKey.
  // Adds up enrollmentCount for each course.
  const topCoursesByEnrollment = React.useMemo(
    () => sumEntitiesByMetric(data, 'courseKey', ['enrollmentCount']),
    [data],
  );

  const columns = [
    {
      header: {
        id: 'analytics.top.course.by.enrollment.courses.column.header',
        defaultMessage: 'Courses',
        description: 'Column header for courses in top courses by enrollment table',
      },
      accessor: 'courseTitle',
    },
    {
      header: {
        id: 'analytics.top.course.by.enrollment.enrollments.column.header',
        defaultMessage: 'Enrollment',
        description: 'Column header for enrollment in top courses by enrollment table',
      },
      accessor: 'enrollmentCount',
    },
  ];

  const topCoursesByEnrollmentsForCSV = useMemo(
    () => topCoursesByEnrollment.map(({ courseKey, courseTitle, enrollmentCount }) => ({
      course_key: courseKey,
      course_title: courseTitle,
      enrollment_count: enrollmentCount,
    })),
    [topCoursesByEnrollment],
  );

  return (
    <div className="mb-4 rounded-lg">
      <Header
        title={intl.formatMessage({
          id: 'analytics.top.courses.by.enrollment.title',
          defaultMessage: 'Top 10 courses by enrollment',
          description: 'Chart title for top 10 courses by enrollment',
        })}
        subtitle={intl.formatMessage({
          id: 'analytics.top.courses.by.enrollment.subtitle',
          defaultMessage: 'See the most popular courses at your organization.',
          description: 'Subtitle for top 10 courses by enrollment chart',
        })}
        DownloadCSVComponent={(
          <DownloadCSVButton
            jsonData={topCoursesByEnrollmentsForCSV}
            csvFileName={`Top Courses by Enrollment - ${startDate} - ${endDate}`}
            className="px-1"
          />
          )}
      />

      <DataTable
        isLoading={isFetching}
        isSortable
        data={topCoursesByEnrollment}
        itemCount={topCoursesByEnrollment.length}
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

TopCoursesByEnrollmentTable.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  startDate: PropTypes.string,
  endDate: PropTypes.string,
};

export default TopCoursesByEnrollmentTable;
