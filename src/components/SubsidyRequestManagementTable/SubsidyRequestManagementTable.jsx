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
import CourseTitleCell from './CourseTitleCell';
import ActionCell from './ActionCell';

const SubsidyRequestManagementTable = ({
  onApprove,
  onDecline,
  data,
  fetchData,
  requestStatusFilterChoices,
  isLoading,
  pageCount,
  itemCount,
  initialTableOptions,
  initialState,
  ...rest
}) => {
  const columns = useMemo(
    () => ([
      {
        Header: 'Email address',
        accessor: 'email',
        Cell: EmailAddressCell,
      },
      {
        Header: 'Course title',
        accessor: 'courseTitle',
        Cell: CourseTitleCell,
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
      itemCount={itemCount}
      pageCount={pageCount}
      fetchData={fetchData}
      isLoading={isLoading}
      data={data}
      columns={columns}
      additionalColumns={[{
        id: 'action',
        Header: '',
        Cell: (props) => (
          <ActionCell
            {...props}
            onApprove={onApprove}
            onDecline={onDecline}
          />
        ),
      }]}
      initialTableOptions={initialTableOptions}
      initialState={initialState}
      {...rest}
    >
      <DataTable.TableControlBar />
      <DataTable.Table />
      {!isLoading && (
        <DataTable.EmptyTable content="No results found" />
      )}
      <DataTable.TableFooter />
    </DataTable>
  );
};

SubsidyRequestManagementTable.propTypes = {
  fetchData: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  pageCount: PropTypes.number.isRequired,
  itemCount: PropTypes.number.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({
    email: PropTypes.string,
    courseTitle: PropTypes.string,
    courseId: PropTypes.string,
    requestDate: PropTypes.string,
    requestStatus: PropTypes.oneOf([
      'approved', 'requested', 'declined', 'pending', 'error',
    ]),
  })).isRequired,
  requestStatusFilterChoices: PropTypes.arrayOf(PropTypes.shape({
    number: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    value: PropTypes.string,
  })).isRequired,
  onApprove: PropTypes.func.isRequired,
  onDecline: PropTypes.func.isRequired,
  initialTableOptions: PropTypes.shape().isRequired,
  initialState: PropTypes.shape().isRequired,
};

export default SubsidyRequestManagementTable;
