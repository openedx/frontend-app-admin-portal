import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  DataTable,
  TextFilter,
  CheckboxFilter,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

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
  disableApproveButton,
  ...rest
}) => {
  const intl = useIntl();

  const columns = useMemo(
    () => ([
      {
        Header: intl.formatMessage({
          id: 'admin.portal.subsidy.request.management.table.email.address.header',
          defaultMessage: 'Email address',
          description: 'Header for the email address column in the subsidy request management table.',
        }),
        accessor: 'email',
        Cell: EmailAddressCell,
      },
      {
        Header: intl.formatMessage({
          id: 'admin.portal.subsidy.request.management.table.course.title.header',
          defaultMessage: 'Course title',
          description: 'Header for the course title column in the subsidy request management table.',
        }),
        accessor: 'courseTitle',
        Cell: CourseTitleCell,
        disableFilters: true,
      },
      {
        Header: intl.formatMessage({
          id: 'admin.portal.subsidy.request.management.table.request.date.header',
          defaultMessage: 'Request date',
          description: 'Header for the request date column in the subsidy request management table.',
        }),
        accessor: 'requestDate',
        Cell: RequestDateCell,
        disableFilters: true,
      },
      {
        Header: intl.formatMessage({
          id: 'admin.portal.subsidy.request.management.table.request.status.header',
          defaultMessage: 'Request status',
          description: 'Header for the request status column in the subsidy request management table.',
        }),
        accessor: 'requestStatus',
        Cell: RequestStatusCell,
        Filter: CheckboxFilter,
        filter: 'includesValue',
        filterChoices: requestStatusFilterChoices,
      },
    ]),
    [requestStatusFilterChoices, intl],
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
        // eslint-disable-next-line react/no-unstable-nested-components
        Cell: (props) => (
          <ActionCell
            {...props}
            onApprove={onApprove}
            onDecline={onDecline}
            disableApproveButton={disableApproveButton}
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
        <DataTable.EmptyTable content={intl.formatMessage({
          id: 'admin.portal.subsidy.request.management.table.empty.table.message',
          defaultMessage: 'No results found',
          description: 'Message displayed when no results are found in the subsidy request management table.',
        })}
        />
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
  disableApproveButton: PropTypes.bool,
};

SubsidyRequestManagementTable.defaultProps = {
  disableApproveButton: false,
};

export default SubsidyRequestManagementTable;
