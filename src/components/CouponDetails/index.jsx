import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Button, CheckBox, Icon, InputSelect } from '@edx/paragon';

import H3 from '../H3';

import TableContainer from '../../containers/TableContainer';
import DownloadCsvButton from '../../containers/DownloadCsvButton';
import StatusAlert from '../StatusAlert';

import EcommerceApiService from '../../data/services/EcommerceApiService';

import './CouponDetails.scss';

class CouponDetails extends React.Component {
  constructor(props) {
    super(props);

    this.defaultToggle = 'not-assigned';

    this.state = {
      selectedToggle: this.defaultToggle,
      tableColumns: [
        {
          label: <CheckBox />,
          key: 'select',
        },
        {
          label: 'Redemptions',
          key: 'redemptions',
        },
        {
          label: 'Code',
          key: 'title',
        },
        {
          label: 'Actions',
          key: 'actions',
        },
      ],
    };

    this.toggleSelectRef = React.createRef();

    this.formatCouponData = this.formatCouponData.bind(this);
    this.handleToggleSelect = this.handleToggleSelect.bind(this);
  }

  getActionButton(code) {
    const { assigned_to: assignedTo, redemptions } = code;

    if (redemptions.used === redemptions.available) {
      return null;
    }

    const button = {
      label: 'Assign',
      onClick: () => {},
    };

    if (assignedTo) {
      button.label = 'Revoke';
      button.onClick = () => {};
    }

    return (
      <Button
        className={['btn-link', 'btn-sm', 'pl-0']}
        label={button.label}
        onClick={button.onClick}
      />
    );
  }

  isTableLoading() {
    const { couponDetailsTable } = this.props;
    return couponDetailsTable && couponDetailsTable.loading;
  }

  hasStatusAlert() {
    // The following are the scenarios where a status alert will be shown. Note, the coupon
    // details table must be finished loading for status alert to show:
    //  - Coupon has an error
    //  - Code selection status (e.g., "8 codes selected"). Note that the selection logic is not
    //      currently implemented, but the logic for when the code selection alert is displayed
    //      should go here as well.

    const { hasError } = this.props;
    return !this.isTableLoading() && [hasError].some(item => item);
  }

  handleToggleSelect() {
    const { tableColumns } = this.state;
    const ref = this.toggleSelectRef && this.toggleSelectRef.current;
    const selectedToggle = ref && ref.state.value;
    const assignedToColumnIndex = tableColumns.findIndex(column => column.key === 'assigned_to');

    if (selectedToggle !== this.defaultToggle && assignedToColumnIndex === -1) {
      // Add assigned_to column if it doesn't already exist and
      // the toggle is something other than "Not Assigned".
      tableColumns.splice(1, 0, {
        label: 'Assigned To',
        key: 'assigned_to',
      });
    } else if (selectedToggle === this.defaultToggle && assignedToColumnIndex > -1) {
      // Remove assigned_to column if it already exists and the toggle is "Not Assigned".
      tableColumns.splice(assignedToColumnIndex, 1);
    }

    if (selectedToggle) {
      this.setState({
        selectedToggle,
        tableColumns,
      });
    }
  }

  formatCouponData(data) {
    return data.map(code => ({
      ...code,
      assigned_to: code.error ? (
        <span className="text-danger">
          <Icon className={['fa', 'fa-exclamation-circle', 'mr-2']} screenReaderText="Error" />
          {code.error}
        </span>
      ) : code.assigned_to,
      redemptions: `${code.redemptions.used} of ${code.redemptions.available}`,
      actions: this.getActionButton(code),
      select: <CheckBox />,
    }));
  }

  renderErrorMessage() {
    return (
      <StatusAlert
        alertType="danger"
        iconClassNames={['fa', 'fa-times-circle']}
        message="One or more codes below have an error."
      />
    );
  }

  render() {
    const { selectedToggle, tableColumns } = this.state;
    const { id, hasError, isExpanded } = this.props;

    return (
      <div
        id={`coupon-details-${id}`}
        className={classNames([
          'coupon-details row no-gutters px-2 my-3',
          {
            'd-none': !isExpanded,
          },
        ])}
      >
        <div className="col">
          {isExpanded &&
            <React.Fragment>
              <div className="details-header row no-gutters mb-3">
                <div className="col-12 col-md-6 mb-2 mb-md-0">
                  <H3>Coupon Details</H3>
                </div>
                <div className="col-12 col-md-6 mb-2 mb-md-0 text-md-right">
                  <DownloadCsvButton
                    id="coupon-details"
                    fetchMethod={() => EcommerceApiService.fetchCouponDetails(id, {}, {
                      csv: true,
                    })}
                    disabled={this.isTableLoading()}
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="toggles col-12 col-md-8">
                  <div className="row">
                    <div className="col">
                      <InputSelect
                        ref={this.toggleSelectRef}
                        className={['mt-1']}
                        name="table-view"
                        label="Table View:"
                        value={selectedToggle}
                        options={[
                          { label: 'Not Assigned', value: 'not-assigned' },
                          { label: 'Not Redeemed', value: 'not-redeemed' },
                        ]}
                        disabled={this.isTableLoading()}
                      />
                      <Button
                        className={['ml-2']}
                        buttonType="primary"
                        label="Go"
                        onClick={this.handleToggleSelect}
                        disabled={this.isTableLoading()}
                      />
                    </div>
                  </div>
                </div>
                <div className="bulk-actions col-12 col-md-4 text-md-right mt-3 m-md-0">
                  <InputSelect
                    className={['mt-1']}
                    name="bulk-action"
                    label="Bulk Action:"
                    value="assign"
                    options={[
                      { label: 'Assign', value: 'assign' },
                      { label: 'Remind', value: 'remind' },
                      { label: 'Revoke', value: 'revoke' },
                    ]}
                    disabled={this.isTableLoading()}
                  />
                  <Button
                    className={['ml-2']}
                    buttonType="primary"
                    label="Go"
                    onClick={() => {}}
                    disabled={this.isTableLoading()}
                  />
                </div>
              </div>
              {this.hasStatusAlert() &&
                <div className="row mb-3">
                  <div className="col">
                    {hasError && this.renderErrorMessage()}
                  </div>
                </div>
              }
              <TableContainer
                id="coupon-details"
                className="coupon-details-table"
                fetchMethod={() => EcommerceApiService.fetchCouponDetails(id)}
                columns={tableColumns}
                formatData={this.formatCouponData}
              />
            </React.Fragment>
          }
        </div>
      </div>
    );
  }
}

CouponDetails.defaultProps = {
  isExpanded: false,
  hasError: false,
  couponDetailsTable: {},
};

CouponDetails.propTypes = {
  id: PropTypes.number.isRequired,
  isExpanded: PropTypes.bool,
  hasError: PropTypes.bool,
  couponDetailsTable: PropTypes.shape({}),
};

export default CouponDetails;
