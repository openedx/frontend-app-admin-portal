import { DataTable } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { camelCaseObject } from '@edx/frontend-platform';
import {
  formatPercentage,
  formatPrice,
  i18nFormatPassedTimestamp,
  i18nFormatProgressStatus,
  i18nFormatTimestamp,
} from '../../utils';
import useDatatable from '../Datatable/hooks/useDatatable';
import { analyticsEnrollmentsResponsePage1 } from '../../data/services/POCHelper';

const retrieveData = async (datatableProps, setDataset) => {
  try {
    const results = await datatableProps.data;
    setDataset(results);
    return results;
    // setDatasetArgs(results.datasetArgs);
  } catch (error) {
    console.log(error);
  }
};

const EnrollmentsTablePOC = (props) => {
  const [dataset, setDataset] = useState([]);
  const [datasetArgs, setDatasetArgs] = useState({});
  const intl = useIntl();

  const datasetFn = useCallback(async (args) => {
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
    initialState: {
      pageSize: 50,
      pageIndex: 0,
      sortBy: [
        { id: 'lastActivityDate' },
      ],
    },
    manualPagination: true,
    manualSortBy: true,
    fetchData: datasetFn,
    dataAccessor: 'results',
    columns: [
      {
        Header: 'Email',
        accessor: 'userEmail',
      },
      {
        Header: 'First Name',
        accessor: 'userFirstName',
      },
      {
        Header: 'Last Name',
        accessor: 'userLastName',
      },
      {
        Header: 'Course Title',
        accessor: 'courseTitle',
      },
      {
        Header: 'Course Price',
        accessor: 'courseListPrice',
        Cell: ({ row }) => formatPrice(row.values.courseListPrice),
      },
      {
        Header: 'Start Date',
        accessor: 'courseStartDate',
        Cell: ({ row }) => i18nFormatTimestamp({ intl, timestamp: row.values.courseStartDate }),
      },
      {
        Header: 'End Date',
        accessor: 'courseEndDate',
        Cell: ({ row }) => i18nFormatTimestamp({ intl, timestamp: row.values.courseEndDate }),
      },
      {
        Header: 'Passed Date',
        accessor: 'passedDate',
        Cell: ({ row }) => i18nFormatPassedTimestamp({ intl, timestamp: row.values.passedDate }),
      },
      {
        Header: 'Current Grade',
        accessor: 'currentGrade',
        Cell: ({ row }) => formatPercentage({ decimal: row.values.currentGrade }),
      },
      {
        Header: 'Progress Status',
        accessor: 'progressStatus',
        Cell: ({ row }) => i18nFormatProgressStatus({ intl, progressStatus: row.values.progressStatus }),
      },
      {
        Header: 'Last Activity Date',
        accessor: 'lastActivityDate',
        Cell: ({ row }) => i18nFormatTimestamp({ intl, timestamp: row.values.lastActivityDate }),
      },
    ],
  });

  useEffect(() => {
    retrieveData(datatableProps, setDataset, setDatasetArgs);
  }, [datatableProps, datasetFn, setDataset, setDatasetArgs]);

  return (
    <DataTable
      {...datatableProps}
      data={dataset || []}
    />
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
