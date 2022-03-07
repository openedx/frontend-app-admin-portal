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
import { capitalizeFirstLetter } from '../../utils';

export const transformRequestOverview = (requestStates) => {
  const requestOverview = {
    requested: 0,
    approved: 0,
    declined: 0,
  };
  // There are other request states beyond "requested", "approved", and "declined" includin
  // "pending" and "error". By default, we do not want to display these in the request status
  // filters as they are implementation details that should only be exposed when request states
  // are actually in that state.
  requestStates.forEach(({ state, count }) => {
    requestOverview[state] = count;
  });
  return Object.entries(requestOverview).map(([state, count]) => ({
    name: capitalizeFirstLetter(state),
    number: count,
    value: state,
  }));
};

export const transformRequests = requests => requests.map((request) => ({
  uuid: request.uuid,
  email: request.email,
  courseTitle: request.courseTitle,
  courseId: request.courseId,
  requestDate: request.created,
  requestStatus: request.state,
}));

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
