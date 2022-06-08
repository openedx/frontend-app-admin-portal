import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { withRouter } from 'react-router-dom';
import { Icon } from '@edx/paragon';

import { isValidEmail } from '../../utils';
import TableContainer from '../../containers/TableContainer';
import RemindButton from '../RemindButton';
import RevokeButton from '../RevokeButton';

import EcommerceApiService from '../../data/services/EcommerceApiService';

const tableColumns = [
  {
    Header: 'Coupon Batch',
    accessor: 'couponName',
  },
  {
    Header: 'Code',
    accessor: 'code',
  },
  {
    Header: 'Redeemed',
    accessor: 'isRedeemed',
  },
  {
    Header: 'Redemption Date',
    accessor: 'redemptionDate',
  },
  {
    Header: 'Course Title',
    accessor: 'courseTitle',
  },
  {
    Header: 'Actions',
    accessor: 'actions',
  },
];

const getFormattedDate = (date) => {
  if (!date) {
    return null;
  }
  return moment(date).format('MMMM D, YYYY');
};

const transformSearchResults = results => results.map(({
  coupon_id: couponId,
  coupon_name: couponName,
  course_key: courseKey,
  course_title: courseTitle,
  redeemed_date: redemptionDate,
  is_assigned: isAssigned,
  user_email: assignedTo,
  ...rest
}) => ({
  couponId,
  couponName,
  courseKey,
  courseTitle,
  assignedTo,
  redemptionDate: getFormattedDate(redemptionDate),
  isRedeemed: !!redemptionDate,
  isAssigned: !!isAssigned,
  ...rest,
}));

const searchParameter = (searchQuery) => {
  if (isValidEmail(searchQuery) === undefined) { return 'user_email'; }
  return 'voucher_code';
};

const handleTableColumns = (searchQuery) => {
  const assignedToColumnIndex = tableColumns.findIndex(column => column.key === 'assignedTo');
  // If search is made by email, no need to show "Assigned To" field
  if (isValidEmail(searchQuery) === undefined && assignedToColumnIndex > -1) {
    // Remove "Assigned To" column if it already exists
    tableColumns.splice(assignedToColumnIndex, 1);
  } else if (isValidEmail(searchQuery) !== undefined && assignedToColumnIndex === -1) {
    // Add "Assigned To" column if it doesn't already exist
    tableColumns.splice(4, 0, {
      Header: 'Assigned To',
      accessor: 'assignedTo',
    });
  }
  return tableColumns;
};

const CodeSearchResultsTable = ({
  searchQuery,
  shouldRefreshTable,
  onRemindSuccess,
  onRevokeSuccess,
  location,
}) => {
  const queryParams = new URLSearchParams(location.search);
  const formatSearchResultsData = (results) => {
    const transformedSearchResults = transformSearchResults(results);
    const defaultEmptyValue = '-';
    return transformedSearchResults.map(({
      isRedeemed,
      isAssigned,
      couponId,
      courseTitle,
      redemptionDate,
      code,
      couponName,
      assignedTo,
    }) => ({
      couponId,
      couponName,
      code,
      isRedeemed: isRedeemed ? (
        <Icon className="fa fa-check text-primary" screenReaderText="has been redeemed" />
      ) : defaultEmptyValue,
      courseTitle: courseTitle || defaultEmptyValue,
      assignedTo: assignedTo || defaultEmptyValue,
      redemptionDate: redemptionDate || defaultEmptyValue,
      actions: !isRedeemed && isAssigned ? (
        <>
          <RemindButton
            couponId={couponId}
            couponTitle={couponName}
            data={{
              email: assignedTo,
              code,
            }}
            onSuccess={onRemindSuccess}
          />
          {' | '}
          <RevokeButton
            couponId={couponId}
            couponTitle={couponName}
            data={{
              assigned_to: assignedTo,
              code,
            }}
            onSuccess={onRevokeSuccess}
          />
        </>
      ) : defaultEmptyValue,
    }));
  };

  const fetchOptions = {
    [searchParameter(searchQuery)]: searchQuery,
  };
  if (queryParams.get('page')) {
    fetchOptions.page = parseInt(queryParams.get('page'), 10);
  }

  return (
    <TableContainer
      key={`code-search-results-${searchQuery}-${shouldRefreshTable}`}
      id="code-search-results"
      className="code-search-results-table"
      fetchMethod={() => EcommerceApiService.fetchCodeSearchResults(fetchOptions)}
      columns={handleTableColumns(searchQuery)}
      formatData={formatSearchResultsData}
    />
  );
};

CodeSearchResultsTable.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  shouldRefreshTable: PropTypes.bool.isRequired,
  onRemindSuccess: PropTypes.func.isRequired,
  onRevokeSuccess: PropTypes.func.isRequired,
  location: PropTypes.shape({
    search: PropTypes.string,
  }).isRequired,
};

export default withRouter(CodeSearchResultsTable);
