import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import qs from 'query-string';
import { withRouter } from 'react-router';
import { Icon } from '@edx/paragon';

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

/**
 * The search API response contains records for all vouchers a user is associated
 * with (i.e., has unused assignments, or actual redemptions). To get a complete
 * grouping of assignments or redemptions for a particular coupon batch for the
 * user, we need to combine the results in `assignments_and_redemptions` (which
 * contains all the metadata associated with a redemption, if applicable) for
 * all vouchers that share the same `coupon_id` field. Because we want the search
 * results UI to show a row for each unused assignment and all redeemed courses
 * associated with a particular user, this function flattens the search results by
 * created a new table row for each value in the `redemptions_and_assignments` fields.
 */
const transformSearchResults = (items) => {
  const itemsSortedByCouponId = items.sort((itemA, itemB) => itemA.coupon_id - itemB.coupon_id);
  const flat = [];
  itemsSortedByCouponId.forEach((item) => {
    const {
      redemptions_and_assignments: redemptionsAssignments,
      coupon_id: couponId,
      coupon_name: couponName,
    } = item;
    const isRedemptionsAssignmentsArray = Array.isArray(redemptionsAssignments);
    const hasRedemptionsAssignments = (
      isRedemptionsAssignmentsArray && redemptionsAssignments.length > 0
    );
    const data = {
      couponId,
      couponName,
    };
    if (hasRedemptionsAssignments) {
      redemptionsAssignments.forEach(({
        course_title: courseTitle,
        redeemed_date: redemptionDate,
        code,
      }) => {
        const getFormattedDate = (date) => {
          if (!date) {
            return null;
          }
          return moment(date).format('MMMM D, YYYY');
        };
        flat.push({
          ...data,
          courseTitle,
          redemptionDate: getFormattedDate(redemptionDate),
          code,
          isRedeemed: !!redemptionDate,
        });
      });
    }
  });
  return flat;
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
      couponId,
      courseTitle,
      redemptionDate,
      code,
      couponName,
    }) => ({
      couponId,
      couponName,
      code,
      isRedeemed: isRedeemed ? (
        <Icon className="fa fa-check text-primary" screenReaderText="has been redeemed" />
      ) : defaultEmptyValue,
      courseTitle: courseTitle || defaultEmptyValue,
      redemptionDate: redemptionDate || defaultEmptyValue,
      actions: !isRedeemed ? (
        <React.Fragment>
          <RemindButton
            couponId={couponId}
            couponTitle={couponName}
            data={{
              email: searchQuery,
              code,
            }}
            onSuccess={onRemindSuccess}
          />
          {' | '}
          <RevokeButton
            couponId={couponId}
            couponTitle={couponName}
            data={{
              assigned_to: searchQuery,
              code,
            }}
            onSuccess={onRevokeSuccess}
          />
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
        user_email: searchQuery,
        page: queryParams.page && parseInt(queryParams.page, 10),
      })}
      columns={tableColumns}
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
