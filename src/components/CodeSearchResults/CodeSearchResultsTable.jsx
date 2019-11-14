import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import qs from 'query-string';
import { withRouter } from 'react-router';
import { Icon } from '@edx/paragon';
import { isValidEmail } from '../../utils';

import { isValidEmail } from '../../utils';
import TableContainer from '../../containers/TableContainer';
import RemindButton from '../RemindButton';
import RevokeButton from '../RevokeButton';

import EcommerceApiService from '../../data/services/EcommerceApiService';

const tableColumns = [
  {
    label: 'Coupon Batch',
    key: 'couponName',
  },
  {
    label: 'Code',
    key: 'code',
  },
  {
    label: 'Redeemed',
    key: 'isRedeemed',
  },
  {
    label: 'Redemption Date',
    key: 'redemptionDate',
  },
  {
    label: 'Course Title',
    key: 'courseTitle',
  },
  {
    label: 'Actions',
    key: 'actions',
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

const handleTableColumns = (searchQuery) => {
  const getColumnIndexForKey = key => tableColumns.findIndex(column => column.key === key);
  // If search is made by email, no need to show "Assigned To" field
  if (isValidEmail(searchQuery) === undefined) {
    // Remove "Assigned To" column if it already exists
    if (getColumnIndexForKey('assignedTo') > -1) {
      tableColumns.splice(getColumnIndexForKey('assignedTo'), 1);
    }
  }
  // If search is made by code, show "Assigned To" field
  else if (isValidEmail(searchQuery) !== undefined) {
    // Add "Assigned To" column if it doesn't already exist
    if (getColumnIndexForKey('assignedTo') === -1) {
      tableColumns.splice(4, 0, {
        label: 'Assigned To',
        key: 'assignedTo',
      });
    }
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
  const queryParams = qs.parse(location.search);
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
      actions: !isRedeemed ? (
        <React.Fragment>
          {isAssigned ? (
            <React.Fragment>
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
            </React.Fragment>
          ) : defaultEmptyValue
          }
        </React.Fragment>
      ) : defaultEmptyValue,
    }));
  };
  return (
    <TableContainer
      key={`code-search-results-${searchQuery}-${shouldRefreshTable}`}
      id="code-search-results"
      className="code-search-results-table"
      fetchMethod={() => EcommerceApiService.fetchCodeSearchResults({
        search_parameter: searchQuery,
        page: queryParams.page && parseInt(queryParams.page, 10),
      })}
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
