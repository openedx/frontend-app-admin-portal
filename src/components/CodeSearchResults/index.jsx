import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  Button,
  Icon,
  TransitionReplace,
} from '@edx/paragon';

import EcommerceApiService from '../../data/services/EcommerceApiService';
import { isValidEmail } from '../../utils';

import TableContainer from '../../containers/TableContainer';
import StatusAlert from '../StatusAlert';
import RemindButton from '../RemindButton';
import RevokeButton from '../RevokeButton';

import './CodeSearchResults.scss';

class CodeSearchResults extends React.Component {
  constructor(props) {
    super(props);
    this.tableColumns = [
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
    this.state = {
      isCodeReminderSuccessful: false,
      isCodeRevokeSuccessful: false,
    };
  }

  componentDidUpdate(prevProps) {
    const { searchQuery, isOpen } = this.props;
    if (isOpen && searchQuery !== prevProps.searchQuery) {
      this.resetCodeActionMessages();
    }
  }

  resetCodeActionMessages = () => {
    this.setState({
      isCodeReminderSuccessful: false,
      isCodeRevokeSuccessful: false,
    });
  };

  /**
   * The search API response contains a record for each coupon batch a
   * user is associated with (i.e., has unused assignments, or actual
   * redemptions). Under each coupon batch is an array of assignments and
   * redemptiions, that contains all the metadata associated with a redemption,
   * if applicable. Because we want the search results UI to show a row
   * for each unused assignment and all redeemed courses associated with a
   * particular user, this function flattens the search results by creating
   * a new table row for each value in `redemptions_and_assignments`.
   */
  transformSearchResults = (items) => {
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

  formatSearchResultsData = (results) => {
    const { searchQuery } = this.props;
    const transformedSearchResults = this.transformSearchResults(results);
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
            onSuccess={this.handleRemindOnSuccess}
          />
          {' | '}
          <RevokeButton
            couponId={couponId}
            couponTitle={couponName}
            data={{
              assigned_to: searchQuery,
              code,
            }}
            onSuccess={this.handleRevokeOnSuccess}
          />
        </React.Fragment>
      ) : defaultEmptyValue,
    }));
  };

  handleRemindOnSuccess = () => {
    this.setState({
      isCodeReminderSuccessful: true,
    });
  };

  handleRevokeOnSuccess = () => {
    this.setState({
      isCodeRevokeSuccessful: true,
    });
  };

  isValidSearchQuery = () => {
    const { searchQuery } = this.props;
    return isValidEmail(searchQuery) === undefined;
  };

  renderHeading = () => {
    const { searchQuery, onClose } = this.props;
    return (
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="flex-grow-1 text-truncate mr-3">
          <h3 className="lead m-0 text-truncate">
            Search results for <em>&quot;{searchQuery}&quot;</em>
          </h3>
        </div>
        <div className="flex-grow-0 flex-shrink-0">
          <Button
            className="close-search-results-btn btn-outline-primary"
            onClick={onClose}
          >
            <Icon className="fa fa-times mr-2" />
              Close search results
          </Button>
        </div>
      </div>
    );
  };

  renderTable = () => {
    const { searchQuery } = this.props;
    return (
      <TableContainer
        key={`code-search-results-${searchQuery}`}
        id="code-search-results"
        className="code-search-results-table"
        fetchMethod={() => EcommerceApiService.fetchCodeSearchResults({
          user_email: searchQuery,
        })}
        columns={this.tableColumns}
        formatData={this.formatSearchResultsData}
      />
    );
  };

  renderSuccessMessage = options => (
    <StatusAlert
      alertType="success"
      iconClassName="fa fa-check"
      onClose={this.resetCodeActionMessages}
      dismissible
      {...options}
    />
  );

  renderErrorMessage = options => (
    <StatusAlert
      alertType="danger"
      iconClassName="fa fa-exclamation-circle"
      {...options}
    />
  );

  render() {
    const { isOpen, searchQuery } = this.props;
    const { isCodeReminderSuccessful, isCodeRevokeSuccessful } = this.state;
    const isValidSearchQuery = this.isValidSearchQuery();
    return (
      <TransitionReplace>
        {isOpen ? (
          <div key="code-search-results" className="code-search-results border-bottom pb-4">
            <React.Fragment>
              {this.renderHeading()}
              {isValidSearchQuery ? (
                <React.Fragment>
                  {isCodeReminderSuccessful && this.renderSuccessMessage({
                    message: `A reminder was successfully sent to ${searchQuery}.`,
                  })}
                  {isCodeRevokeSuccessful && this.renderSuccessMessage({
                    message: 'Successfully revoked code(s)',
                  })}
                  {this.renderTable()}
                </React.Fragment>
              ) : (
                <React.Fragment>
                  {this.renderErrorMessage({
                    message: 'Please enter a valid email address in your search.',
                  })}
                </React.Fragment>
              )}
            </React.Fragment>
          </div>
        ) : null}
      </TransitionReplace>
    );
  }
}

CodeSearchResults.propTypes = {
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool,
  searchQuery: PropTypes.string,
};

CodeSearchResults.defaultProps = {
  isOpen: false,
  searchQuery: null,
};

export default CodeSearchResults;
