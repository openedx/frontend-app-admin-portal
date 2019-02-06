import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Button, CheckBox, Icon, InputSelect } from '@edx/paragon';

import H3 from '../H3';

import TableContainer from '../../containers/TableContainer';
import DownloadCsvButton from '../../containers/DownloadCsvButton';
import CodeAssignmentModal from '../../containers/CodeAssignmentModal';
import StatusAlert from '../StatusAlert';

import EcommerceApiService from '../../data/services/EcommerceApiService';

import './CouponDetails.scss';

class CouponDetails extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedToggle: 'unassigned',
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
          key: 'code',
        },
        {
          label: 'Actions',
          key: 'actions',
        },
      ],
      modals: {
        assignment: null,
        revoke: null,
      },
      isCodeAssignmentSuccessful: undefined,
      selectedCodes: [],
      /**
        * In some scenarios, we want to create a new instance of the table so that it recreates
        * checkboxes (clearing their states), refetches the data, and adjusts table columns
        * appropriately. The `refreshIndex` can be used as a quick and easy way to create a new
        * table instance simply by changing it's value (e.g., incrementing). In combination with
        * the `selectedToggle` state, a new table instance is created whenever the `selectedToggle`
        * or `refreshIndex` state changes by altering the table's `key` prop.
        */
      refreshIndex: 0,
    };

    this.bulkActionSelectRef = React.createRef();

    this.formatCouponData = this.formatCouponData.bind(this);
    this.handleToggleSelect = this.handleToggleSelect.bind(this);
    this.handleBulkActionSelect = this.handleBulkActionSelect.bind(this);
    this.resetModals = this.resetModals.bind(this);
    this.handleAssignmentSuccess = this.handleAssignmentSuccess.bind(this);
    this.resetCodeAssignmentStatus = this.resetCodeAssignmentStatus.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { isExpanded } = this.props;

    if (isExpanded && isExpanded !== prevProps.isExpanded) {
      // On expand, ensure the table view reflects the selected toggle
      this.handleToggleSelect();
    }

    if (!isExpanded && isExpanded !== prevProps.isExpanded) {
      // On collapse, reset to default states
      this.reset();
    }
  }

  getBulkActionSelectOptions() {
    const { selectedToggle } = this.state;

    const isAssignView = selectedToggle === 'unassigned';
    const isRedeemedView = selectedToggle === 'redeemed';

    return [{
      label: 'Assign',
      value: 'assign',
      disabled: !isAssignView || isRedeemedView,
    }, {
      label: 'Remind',
      value: 'remind',
      disabled: isAssignView || isRedeemedView,
    }, {
      label: 'Revoke',
      value: 'revoke',
      disabled: isAssignView || isRedeemedView,
    }];
  }

  getBulkActionSelectValue() {
    const bulkActionSelectOptions = this.getBulkActionSelectOptions();
    const firstNonDisabledOption = bulkActionSelectOptions.find(option => !option.disabled);

    if (firstNonDisabledOption) {
      return firstNonDisabledOption.value;
    }

    return bulkActionSelectOptions[0].value;
  }

  getActionButton(code) {
    const { couponTitle, id } = this.props;
    const {
      assigned_to: assignedTo,
      redemptions,
    } = code;

    const buttonClassNames = ['btn-link', 'btn-sm', 'px-0'];

    // Don't show a button if all available redemptions have been used
    if (redemptions.used === redemptions.available) {
      return null;
    }

    if (assignedTo) {
      return (
        <Button
          className={buttonClassNames}
          label="Revoke"
          onClick={() => this.setModalState({
            key: 'revoke',
            options: {
              title: couponTitle,
              data: { /* pass along any data the revoke modal might need */ },
            },
          })}
        />
      );
    }

    return (
      <Button
        className={buttonClassNames}
        label="Assign"
        onClick={() => this.setModalState({
          key: 'assignment',
          options: {
            couponId: id,
            title: couponTitle,
            data: {
              code: code.code,
              remainingUses: redemptions.available - redemptions.used,
            },
          },
        })}
      />
    );
  }

  setModalState({ key, options }) {
    this.setState({
      modals: {
        ...this.state.modals,
        [key]: options,
      },
    });
  }

  reset() {
    this.resetModals();
    this.resetCodeAssignmentStatus();

    this.setState({
      selectedCodes: [],
      refreshIndex: 0,
    });
  }

  isTableLoading() {
    const { couponDetailsTable } = this.props;
    return couponDetailsTable && couponDetailsTable.loading;
  }

  isBulkAssignSelectDisabled() {
    const options = this.getBulkActionSelectOptions();

    return this.isTableLoading() || options.every(option => option.disabled);
  }

  handleBulkActionSelect() {
    const { couponTitle, id, unassignedCodes } = this.props;
    const ref = this.bulkActionSelectRef && this.bulkActionSelectRef.current;
    const selectedBulkAction = ref && ref.state.value;

    if (selectedBulkAction === 'assign') {
      this.setModalState({
        key: 'assignment',
        options: {
          couponId: id,
          title: couponTitle,
          isBulkAssign: true,
          data: {
            unassignedCodes,
            selectedCodes: this.state.selectedCodes,
          },
        },
      });
    } else if (selectedBulkAction === 'revoke') {
      this.setModalState({
        key: 'revoke',
        options: {
          title: couponTitle,
          data: { /* pass along any data the revoke modal might need */ },
        },
      });
    }
  }

  resetModals() {
    this.setState({
      modals: {
        assignment: null,
        revoke: null,
      },
    });
  }

  hasStatusAlert() {
    // The following are the scenarios where a status alert will be shown. Note, the coupon
    // details table must be finished loading for status alert to show:
    //  - Coupon has an error
    //  - Code assignment status (error or success)
    //  - Code selection status (e.g., "8 codes selected"). Note that the selection logic is not
    //      currently implemented, but the logic for when the code selection alert is displayed
    //      should go here as well.

    const { hasError } = this.props;
    const { isCodeAssignmentSuccessful } = this.state;

    const hasStatusAlert = [
      hasError,
      isCodeAssignmentSuccessful,
    ].some(item => item);

    return !this.isTableLoading() && hasStatusAlert;
  }

  handleToggleSelect(newValue) {
    const { tableColumns, selectedToggle } = this.state;

    const value = newValue || selectedToggle;
    const assignedToColumnLabel = value === 'unredeemed' ? 'Assigned To' : 'Redeemed By';

    const getColumnIndexForKey = key => tableColumns.findIndex(column => column.key === key);

    // `assigned_to` column
    if (value !== 'unassigned' && getColumnIndexForKey('assigned_to') === -1) {
      // Add `assigned_to` column if it doesn't already exist
      tableColumns.splice(1, 0, {
        label: assignedToColumnLabel,
        key: 'assigned_to',
      });
    } else if (value !== 'unassigned' && getColumnIndexForKey('assigned_to') > -1) {
      // Update `assigned_to` column with the appropriate label
      tableColumns[1].label = assignedToColumnLabel;
    } else if (value === 'unassigned' && getColumnIndexForKey('assigned_to') > -1) {
      // Remove `assigned_to` column if it already exists
      tableColumns.splice(getColumnIndexForKey('assigned_to'), 1);
    }

    // `actions` column
    if (value !== 'redeemed' && getColumnIndexForKey('actions') === -1) {
      // Add `actions` column if it doesn't already exist
      tableColumns.splice(tableColumns.length, 0, {
        label: 'Actions',
        key: 'actions',
      });
    } else if (value === 'redeemed' && getColumnIndexForKey('actions') > -1) {
      // Remove `actions` column if it already exists
      tableColumns.splice(getColumnIndexForKey('actions'), 1);
    }

    this.setState({
      tableColumns,
      selectedToggle: value,
      selectedCodes: [],
    });
  }

  handleAssignmentSuccess() {
    this.setState({
      isCodeAssignmentSuccessful: true,
      refreshIndex: this.state.refreshIndex + 1, // force new table instance
      selectedCodes: [],
    });
  }

  handleCodeSelection({ checked, code }) {
    const { selectedCodes } = this.state;

    if (checked) {
      // Add code to selected codes array
      this.setState({
        selectedCodes: [...selectedCodes, code.code],
      });
    } else {
      // Remove code from selected codes array
      this.setState({
        selectedCodes: selectedCodes.filter(codeTitle => codeTitle !== code.code),
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
      select: <CheckBox onChange={checked => this.handleCodeSelection({ checked, code })} />,
    }));
  }

  resetCodeAssignmentStatus() {
    this.setState({
      isCodeAssignmentSuccessful: undefined,
    });
  }

  renderErrorMessage({ title, message }) {
    return (
      <StatusAlert
        alertType="danger"
        iconClassNames={['fa', 'fa-times-circle']}
        title={title}
        message={message}
      />
    );
  }

  renderSuccessMessage({ title, message }) {
    const { hasError } = this.props;

    return (
      <StatusAlert
        alertType="success"
        className={[classNames({ 'mt-2': hasError })]}
        iconClassNames={['fa', 'fa-check']}
        title={title}
        message={message}
        onClose={this.resetCodeAssignmentStatus}
        dismissible
      />
    );
  }

  render() {
    const {
      selectedToggle,
      tableColumns,
      modals,
      isCodeAssignmentSuccessful,
      refreshIndex,
    } = this.state;

    const {
      id,
      hasError,
      isExpanded,
    } = this.props;

    const bulkActionSelectOptions = this.getBulkActionSelectOptions();

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
                  <InputSelect
                    className={['mt-1']}
                    name="table-view"
                    label="Filter by Code Status:"
                    value={selectedToggle}
                    options={[
                      { label: 'Unassigned', value: 'unassigned' },
                      { label: 'Unredeemed', value: 'unredeemed' },
                      { label: 'Partially Redeemed', value: 'partially-redeemed' },
                      { label: 'Redeemed', value: 'redeemed' },
                    ]}
                    disabled={this.isTableLoading()}
                    onChange={this.handleToggleSelect}
                  />
                </div>
                <div className="bulk-actions col-12 col-md-4 text-md-right mt-3 m-md-0">
                  <InputSelect
                    ref={this.bulkActionSelectRef}
                    className={['mt-1']}
                    name="bulk-action"
                    label="Bulk Action:"
                    value={this.getBulkActionSelectValue()}
                    options={bulkActionSelectOptions}
                    disabled={this.isBulkAssignSelectDisabled()}
                  />
                  <Button
                    className={['ml-2']}
                    buttonType="primary"
                    label="Go"
                    onClick={this.handleBulkActionSelect}
                    disabled={this.isBulkAssignSelectDisabled()}
                  />
                </div>
              </div>
              {this.hasStatusAlert() &&
                <div className="row mb-3">
                  <div className="col">
                    {hasError && this.renderErrorMessage({
                      message: 'One or more codes below have an error.',
                    })}
                    {isCodeAssignmentSuccessful && this.renderSuccessMessage({
                      title: 'Successfully assigned code(s)',
                      message: (
                        <React.Fragment>
                          To view the newly assigned code(s), filter by
                          <Button
                            className={['filter-unredeemed-btn', 'p-0', 'pl-1', 'border-0']}
                            buttonType="link"
                            label="unredeemed codes"
                            onClick={() => {
                              this.setState({
                                selectedToggle: 'unredeemed',
                              }, () => {
                                this.resetCodeAssignmentStatus();
                                this.handleToggleSelect();
                              });
                            }}
                          />.
                        </React.Fragment>
                      ),
                    })}
                  </div>
                </div>
              }
              <TableContainer
                // Setting a key to force a new instance of the TableContainer
                // when the selected toggle and/or the refresh index changes.
                key={`table-${selectedToggle}-${refreshIndex}`}
                id="coupon-details"
                className="coupon-details-table"
                fetchMethod={options => EcommerceApiService.fetchCouponDetails(id, {
                  ...options,
                  code_filter: selectedToggle,
                })}
                columns={tableColumns}
                formatData={this.formatCouponData}
              />
              {modals.assignment &&
                <CodeAssignmentModal
                  {...modals.assignment}
                  onClose={this.resetModals}
                  onSuccess={this.handleAssignmentSuccess}
                />
              }
              {modals.revoke &&
                // TODO: Add RevokeAssignmentModal
                <CodeAssignmentModal
                  {...modals.revoke}
                  onClose={this.resetModals}
                  onSuccess={() => {}}
                />
              }
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
