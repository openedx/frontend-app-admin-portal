import React, { useMemo } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import { DataTable } from '@openedx/paragon';
import DownloadCSVButton from '../DownloadCSVButton';
import { sumEntitiesByMetric } from '../data/utils';
import Header from '../Header';

const TopSubjectsByEnrollmentTable = ({
  isFetching,
  data = [],
  startDate,
  endDate,
  trackCsvDownloadClick,
}) => {
  const intl = useIntl();

  // Aggregate "audit" and "certificate" data. Groups all records by courseSubject.
  // Adds up enrollmentCount for each course.
  const topSubjectsByEnrollment = React.useMemo(
    () => sumEntitiesByMetric(data, 'courseSubject', ['enrollmentCount']),
    [data],
  );

  const columns = [
    {
      header: {
        id: 'analytics.top.subject.by.enrollment.subjects.column.header',
        defaultMessage: 'Subjects',
        description: 'Column header for subjects in top subjects by enrollment table',
      },
      accessor: 'courseSubject',
    },
    {
      header: {
        id: 'analytics.top.subject.by.enrollment.enrollments.column.header',
        defaultMessage: 'Enrollment',
        description: 'Column header for enrollment in top subjects by enrollment table',
      },
      accessor: 'enrollmentCount',
    },
  ];

  const topSubjectsByEnrollmentsForCSV = useMemo(
    () => topSubjectsByEnrollment.map(({ courseSubject, enrollmentCount }) => ({
      course_subject: courseSubject,
      enrollment_count: enrollmentCount,
    })),
    [topSubjectsByEnrollment],
  );

  return (
    <div className="mb-4 rounded-lg">
      <Header
        title={intl.formatMessage({
          id: 'analytics.top.subjects.by.enrollment.title',
          defaultMessage: 'Top 10 subjects by enrollment',
          description: 'Chart title for top 10 subjects by enrollment',
        })}
        subtitle={intl.formatMessage({
          id: 'analytics.top.subjects.by.enrollment.subtitle',
          defaultMessage: 'See the subjects your learners are spending the most time in.',
          description: 'Subtitle for top 10 subjects by enrollment chart',
        })}
        DownloadCSVComponent={(
          <DownloadCSVButton
            jsonData={topSubjectsByEnrollmentsForCSV}
            csvFileName={`Top subjects by Enrollment - ${startDate} - ${endDate}`}
            className="px-1"
            entityId="top-subjects-by-enrollment-table"
            trackCsvDownloadClick={trackCsvDownloadClick}
          />
          )}
      />

      <DataTable
        isLoading={isFetching}
        isSortable
        data={topSubjectsByEnrollment}
        itemCount={topSubjectsByEnrollment.length}
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

TopSubjectsByEnrollmentTable.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  trackCsvDownloadClick: PropTypes.func,
};

export default TopSubjectsByEnrollmentTable;
