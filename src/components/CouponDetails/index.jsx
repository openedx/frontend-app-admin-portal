import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Button, CheckBox, Icon, InputSelect } from '@edx/paragon';

import TableContainer from '../../containers/TableContainer';
import DownloadCsvButton from '../../containers/DownloadCsvButton';
import CodeAssignmentModal from '../../containers/CodeAssignmentModal';
import CodeReminderModal from '../../containers/CodeReminderModal';
import CodeRevokeModal from '../../containers/CodeRevokeModal';
import H3 from '../H3';
import StatusAlert from '../StatusAlert';

import { SINGLE_USE, ONCE_PER_CUSTOMER } from '../../data/constants/coupons';
import EcommerceApiService from '../../data/services/EcommerceApiService';

import './CouponDetails.scss';

class CouponDetails extends React.Component {
  constructor(props) {
    super(props);

    this.bulkActionSelectRef = React.createRef();
    this.selectAllCheckBoxRef = React.createRef();

    this.state = {
      selectedToggle: 'unassigned',
      tableColumns: [
        {
          label: (
            <CheckBox
              onChange={checked => this.handleSelectAllCodes(checked)}
              ref={this.selectAllCheckBoxRef}
            />
          ),
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
        remind: null,
      },
      isCodeAssignmentSuccessful: undefined,
      isCodeReminderSuccessful: undefined,
      isCodeRevokeSuccessful: undefined,
      doesCodeActionHaveErrors: undefined,
      selectedCodes: [],
      hasAllCodesSelected: false,
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

    this.formatCouponData = this.formatCouponData.bind(this);
    this.handleToggleSelect = this.handleToggleSelect.bind(this);
    this.handleBulkActionSelect = this.handleBulkActionSelect.bind(this);
    this.resetModals = this.resetModals.bind(this);
    this.handleCodeActionSuccess = this.handleCodeActionSuccess.bind(this);
    this.resetCodeActionStatus = this.resetCodeActionStatus.bind(this);
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

  getTableFilterSelectOptions() {
    const { couponData: { usage_limitation: usageLimitation } } = this.props;
    const shouldHidePartialRedeem = [SINGLE_USE, ONCE_PER_CUSTOMER].includes(usageLimitation);

    let options = [{
      label: 'Unassigned',
      value: 'unassigned',
    }, {
      label: 'Unredeemed',
      value: 'unredeemed',
    }, {
      label: 'Partially Redeemed',
      value: 'partially-redeemed',
    }, {
      label: 'Redeemed',
      value: 'redeemed',
    }];

    if (shouldHidePartialRedeem) {
      options = options.filter(option => option.value !== 'partially-redeemed');
    }

    return options;
  }

  getBulkActionSelectOptions() {
    const { selectedToggle, selectedCodes } = this.state;
    const {
      couponData: { num_unassigned: unassignedCodes },
      couponDetailsTable: { data: tableData },
    } = this.props;

    const isAssignView = selectedToggle === 'unassigned';
    const isRedeemedView = selectedToggle === 'redeemed';
    const hasTableData = tableData && tableData.count;

    return [{
      label: 'Assign',
      value: 'assign',
      disabled: !isAssignView || isRedeemedView || !hasTableData || unassignedCodes === 0,
    }, {
      label: 'Remind',
      value: 'remind',
      disabled: isAssignView || isRedeemedView || !hasTableData,
    }, {
      label: 'Revoke',
      value: 'revoke',
      disabled: isAssignView || isRedeemedView || !hasTableData || selectedCodes.length === 0,
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
    const { couponData: { id, title: couponTitle } } = this.props;
    const {
      assigned_to: assignedTo,
      redemptions,
    } = code;

    const buttonClassNames = ['btn-link', 'btn-sm', 'px-0'];

    // Don't show a button if all total redemptions have been used
    if (redemptions.used === redemptions.total) {
      return null;
    }

    if (assignedTo) {
      return (
        <React.Fragment>
          <Button
            className={[...buttonClassNames, 'remind-btn']}
            label="Remind"
            onClick={() => this.setModalState({
              key: 'remind',
              options: {
                couponId: id,
                title: couponTitle,
                data: {
                  code: code.code,
                  email: code.assigned_to,
                },
              },
            })}
          />
           |
          <Button
            className={[...buttonClassNames, 'revoke-btn']}
            label="Revoke"
            onClick={() => this.setModalState({
              key: 'revoke',
              options: {
                couponId: id,
                title: couponTitle,
                data: {
                  code: code.code,
                  assigned_to: code.assigned_to,
                },
              },
            })}
          />
        </React.Fragment>
      );
    }

    return (
      <Button
        className={[...buttonClassNames, 'assignment-btn']}
        label="Assign"
        onClick={() => this.setModalState({
          key: 'assignment',
          options: {
            couponId: id,
            title: couponTitle,
            data: {
              code,
              remainingUses: redemptions.total - redemptions.used,
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
    this.resetCodeActionStatus();

    this.setState({
      selectedCodes: [],
      hasAllCodesSelected: false,
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
    const {
      couponData: {
        id,
        title: couponTitle,
        num_unassigned: unassignedCodes,
      },
    } = this.props;
    const { hasAllCodesSelected, selectedCodes, selectedToggle } = this.state;

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
            selectedCodes: hasAllCodesSelected ? [] : selectedCodes,
            hasAllCodesSelected,
          },
        },
      });
    } else if (selectedBulkAction === 'revoke') {
      this.setModalState({
        key: 'revoke',
        options: {
          couponId: id,
          title: couponTitle,
          isBulkRevoke: true,
          data: {
            selectedCodes,
          },
        },
      });
    } else if (selectedBulkAction === 'remind') {
      this.setModalState({
        key: 'remind',
        options: {
          couponId: id,
          title: couponTitle,
          isBulkRemind: true,
          selectedToggle,
          data: {
            selectedCodes,
          },
        },
      });
    }
  }

  resetModals() {
    this.setState({
      modals: {
        assignment: null,
        revoke: null,
        remind: null,
      },
    });
  }

  shouldShowSelectAllStatusAlert() {
    const { couponDetailsTable: { data: tableData } } = this.props;
    const { selectedToggle, selectedCodes, hasAllCodesSelected } = this.state;

    if (!tableData || selectedToggle !== 'unassigned') {
      return false;
    } else if (hasAllCodesSelected) {
      return true;
    }

    return (
      selectedCodes.length === tableData.results.length &&
      selectedCodes.length !== tableData.count
    );
  }

  hasStatusAlert() {
    // The following are the scenarios where a status alert will be shown. Note, the coupon
    // details table must be finished loading for status alert to show:
    //  - Coupon has an error
    //  - Code assignment/remind/revoke status (error or success)
    //  - Code selection status (e.g., "50 codes selected. Select all 65 codes?")

    const {
      couponData: { has_error: hasError },
      couponOverviewError,
    } = this.props;
    const {
      isCodeAssignmentSuccessful,
      isCodeReminderSuccessful,
      isCodeRevokeSuccessful,
      doesCodeActionHaveErrors,
    } = this.state;

    const hasStatusAlert = [
      hasError,
      couponOverviewError,
      isCodeAssignmentSuccessful,
      isCodeReminderSuccessful,
      isCodeRevokeSuccessful,
      doesCodeActionHaveErrors,
      this.shouldShowSelectAllStatusAlert(),
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

    this.resetCodeActionStatus();

    this.setState({
      tableColumns,
      selectedToggle: value,
      selectedCodes: [],
      hasAllCodesSelected: false,
    }, () => {
      this.updateSelectAllCheckBox();
    });
  }

  updateSelectAllCheckBox() {
    const { selectedCodes, tableColumns } = this.state;
    const { couponDetailsTable: { data: tableData } } = this.props;

    const allCodesForPageSelected = (
      tableData && tableData.results && tableData.results.length !== 0 &&
      selectedCodes.length === tableData.results.length
    );
    const hasPartialSelection = selectedCodes.length > 0 && !allCodesForPageSelected;

    const selectColumn = tableColumns.shift();

    selectColumn.label = React.cloneElement(selectColumn.label, {
      checked: allCodesForPageSelected,
      className: hasPartialSelection ? ['mixed'] : [],
    });

    // The Paragon `CheckBox` component does not currently support the mixed state. To
    // get around this, we get the DOM node of the checkbox and replace the `aria-checked`
    // attribute appropriately.
    //
    // TODO: We may want to update Paragon `CheckBox` component to handle mixed state.
    const selectAllCheckBoxRef = selectColumn.label.ref && selectColumn.label.ref.current;
    const selectAllCheckBoxDOM = (
      selectAllCheckBoxRef && document.getElementById(selectAllCheckBoxRef.state.id)
    );

    if (selectAllCheckBoxDOM && hasPartialSelection) {
      selectAllCheckBoxDOM.setAttribute('aria-checked', 'mixed');
    } else if (selectAllCheckBoxDOM && !hasPartialSelection) {
      selectAllCheckBoxDOM.setAttribute('aria-checked', allCodesForPageSelected);
    }

    this.setState({
      tableColumns: [selectColumn, ...tableColumns],
    });
  }

  updateCouponOverviewData() {
    const { couponData: { id } } = this.props;
    this.props.fetchCouponOrder(id);
  }

  handleCodeActionSuccess(action, response) {
    let stateKey;
    let doesCodeActionHaveErrors;

    switch (action) {
      case 'assign': {
        stateKey = 'isCodeAssignmentSuccessful';
        break;
      }
      case 'revoke': {
        stateKey = 'isCodeRevokeSuccessful';
        doesCodeActionHaveErrors = response && response.some && response.some(item => item.detail === 'failure');
        break;
      }
      case 'remind': {
        stateKey = 'isCodeReminderSuccessful';
        doesCodeActionHaveErrors = response && response.some && response.some(item => item.detail === 'failure');
        break;
      }
      default: {
        stateKey = null;
        doesCodeActionHaveErrors = null;
        break;
      }
    }

    if (action === 'assign' || action === 'revoke') {
      this.updateCouponOverviewData();
    }

    this.resetCodeActionStatus();

    if (stateKey) {
      this.setState({
        [stateKey]: true,
        refreshIndex: this.state.refreshIndex + 1, // force new table instance
        selectedCodes: [],
        doesCodeActionHaveErrors,
      }, () => {
        this.updateSelectAllCheckBox();
      });
    }
  }

  handleCodeSelection({ checked, code }) {
    let { selectedCodes, hasAllCodesSelected } = this.state;

    if (checked) {
      // Add code to selected codes array
      selectedCodes = [...selectedCodes, code];
    } else {
      // Remove code from selected codes array
      selectedCodes = selectedCodes.filter(selectedCode => selectedCode !== code);
      hasAllCodesSelected = false;
    }

    this.setState({
      selectedCodes,
      hasAllCodesSelected,
    }, () => {
      this.updateSelectAllCheckBox();
    });
  }

  handleSelectAllCodes(checked) {
    const { couponDetailsTable: { data: tableData } } = this.props;
    let { hasAllCodesSelected, selectedCodes } = this.state;

    if (checked) {
      selectedCodes = tableData.results;
    } else {
      selectedCodes = [];
      hasAllCodesSelected = false;
    }

    this.setState({
      selectedCodes,
      hasAllCodesSelected,
    }, () => {
      this.updateSelectAllCheckBox();
    });
  }

  formatCouponData(data) {
    const { selectedCodes } = this.state;

    return data.map(code => ({
      ...code,
      assigned_to: code.error ? (
        <span className="text-danger">
          <Icon className={['fa', 'fa-exclamation-circle', 'mr-2']} screenReaderText="Error" />
          {code.error}
        </span>
      ) : code.assigned_to,
      redemptions: `${code.redemptions.used} of ${code.redemptions.total}`,
      actions: this.getActionButton(code),
      select: (
        <CheckBox
          onChange={checked => this.handleCodeSelection({ checked, code })}
          checked={selectedCodes.find(selectedCode => selectedCode === code)}
        />
      ),
    }));
  }

  resetCodeActionStatus() {
    this.setState({
      isCodeAssignmentSuccessful: undefined,
      isCodeReminderSuccessful: undefined,
      isCodeRevokeSuccessful: undefined,
      doesCodeActionHaveErrors: undefined,
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
    const { hasError, couponOverviewError } = this.props;

    return (
      <StatusAlert
        alertType="success"
        className={[classNames({ 'mt-2': hasError || couponOverviewError })]}
        iconClassNames={['fa', 'fa-check']}
        title={title}
        message={message}
        onClose={this.resetCodeActionStatus}
        dismissible
      />
    );
  }

  renderInfoMessage({ title, message }) {
    const { hasError, couponOverviewError } = this.props;

    return (
      <StatusAlert
        alertType="info"
        className={[classNames({ 'mt-2': hasError || couponOverviewError })]}
        title={title}
        message={message}
      />
    );
  }

  render() {
    const {
      selectedToggle,
      selectedCodes,
      tableColumns,
      modals,
      isCodeAssignmentSuccessful,
      isCodeReminderSuccessful,
      isCodeRevokeSuccessful,
      doesCodeActionHaveErrors,
      refreshIndex,
      hasAllCodesSelected,
    } = this.state;

    const {
      couponData: { id, has_error: hasError },
      couponDetailsTable: { data: tableData },
      couponOverviewLoading,
      couponOverviewError,
      isExpanded,
    } = this.props;

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
                    fetchMethod={() => EcommerceApiService.fetchCouponDetails(
                      id,
                      { code_filter: selectedToggle },
                      { csv: true },
                    )}
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
                    options={this.getTableFilterSelectOptions()}
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
                    options={this.getBulkActionSelectOptions()}
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
                    {couponOverviewError && !couponOverviewLoading && this.renderErrorMessage({
                      message: (
                        <React.Fragment>
                          Failed to fetch coupon overview data ({couponOverviewError.message}).
                          <Button
                            className={['p-0', 'pl-1', 'border-0']}
                            buttonType="link"
                            label="Please try again"
                            onClick={() => this.props.fetchCouponOrder(id)}
                          />.
                        </React.Fragment>
                      ),
                    })}
                    {isCodeAssignmentSuccessful && this.renderSuccessMessage({
                      title: 'Successfully assigned code(s)',
                      message: (
                        <React.Fragment>
                          To view the newly assigned code(s), filter by
                          <Button
                            className={['p-0', 'pl-1', 'border-0']}
                            buttonType="link"
                            label="unredeemed codes"
                            onClick={() => {
                              this.setState({
                                selectedToggle: 'unredeemed',
                              }, () => {
                                this.handleToggleSelect();
                              });
                            }}
                          />.
                        </React.Fragment>
                      ),
                    })}
                    {isCodeReminderSuccessful && this.renderSuccessMessage({
                      message: 'Reminder request processed.',
                    })}
                    {isCodeRevokeSuccessful && this.renderSuccessMessage({
                      message: 'Successfully revoked code(s)',
                    })}
                    {doesCodeActionHaveErrors && this.renderErrorMessage({
                      title: 'An unexpected error has occurred. Please try again or contact your Customer Success Manager.',
                      message: '',
                    })}
                    {this.shouldShowSelectAllStatusAlert() && this.renderInfoMessage({
                      message: (
                        <React.Fragment>
                          {hasAllCodesSelected ? `All ${tableData.count} codes are selected.` : `${selectedCodes.length} codes are selected.`}
                          {!hasAllCodesSelected && (
                            <Button
                              className={['p-0', 'pl-1', 'border-0']}
                              buttonType="link"
                              label={`Select all ${tableData.count} codes?`}
                              onClick={() => this.setState({
                                hasAllCodesSelected: true,
                              })}
                            />
                          )}
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
                  onSuccess={response => this.handleCodeActionSuccess('assign', response)}
                />
              }
              {modals.revoke &&
                <CodeRevokeModal
                  {...modals.revoke}
                  onClose={this.resetModals}
                  onSuccess={response => this.handleCodeActionSuccess('revoke', response)}
                />
              }
              {modals.remind &&
                <CodeReminderModal
                  {...modals.remind}
                  onClose={this.resetModals}
                  onSuccess={response => this.handleCodeActionSuccess('remind', response)}
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
  couponDetailsTable: {},
};

CouponDetails.propTypes = {
  // props from container
  couponDetailsTable: PropTypes.shape({}),

  // custom props
  couponData: PropTypes.shape({
    id: PropTypes.number.isRequired,
    has_error: PropTypes.bool.isRequired,
    num_unassigned: PropTypes.number.isRequired,
    usage_limitation: PropTypes.string.isRequired,
  }).isRequired,
  isExpanded: PropTypes.bool,
};

export default CouponDetails;
