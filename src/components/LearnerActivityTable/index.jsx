import React, {
  useCallback, useMemo, useRef, useState,
} from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { DataTable, Alert } from '@openedx/paragon';
import { Error as ErrorIcon } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { logError } from '@edx/frontend-platform/logging';

import {
  i18nFormatTimestamp, i18nFormatPassedTimestamp, i18nFormatProgressStatus, formatPercentage,
} from '../../utils';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';

/** Suppresses PII from session-recording tools (e.g. Hotjar). */
const UserEmailCell = ({ row }) => (
  <span data-hj-suppress>{row.original.user_email}</span>
);
UserEmailCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({ user_email: PropTypes.string }),
  }).isRequired,
};

const CoursePriceCell = ({ row }) => (row.original.course_list_price ? `$${row.original.course_list_price}` : '');
CoursePriceCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({ course_list_price: PropTypes.string }),
  }).isRequired,
};

const CourseStartDateCell = ({ row }) => {
  const intl = useIntl();
  return i18nFormatTimestamp({ intl, timestamp: row.original.course_start_date });
};
CourseStartDateCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({ course_start_date: PropTypes.string }),
  }).isRequired,
};

const CourseEndDateCell = ({ row }) => {
  const intl = useIntl();
  return i18nFormatTimestamp({ intl, timestamp: row.original.course_end_date });
};
CourseEndDateCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({ course_end_date: PropTypes.string }),
  }).isRequired,
};

const PassedDateCell = ({ row }) => {
  const intl = useIntl();
  return i18nFormatPassedTimestamp({ intl, timestamp: row.original.passed_date });
};
PassedDateCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({ passed_date: PropTypes.string }),
  }).isRequired,
};

const CurrentGradeCell = ({ row }) => formatPercentage({ decimal: row.original.current_grade });
CurrentGradeCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({ current_grade: PropTypes.string }),
  }).isRequired,
};

const ProgressStatusCell = ({ row }) => {
  const intl = useIntl();
  return i18nFormatProgressStatus({ intl, progressStatus: row.original.progress_status });
};
ProgressStatusCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({ progress_status: PropTypes.string }),
  }).isRequired,
};

const LastActivityDateCell = ({ row }) => {
  const intl = useIntl();
  return i18nFormatTimestamp({ intl, timestamp: row.original.last_activity_date });
};
LastActivityDateCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({ last_activity_date: PropTypes.string }),
  }).isRequired,
};

