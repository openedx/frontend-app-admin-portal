import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  Button, CheckBox, Icon, InputSelect,
} from '@edx/paragon';

import TableContainer from '../../containers/TableContainer';
import DownloadCsvButton from '../../containers/DownloadCsvButton';
import CodeAssignmentModal from '../../containers/CodeAssignmentModal';
import CodeReminderModal from '../../containers/CodeReminderModal';
import CodeRevokeModal from '../../containers/CodeRevokeModal';
import StatusAlert from '../StatusAlert';

import { features } from '../../config';
import EcommerceApiService from '../../data/services/EcommerceApiService';
import { updateUrl } from '../../utils';
import { MODAL_TYPES } from '../EmailTemplateForm/constants';
import { getFilterOptions, getFirstNonDisabledOption, shouldShowSelectAllStatusAlert } from './helpers';
import { VISIBILITY_OPTIONS } from './constants';
import ActionButton from './ActionButton';

class CouponDetails extends React.Component {
  constructor(props) {
    super(props);

    this.bulkActionSelectRef = React.createRef();
    this.selectAllCheckBoxRef = React.createRef();

    this.hasAllTableRowsSelected = false;
    this.selectedTableRows = {};

    const tableColumns = [
      {
        label: (
          <CheckBox
            id="select-all-codes"
            name="select all codes"
            label={
              <div className="sr-only">{this.getSelectAllCheckBoxLabel()}</div>
            }
            onChange={(checked) => {
              this.hasAllTableRowsSelected = checked;
              this.handleSelectAllCodes(checked);
            }}
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
        label: 'Assignments Remaining',
        key: 'assignments_remaining',
      },
      {
        label: 'Actions',
        key: 'actions',
      },
    ];

    if (features.CODE_VISIBILITY) {
      tableColumns.splice(3, 0, {
        label: 'Visibility',
        key: 'is_public',
      });
    }

    this.state = {
      selectedToggle: 'unassigned',
      tableColumns,
      modals: {
        assignment: null,
      },
      isCodeAssignmentSuccessful: undefined,
      isCodeReminderSuccessful: undefined,
      isCodeRevokeSuccessful: undefined,
      isCodeVisibilitySuccessful: undefined,
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
    this.handleVisibilitySelect = this.handleVisibilitySelect.bind(this);
    this.handleBulkActionSelect = this.handleBulkActionSelect.bind(this);
    this.resetModals = this.resetModals.bind(this);
    this.handleCodeActionSuccess = this.handleCodeActionSuccess.bind(this);
    this.resetCodeActionStatus = this.resetCodeActionStatus.bind(this);
    this.setModalState = this.setModalState.bind(this);
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
    return getFilterOptions(usageLimitation);
  }

  getTableFilterVisibilitySelectionOptions() {
    return VISIBILITY_OPTIONS;
  }

  getBulkActionSelectOptions() {
    const { selectedToggle, selectedCodes } = this.state;
    const {
      couponData: { num_unassigned: unassignedCodes, available: couponAvailable },
      couponDetailsTable: { data: tableData },
    } = this.props;

    const isAssignView = selectedToggle === 'unassigned';
    const isRedeemedView = selectedToggle === 'redeemed';
    const hasTableData = tableData && tableData.count;
    const hasPublicCodes = selectedCodes.filter(code => code.is_public).length > 0;

    const bulkActionSelectOptions = [{
      label: 'Assign',
      value: 'assign',
      disabled: hasPublicCodes || !isAssignView || isRedeemedView || !hasTableData || !couponAvailable || unassignedCodes === 0, // eslint-disable-line max-len
    }, {
      label: 'Remind',
      value: 'remind',
      disabled: isAssignView || isRedeemedView || !hasTableData || !couponAvailable,
    }, {
      label: 'Revoke',
      value: 'revoke',
      disabled: isAssignView || isRedeemedView || !hasTableData || !couponAvailable || selectedCodes.length === 0, // eslint-disable-line max-len
    }];

    if (features.CODE_VISIBILITY) {
      bulkActionSelectOptions.push({
        label: 'Make Public',
        value: 'make_public',
        disabled: !hasTableData || selectedCodes.length === 0,
      });
      bulkActionSelectOptions.push({
        label: 'Make Private',
        value: 'make_private',
        disabled: !hasTableData || selectedCodes.length === 0,
      });
    }

    return bulkActionSelectOptions;
  }

  getBulkActionSelectValue() {
    const bulkActionSelectOptions = this.getBulkActionSelectOptions();
    return getFirstNonDisabledOption(bulkActionSelectOptions);
  }

  setModalState({ key, options }) {
    this.setState((state) => ({
      modals: {
        ...state.modals,
        [key]: options,
      },
    }));
  }

  getSelectAllCheckBoxLabel = () => {
    if (this.hasAllTableRowsSelected) {
      return 'unselect all codes';
    }
    return 'select all codes';
  };

  getLabelForCodeCheckBox = (code) => {
    if (this.selectedTableRows[code]) {
      return `unselect code ${code}`;
    }
    return `select code ${code}`;
  };

  reset() {
    this.resetModals();
    this.resetCodeActionStatus();

    this.setState({
      selectedCodes: [],
      hasAllCodesSelected: false,
      refreshIndex: 0,
    });
  }

  shouldShowSelectAllStatusAlert() {
    const { couponDetailsTable: { data: tableData } } = this.props;
    const { selectedToggle, selectedCodes, hasAllCodesSelected } = this.state;
    return shouldShowSelectAllStatusAlert({
      tableData, selectedToggle, selectedCodes, hasAllCodesSelected,
    });
  }

  shouldShowVisibilityStatusAlert() {
    const { selectedCodes } = this.state;
    return features.CODE_VISIBILITY && (selectedCodes.some(code => code.is_public)
      && selectedCodes.some(code => !code.is_public));
  }

  hasStatusAlert() {
    // The following are the scenarios where a status alert will be shown. Note, the coupon
    // details table must be finished loading for status alert to show:
    //  - Coupon has an error
    //  - Code assignment/remind/revoke status (error or success)
    //  - Code selection status (e.g., "50 codes selected. Select all 65 codes?")

    const {
      couponData: { errors },
      couponOverviewError,
    } = this.props;
    const {
      isCodeAssignmentSuccessful,
      isCodeReminderSuccessful,
      isCodeRevokeSuccessful,
      isCodeVisibilitySuccessful,
      doesCodeActionHaveErrors,
    } = this.state;

    const hasStatusAlert = [
      errors.length > 0,
      couponOverviewError,
      isCodeAssignmentSuccessful,
      isCodeReminderSuccessful,
      isCodeRevokeSuccessful,
      isCodeVisibilitySuccessful,
      doesCodeActionHaveErrors,
      this.shouldShowSelectAllStatusAlert(),
      this.shouldShowVisibilityStatusAlert(),
    ].some(item => item);

    return !this.isTableLoading() && hasStatusAlert;
  }

  handleToggleSelect(newValue) {
    const { tableColumns, selectedToggle } = this.state;

    const value = newValue || selectedToggle;
    const assignedToColumnLabel = value === 'unredeemed' ? 'Assigned To' : 'Redeemed By';

    const getColumnIndexForKey = key => tableColumns.findIndex(column => column.key === key);

    // `assigned_to, assignment_date, last_reminder_date` columns
    if (value !== 'unassigned' && getColumnIndexForKey('assigned_to') === -1) {
      // Add columns if they donot already exist
      tableColumns.splice(1, 0, {
        label: assignedToColumnLabel,
        key: 'assigned_to',
      });
      tableColumns.splice(tableColumns.length - 1, 0, {
        label: 'Last Reminder Date',
        key: 'last_reminder_date',
      });
      tableColumns.splice(tableColumns.length - 2, 0, {
        label: 'Assignment Date',
        key: 'assignment_date',
      });
    } else if (value !== 'unassigned' && getColumnIndexForKey('assigned_to') > -1) {
      // Update `assigned_to` column with the appropriate label
      tableColumns[1].label = assignedToColumnLabel;
    } else if (value === 'unassigned' && getColumnIndexForKey('assigned_to') > -1) {
      // Remove columns if they already exist
      tableColumns.splice(getColumnIndexForKey('assigned_to'), 1);
      tableColumns.splice(getColumnIndexForKey('last_reminder_date'), 1);
      tableColumns.splice(getColumnIndexForKey('assignment_date'), 1);
    }

    // `assignments_remaining` column
    if (value === 'unassigned' && getColumnIndexForKey('assignments_remaining') === -1) {
      // Add `assignments_remaining` column if it doesn't already exist.
      tableColumns.splice(3, 0, {
        label: 'Assignments Remaining',
        key: 'assignments_remaining',
      });
    } else if (value !== 'unassigned' && getColumnIndexForKey('assignments_remaining') > -1) {
      // Remove `assignments_remaining` column if it already exists.
      tableColumns.splice(getColumnIndexForKey('assignments_remaining'), 1);
    }

    // `is_public` column
    if (features.CODE_VISIBILITY && getColumnIndexForKey('is_public') === -1) {
      // Add `is_public` column if it doesn't already exist
      tableColumns.splice(tableColumns.length, 0, {
        label: 'Visibility',
        key: 'is_public',
      });
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
    updateUrl({ page: undefined });
    this.setState({
      tableColumns,
      selectedToggle: value,
      selectedCodes: [],
      hasAllCodesSelected: false,
    }, () => {
      this.updateSelectAllCheckBox();
    });
  }

  handleVisibilitySelect(newValue) {
    const { tableColumns, visibilityToggle } = this.state;
    // Paragon InputSelect will use the `label` if the value isn't defined
    // this will intentionally keep the value set as undefined so that qs.stringify
    // won't send along a value we didn't set to the API.
    const value = newValue === 'Both' ? undefined : newValue || visibilityToggle;
    this.resetCodeActionStatus();
    this.setState({
      tableColumns,
      visibilityToggle: value,
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
      tableData && tableData.results && tableData.results.length !== 0
      && selectedCodes.length === tableData.results.length
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
      selectAllCheckBoxRef && document.getElementById(selectAllCheckBoxRef.props.id)
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
      case 'visibility': {
        stateKey = 'isCodeVisibilitySuccessful';
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
      this.setState((state) => ({
        [stateKey]: true,
        refreshIndex: state.refreshIndex + 1, // force new table instance
        selectedCodes: [],
        doesCodeActionHaveErrors,
      }), () => {
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
    const { couponData } = this.props;
    const { selectedCodes, selectedToggle } = this.state;

    return data.map(code => ({
      ...code,
      code: <span data-hj-suppress>{code.code}</span>,
      assigned_to: code.error ? (
        <span className="text-danger">
          <Icon className="fa fa-exclamation-circle mr-2" screenReaderText="Error" />
          {code.error}
        </span>
      ) : code.assigned_to,
      redemptions: `${code.redemptions.used} of ${code.redemptions.total}`,
      assignments_remaining: `${code.redemptions.total - code.redemptions.used - code.redemptions.num_assignments}`,
      assignment_date: `${code.assignment_date}`,
      last_reminder_date: `${code.last_reminder_date}`,
      is_public: code.is_public ? 'Public' : 'Private',
      actions: <ActionButton
        code={code}
        couponData={couponData}
        selectedToggle={selectedToggle}
        handleCodeActionSuccess={this.handleCodeActionSuccess}
        setModalState={this.setModalState}
      />,
      select: (
        <CheckBox
          name={`select code ${code.code}`}
          label={
            <div className="sr-only">{this.getLabelForCodeCheckBox(code.code)}</div>
          }
          onChange={(checked) => {
            this.handleCodeSelection({ checked, code });
            if (checked) {
              this.selectedTableRows[code.code] = true;
            } else if (checked && this.selectedTableRows[code.code]) {
              delete this.selectedTableRows[code.code];
            }
          }}
          checked={selectedCodes.findIndex(selectedCode => selectedCode === code) !== -1}
        />
      ),
    }));
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
        usage_limitation: couponType,
      },
    } = this.props;
    const {
      hasAllCodesSelected,
      selectedCodes,
      selectedToggle,
    } = this.state;

    const ref = this.bulkActionSelectRef && this.bulkActionSelectRef.current;
    const selectedBulkAction = ref && ref.value;

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
            couponType,
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
    } else if (selectedBulkAction === 'make_public' || selectedBulkAction === 'make_private') {
      const isPublic = selectedBulkAction === 'make_public';
      const codeIds = selectedCodes.map(selectedCode => selectedCode.code);
      const options = {
        couponId: id,
        codeIds,
        isPublic,
        onSuccess: response => this.handleCodeActionSuccess('visibility', response),
      };
      this.props.updateCodeVisibility(options);
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

  resetCodeActionStatus() {
    this.setState({
      isCodeAssignmentSuccessful: undefined,
      isCodeReminderSuccessful: undefined,
      isCodeRevokeSuccessful: undefined,
      isCodeVisibilitySuccessful: undefined,
      doesCodeActionHaveErrors: undefined,
    });
  }

  renderErrorMessage({ title, message }) {
    return (
      <StatusAlert
        alertType="danger"
        iconClassName="fa fa-times-circle"
        title={title}
        message={message}
      />
    );
  }

  renderSuccessMessage({ title, message }) {
    const {
      couponData: { errors },
      couponOverviewError,
    } = this.props;

    return (
      <StatusAlert
        alertType="success"
        className={classNames({ 'mt-2': errors.length > 0 || couponOverviewError })}
        iconClassName="fa fa-check"
        title={title}
        message={message}
        onClose={this.resetCodeActionStatus}
        dismissible
      />
    );
  }

  renderInfoMessage({ title, message }) {
    const {
      couponData: { errors },
      couponOverviewError,
    } = this.props;

    return (
      <StatusAlert
        alertType="info"
        className={classNames({ 'mt-2': errors.length > 0 || couponOverviewError })}
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
      isCodeVisibilitySuccessful,
      doesCodeActionHaveErrors,
      refreshIndex,
      hasAllCodesSelected,
      visibilityToggle,
    } = this.state;

    const {
      couponData: { id, errors },
      couponDetailsTable: { data: tableData },
      couponOverviewLoading,
      couponOverviewError,
      isExpanded,
    } = this.props;

    const shouldDisplayErrors = selectedToggle === 'unredeemed' && errors.length > 0;

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
          {isExpanded && (
            <>
              <div className="details-header row no-gutters mb-3">
                <div className="col-12 col-md-6 mb-2 mb-md-0">
                  <h3>Coupon Details</h3>
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
                    className="mt-1"
                    name="table-view"
                    label="Filter by Code Status:"
                    value={selectedToggle}
                    options={this.getTableFilterSelectOptions()}
                    disabled={this.isTableLoading()}
                    onChange={this.handleToggleSelect}
                  />
                  {features.CODE_VISIBILITY && (
                    <div className="d-inline pl-4">
                      <InputSelect
                        className="mt-1"
                        name="table-view"
                        label="Filter by Visibility:"
                        value={visibilityToggle}
                        options={this.getTableFilterVisibilitySelectionOptions()}
                        disabled={this.isTableLoading()}
                        onChange={this.handleVisibilitySelect}
                      />
                    </div>
                  )}
                </div>
                <div className="bulk-actions col-12 col-md-4 text-md-right mt-3 m-md-0">
                  <InputSelect
                    inputRef={this.bulkActionSelectRef}
                    className="mt-1"
                    name="bulk-action"
                    label="Bulk Action:"
                    value={this.getBulkActionSelectValue()}
                    options={this.getBulkActionSelectOptions()}
                    disabled={this.isBulkAssignSelectDisabled()}
                  />
                  <Button
                    className="ml-2"
                    onClick={this.handleBulkActionSelect}
                    disabled={this.isBulkAssignSelectDisabled()}
                  >
                    Go
                  </Button>
                </div>
              </div>
              {this.hasStatusAlert() && (
                <div className="row mb-3">
                  <div className="col">
                    {shouldDisplayErrors && this.renderErrorMessage({
                      message: (
                        <>
                          {errors.length > 1
                            ? `${errors.length} errors have occurred: ` : 'An error has occurred: '}
                          <ul className="m-0 pl-4">
                            {errors.map(error => (
                              <li key={error.code}>
                                {`Unable to send code assignment email to
                                 ${error.user_email} for ${error.code} code.`}
                              </li>
                            ))}
                          </ul>
                        </>
                      ),
                    })}
                    {couponOverviewError && !couponOverviewLoading && this.renderErrorMessage({
                      message: (
                        <>
                          Failed to fetch coupon overview data ({couponOverviewError.message}).
                          <Button
                            variant="link"
                            className="p-0 pl-1 border-0"
                            onClick={() => this.props.fetchCouponOrder(id)}
                          >
                            Please try again.
                          </Button>
                        </>
                      ),
                    })}
                    {isCodeAssignmentSuccessful && this.renderSuccessMessage({
                      title: 'Successfully assigned code(s)',
                      message: (
                        <>
                          To view the newly assigned code(s), filter by
                          <Button
                            variant="link"
                            className="p-0 pl-1 border-0"
                            onClick={() => {
                              this.setState({
                                selectedToggle: 'unredeemed',
                              }, () => {
                                this.handleToggleSelect();
                              });
                            }}
                          >
                            unredeemed codes.
                          </Button>
                        </>
                      ),
                    })}
                    {isCodeReminderSuccessful && this.renderSuccessMessage({
                      message: 'Reminder request processed.',
                    })}
                    {isCodeRevokeSuccessful && this.renderSuccessMessage({
                      message: 'Successfully revoked code(s)',
                    })}
                    {isCodeVisibilitySuccessful && this.renderSuccessMessage({
                      message: 'Successfully changed visibility for code(s)',
                    })}
                    {doesCodeActionHaveErrors && this.renderErrorMessage({
                      title: 'An unexpected error has occurred. Please try again or contact your Customer Success Manager.',
                      message: '',
                    })}
                    {this.shouldShowVisibilityStatusAlert() && this.renderInfoMessage({
                      message: "You've selected one or more public codes. If you wish to assign codes in bulk, please select only private codes.",
                    })}
                    {this.shouldShowSelectAllStatusAlert() && this.renderInfoMessage({
                      message: (
                        <>
                          {hasAllCodesSelected ? `All ${tableData.count} codes are selected.` : `${selectedCodes.length} codes are selected.`}
                          {!hasAllCodesSelected && (
                            <Button
                              variant="link"
                              className="p-0 pl-1 border-0"
                              onClick={() => this.setState({
                                hasAllCodesSelected: true,
                              })}
                            >
                              {`Select all ${tableData.count} codes?`}
                            </Button>
                          )}
                        </>
                      ),
                    })}
                  </div>
                </div>
              )}
              <TableContainer
                // Setting a key to force a new instance of the TableContainer
                // when the selected toggle and/or the refresh index changes.
                key={`table-${selectedToggle}-${visibilityToggle}-${refreshIndex}`}
                id="coupon-details"
                className="coupon-details-table"
                fetchMethod={(enterpriseId, options) => EcommerceApiService.fetchCouponDetails(id, {
                  ...options,
                  code_filter: selectedToggle,
                  visibility_filter: visibilityToggle,
                })}
                columns={tableColumns}
                formatData={this.formatCouponData}
              />
              {modals.assignment && (
                <CodeAssignmentModal
                  {...modals.assignment}
                  onClose={this.resetModals}
                  onSuccess={response => this.handleCodeActionSuccess(MODAL_TYPES.assign, response)}
                />
              )}
              {modals.revoke && (
                <CodeRevokeModal
                  {...modals.revoke}
                  onClose={this.resetModals}
                  onSuccess={response => this.handleCodeActionSuccess(MODAL_TYPES.revoke, response)}
                />
              )}
              {modals.remind && (
                <CodeReminderModal
                  {...modals.remind}
                  onClose={this.resetModals}
                  onSuccess={response => this.handleCodeActionSuccess(MODAL_TYPES.remind, response)}
                />
              )}
            </>
          )}
        </div>
      </div>
    );
  }
}

CouponDetails.defaultProps = {
  isExpanded: false,
  couponDetailsTable: {},
  couponOverviewError: null,
  couponOverviewLoading: false,
};

CouponDetails.propTypes = {
  // props from container
  fetchCouponOrder: PropTypes.func.isRequired,
  updateCodeVisibility: PropTypes.func.isRequired,
  couponDetailsTable: PropTypes.shape({
    data: PropTypes.shape({}),
    loading: PropTypes.bool,
  }),
  couponOverviewError: PropTypes.instanceOf(Error),
  couponOverviewLoading: PropTypes.bool,

  // custom props
  couponData: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    errors: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    num_unassigned: PropTypes.number.isRequired,
    usage_limitation: PropTypes.string.isRequired,
    available: PropTypes.bool.isRequired.isRequired,
  }).isRequired,
  isExpanded: PropTypes.bool,
};

export default CouponDetails;
