import { DataTable, TextFilter } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { camelCaseObject } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  formatPercentage,
  formatPrice,
  i18nFormatPassedTimestamp,
  i18nFormatProgressStatus,
  i18nFormatTimestamp,
  updateUrl,
} from '../../utils';
import useDatatable from '../Datatable/hooks/useDatatable';
import { analyticsEnrollmentsResponsePage1 } from '../../data/services/POCHelper';

const retrieveData = async (datatableProps, setDataset) => {
  try {
    const results = await datatableProps.data;
    setDataset(results);
    return results;
  } catch (error) {
    logError(error);
  }
};

const EnrollmentsTablePOC = (props) => {
  const [dataset, setDataset] = useState([]);
  const intl = useIntl();
  const navigate = useNavigate();
  const location = useLocation();
  const datasetFn = useCallback(async (args) => {
    // Goal is to keep the URL updated with the filter and sortby metadata keyed to the datatable id
    if (args.searchParams) {
      updateUrl(navigate, location.pathname, args.searchParams);
    }
    if (!args) {
      const results = await camelCaseObject(analyticsEnrollmentsResponsePage1());
      return results;
    }
    let page = analyticsEnrollmentsResponsePage1();
    if (args?.pageIndex === 1) {
      page = await analyticsEnrollmentsResponsePage1().next();
    }
    return camelCaseObject(page);
  }, []);
  const datatableProps = useDatatable({
    tableId: 'enrollments',
    initialState: {
      pageSize: 50,
      pageIndex: 0,
      sortBy: [
        { id: 'lastActivityDate', desc: true },
      ],
      filters: [],
    },
    manualPagination: true,
    manualSortBy: true,
    manualFilters: true,
    fetchData: datasetFn,
    customFilters: props.searchParams,
    dataAccessor: 'results',
    columns: [
      {
        Header: intl.formatMessage({
          id: 'adminPortal.enrollmentsTable.user_email',
          defaultMessage: 'Email',
        }),
        accessor: 'userEmail',
      },
      {
        Header: intl.formatMessage({
          id: 'adminPortal.enrollmentsTable.user_first_name',
          defaultMessage: 'First Name',
          description: 'Title for the first name column in the enrollments table',
        }),
        accessor: 'userFirstName',
        disableFilters: true,
      },
      {
        Header: intl.formatMessage({
          id: 'adminPortal.enrollmentsTable.user_last_name',
          defaultMessage: 'Last Name',
          description: 'Title for the last name column in the enrollments table',
        }),
        accessor: 'userLastName',
        disableFilters: true,
      },
      {
        Header: intl.formatMessage({
          id: 'adminPortal.enrollmentsTable.courseTitle',
          defaultMessage: 'Course Title',
        }),
        accessor: 'courseTitle',
      },
      {
        Header: intl.formatMessage({
          id: 'adminPortal.enrollmentsTable.courseListPrice',
          defaultMessage: 'Course Price',
        }),
        accessor: 'courseListPrice',
        Cell: ({ row }) => formatPrice(row.values.courseListPrice),
        disableFilters: true,
      },
      {
        Header: intl.formatMessage({
          id: 'adminPortal.enrollmentsTable.courseStartDate',
          defaultMessage: 'Start Date',
        }),
        accessor: 'courseStartDate',
        Cell: ({ row }) => i18nFormatTimestamp({ intl, timestamp: row.values.courseStartDate }),
      },
      {
        Header: intl.formatMessage({
          id: 'adminPortal.enrollmentsTable.courseEndDate',
          defaultMessage: 'End Date',
        }),
        accessor: 'courseEndDate',
        Cell: ({ row }) => i18nFormatTimestamp({ intl, timestamp: row.values.courseEndDate }),
        disableFilters: true,
      },
      {
        Header: intl.formatMessage({
          id: 'adminPortal.enrollmentsTable.passedDate',
          defaultMessage: 'Passed Date',
        }),
        accessor: 'passedDate',
        Cell: ({ row }) => i18nFormatPassedTimestamp({ intl, timestamp: row.values.passedDate }),
        disableFilters: true,
      },
      {
        Header: intl.formatMessage({
          id: 'adminPortal.enrollmentsTable.currentGrade',
          defaultMessage: 'Current Grade',
        }),
        accessor: 'currentGrade',
        Cell: ({ row }) => formatPercentage({ decimal: row.values.currentGrade }),
        disableFilters: true,
      },
      {
        Header: intl.formatMessage({
          id: 'adminPortal.enrollmentsTable.progressStatus',
          defaultMessage: 'Progress Status',
        }),
        accessor: 'progressStatus',
        Cell: ({ row }) => i18nFormatProgressStatus({ intl, progressStatus: row.values.progressStatus }),
        disableFilters: true,
      },
      {
        Header: intl.formatMessage({
          id: 'adminPortal.enrollmentsTable.lastActivityDate',
          defaultMessage: 'Last Activity Date',
        }),
        accessor: 'lastActivityDate',
        Cell: ({ row }) => i18nFormatTimestamp({ intl, timestamp: row.values.lastActivityDate }),
        disableFilters: true,
      },
    ],
  });

  useEffect(() => {
    retrieveData(datatableProps, setDataset);
  }, [datatableProps, datasetFn, setDataset]);

  return (
    <div id={datatableProps.tableId} className="enrollments" data-testid="enrollments-table">
      <DataTable
        {...datatableProps}
        defaultColumnValues={{ Filter: TextFilter }}
        data={dataset || []}
      />
    </div>

  );
};

const mapStateToProps = ((state, ownProps) => {
  const tableState = state.table[ownProps.id] || {};
  return {
    enterpriseId: state.portalConfiguration.enterpriseId,
    data: tableState.data && tableState.data.results,
    currentPage: tableState.data && tableState.data.current_page,
    pageCount: tableState.data && tableState.data.num_pages,
  };
});

export default connect(
  mapStateToProps,
)(EnrollmentsTablePOC);