const LearnerActivityTable = ({ id, activity, enterpriseId }) => {
  const intl = useIntl();
  const isInitialFetch = useRef(true);
  const [fetchError, setFetchError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tableData, setTableData] = useState({
    results: [],
    itemCount: 0,
    pageCount: 0,
  });

  const fetchData = useCallback((args) => {
    const options = {};

    const sortBy = args.sortBy?.[0];
    if (sortBy) {
      options.ordering = `${sortBy.desc ? '-' : ''}${sortBy.id}`;
    }
    options.page = (args.pageIndex ?? 0) + 1;

    if (!isInitialFetch.current) {
      if (sortBy) {
        sendEnterpriseTrackEvent(enterpriseId, 'edx.ui.enterprise.admin_portal.table.sorted', {
          tableId: id,
          column: sortBy.id,
          direction: sortBy.desc ? 'desc' : 'asc',
        });
      } else {
        sendEnterpriseTrackEvent(enterpriseId, 'edx.ui.enterprise.admin_portal.table.paginated', {
          tableId: id,
          page: options.page,
        });
      }
    }
    isInitialFetch.current = false;

    setIsLoading(true);
    setFetchError(null);
    EnterpriseDataApiService.fetchCourseEnrollments(enterpriseId, {
      learnerActivity: activity,
      ...options,
    })
      .then((response) => {
        setTableData({
          results: response.data.results,
          itemCount: response.data.count,
          pageCount: response.data.num_pages,
        });
      })
      .catch((err) => {
        logError(err);
        setFetchError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [enterpriseId, activity, id]);

  const allColumns = useMemo(() => [
    {
      Header: intl.formatMessage({
        id: 'admin.portal.lpr.learner.activity.table.user_email.column.heading',
        defaultMessage: 'Email',
        description: 'Column heading for the user email column in the learner activity table',
      }),
      accessor: 'user_email',
      Cell: UserEmailCell,
    },
    {
      Header: intl.formatMessage({
        id: 'admin.portal.lpr.learner.activity.table.course_title.column.heading',
        defaultMessage: 'Course Title',
        description: 'Column heading for the course title column in the learner activity table',
      }),
      accessor: 'course_title',
    },
    {
      Header: intl.formatMessage({
        id: 'admin.portal.lpr.learner.activity.table.course_list_price.column.heading',
        defaultMessage: 'Course Price',
        description: 'Column heading for the course price column in the learner activity table',
      }),
      accessor: 'course_list_price',
      Cell: CoursePriceCell,
    },
    {
      Header: intl.formatMessage({
        id: 'admin.portal.lpr.learner.activity.table.course_start_date.column.heading',
        defaultMessage: 'Start Date',
        description: 'Column heading for the course start date column in the learner activity table',
      }),
      accessor: 'course_start_date',
      Cell: CourseStartDateCell,
    },
    {
      Header: intl.formatMessage({
        id: 'admin.portal.lpr.learner.activity.table.course_end_date.column.heading',
        defaultMessage: 'End Date',
        description: 'Column heading for the course end date column in the learner activity table',
      }),
      accessor: 'course_end_date',
      Cell: CourseEndDateCell,
    },
    {
      Header: intl.formatMessage({
        id: 'admin.portal.lpr.learner.activity.table.passed_date.column.heading',
        defaultMessage: 'Passed Date',
        description: 'Column heading for the passed date column in the learner activity table',
      }),
      accessor: 'passed_date',
      Cell: PassedDateCell,
    },
    {
      Header: intl.formatMessage({
        id: 'admin.portal.lpr.learner.activity.table.current_grade.column.heading',
        defaultMessage: 'Current Grade',
        description: 'Column heading for the current grade column in the learner activity table',
      }),
      accessor: 'current_grade',
      Cell: CurrentGradeCell,
    },
    {
      Header: intl.formatMessage({
        id: 'admin.portal.lpr.learner.activity.table.progress_status.column.heading',
        defaultMessage: 'Progress Status',
        description: 'Column heading for the progress status column in the learner activity table',
      }),
      accessor: 'progress_status',
      Cell: ProgressStatusCell,
    },
    {
      Header: intl.formatMessage({
        id: 'admin.portal.lpr.learner.activity.table.enrollment_date.column.heading',
        defaultMessage: 'Last Activity Date',
        description: 'Column heading for the last activity date column in the learner activity table',
      }),
      accessor: 'last_activity_date',
      Cell: LastActivityDateCell,
    },
  ], [intl]);

  const columns = useMemo(
    () => (activity === 'active_past_week'
      ? allColumns
      : allColumns.filter(col => col.accessor !== 'passed_date')),
    [allColumns, activity],
  );

  return (
    <>
      {fetchError && (
        <Alert variant="danger" icon={ErrorIcon}>
          <Alert.Heading>Unable to load data</Alert.Heading>
          <p>
            Try refreshing your screen.
            {fetchError.message}
          </p>
        </Alert>
      )}
      <DataTable
        isSortable
        manualSortBy
        isPaginated
        manualPagination
        isLoading={isLoading}
        columns={columns}
        data={tableData.results}
        itemCount={tableData.itemCount}
        pageCount={tableData.pageCount}
        fetchData={fetchData}
        initialState={{
          pageSize: 50,
          pageIndex: 0,
        }}
      >
        <DataTable.TableControlBar />
        <DataTable.Table className={id} />
        <DataTable.EmptyTable
          content={intl.formatMessage({
            id: 'admin.portal.lpr.learner.activity.table.empty',
            defaultMessage: 'There are no results.',
            description: 'Message shown when there are no learner activity results to display',
          })}
        />
        <DataTable.TableFooter />
      </DataTable>
    </>
  );
};

LearnerActivityTable.propTypes = {
  id: PropTypes.string.isRequired,
  activity: PropTypes.string.isRequired,
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(LearnerActivityTable);
