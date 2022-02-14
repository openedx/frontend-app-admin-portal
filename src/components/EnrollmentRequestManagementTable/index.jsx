import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  DataTable,
  TextFilter,
  CheckboxFilter,
} from '@edx/paragon';

import EmailAddressCell from './EmailAddressCell';
import RequestDateCell from './RequestDateCell';
import RequestStatusCell from './RequestStatusCell';
import CourseNameCell from './CourseNameCell';
import ActionCell from './ActionCell';

const EnrollmentRequestManagementTable = ({
  onApprove,
  onDecline,
  data,
  fetchData,
  requestStatusFilterChoices,
}) => {
  const columns = useMemo(
    () => ([
      {
        Header: 'Email address',
        accessor: 'emailAddress',
        Cell: EmailAddressCell,
      },
      {
        Header: 'Course name',
        accessor: 'courseName',
        Cell: CourseNameCell,
        disableFilters: true,
      },
      {
        Header: 'Request date',
        accessor: 'requestDate',
        Cell: RequestDateCell,
        disableFilters: true,
      },
      {
        Header: 'Request status',
        accessor: 'requestStatus',
        Cell: RequestStatusCell,
        Filter: CheckboxFilter,
        filter: 'includesValue',
        filterChoices: requestStatusFilterChoices,
      },
      {
        Header: '',
        accessor: 'action',
        disableFilters: true,
        Cell: (props) => (
          <ActionCell
            {...props}
            onApprove={onApprove}
            onDecline={onDecline}
          />
        ),
      },
    ]),
    [onApprove, onDecline, requestStatusFilterChoices],
  );

  return (
    <DataTable
      isFilterable
      manualFilters
      isPaginated
      manualPagination
      defaultColumnValues={{ Filter: TextFilter }}
      itemCount={3}
      fetchData={fetchData}
      data={data}
      pageCount={1}
      columns={columns}
    >
      <DataTable.TableControlBar />
      <DataTable.Table />
      <DataTable.EmptyTable content="No results found" />
      <DataTable.TableFooter />
    </DataTable>
  );
};

EnrollmentRequestManagementTable.propTypes = {
  fetchData: PropTypes.func.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({
    emailAddress: PropTypes.string,
    courseName: PropTypes.string,
    courseKey: PropTypes.string,
    requestDate: PropTypes.string,
    requestStatus: PropTypes.oneOf(['requested', 'declined']),
  })).isRequired,
  requestStatusFilterChoices: PropTypes.arrayOf(PropTypes.shape({
    number: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    value: PropTypes.string,
  })).isRequired,
  onApprove: PropTypes.func.isRequired,
  onDecline: PropTypes.func.isRequired,
};

export default EnrollmentRequestManagementTable;
