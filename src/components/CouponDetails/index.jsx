import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  Button, CheckBox, Icon, Alert,
} from '@edx/paragon';
import { CheckCircle, Error as ErrorIcon } from '@edx/paragon/icons';

import TableContainer from '../../containers/TableContainer';
import DownloadCsvButton from '../../containers/DownloadCsvButton';
import CodeAssignmentModal from '../../containers/CodeAssignmentModal';
import CodeReminderModal from '../../containers/CodeReminderModal';
import CodeRevokeModal from '../../containers/CodeRevokeModal';

import EcommerceApiService from '../../data/services/EcommerceApiService';
import { updateUrl } from '../../utils';
import { MODAL_TYPES } from '../EmailTemplateForm/constants';
import {
  getFilterOptions, shouldShowSelectAllStatusAlert,
} from './helpers';
import {
  ACTIONS, COUPON_FILTERS, DEFAULT_TABLE_COLUMNS, SUCCESS_MESSAGES,
} from './constants';
import ActionButton from './ActionButton';
import FilterBulkActionRow from './FilterBulkActionRow';

class CouponDetails extends React.Component {
  constructor(props) {
    super(props);

    this.bulkActionSelectRef = React.createRef();
    this.selectAllCheckBoxRef = React.createRef();

    this.hasAllTableRowsSelected = false;
    this.selectedTableRows = {};

    const tableColumns = this.getNewColumns(COUPON_FILTERS.unassigned.value);

    this.state = {
      selectedToggle: COUPON_FILTERS.unassigned.value,
      tableColumns,
      modals: {
        assignment: null,
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
    this.handleBulkAction = this.handleBulkAction.bind(this);
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

  getNewColumns(selectedToggle) {
    const selectColumn = {
      Header: (
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
      accessor: 'select',
    };

    switch (selectedToggle) {
      case COUPON_FILTERS.unassigned.value:
        return [
          selectColumn,
          ...DEFAULT_TABLE_COLUMNS[COUPON_FILTERS.unassigned.value],
        ];
      case COUPON_FILTERS.unredeemed.value:
        return [
          selectColumn,
          ...DEFAULT_TABLE_COLUMNS[COUPON_FILTERS.unredeemed.value],
        ];
      case COUPON_FILTERS.partiallyRedeemed.value:
        return [
          selectColumn,
          ...DEFAULT_TABLE_COLUMNS[COUPON_FILTERS.partiallyRedeemed.value],
        ];
      case COUPON_FILTERS.redeemed.value:
        return [
          selectColumn,
          ...DEFAULT_TABLE_COLUMNS[COUPON_FILTERS.redeemed.value],
        ];
      default:
        return this.tableColumns;
    }
  }

  getTableFilterSelectOptions() {
    const { couponData: { usage_limitation: usageLimitation } } = this.props;
    return getFilterOptions(usageLimitation);
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
      doesCodeActionHaveErrors,
    } = this.state;

    const hasStatusAlert = [
      errors.length > 0,
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
    const { selectedToggle } = this.state;

    const value = newValue || selectedToggle;

    this.resetCodeActionStatus();
    updateUrl({ page: undefined });
    this.setState({
      tableColumns: this.getNewColumns(value),
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
      tableData && tableData.results && tableData.results.length !== 0
      && selectedCodes.length === tableData.results.length
    );
    const hasPartialSelection = selectedCodes.length > 0 && !allCodesForPageSelected;

    const selectColumn = tableColumns.shift();

    selectColumn.Header = React.cloneElement(selectColumn.Header, {
      checked: allCodesForPageSelected,
      className: hasPartialSelection ? ['mixed'] : [],
    });

    // The Paragon `CheckBox` component does not currently support the mixed state. To
    // get around this, we get the DOM node of the checkbox and replace the `aria-checked`
    // attribute appropriately.
    //
    // TODO: Paragon now has an IndeterminateCheckbox that can be used here.
    const selectAllCheckBoxRef = selectColumn.Header.ref && selectColumn.Header.ref.current;
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
      case ACTIONS.assign.value: {
        stateKey = 'isCodeAssignmentSuccessful';
        break;
      }
      case ACTIONS.revoke.value: {
        stateKey = 'isCodeRevokeSuccessful';
        doesCodeActionHaveErrors = response && response.some && response.some(item => item.detail === 'failure');
        break;
      }
      case ACTIONS.remind.value: {
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

    if (action === ACTIONS.assign.value || action === ACTIONS.revoke.value) {
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
    return !!(couponDetailsTable && couponDetailsTable.loading);
  }

  handleBulkAction(bulkActionToggle) {
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

    if (bulkActionToggle === ACTIONS.assign.value) {
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
    } else if (bulkActionToggle === ACTIONS.revoke.value) {
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
    } else if (bulkActionToggle === ACTIONS.remind.value) {
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
      <Alert
        variant="danger"
        icon={ErrorIcon}
      >
        <Alert.Heading>
          {title}
        </Alert.Heading>
        <p>{message}</p>
      </Alert>
    );
  }

  renderSuccessMessage({ title, message }) {
    const {
      couponData: { errors },
      couponOverviewError,
    } = this.props;

    return (
      <Alert
        variant="success"
        className={classNames({ 'mt-2': errors.length > 0 || couponOverviewError })}
        icon={CheckCircle}
        onClose={this.resetCodeActionStatus}
        dismissible
      >
        <Alert.Heading>
          <p>{title}</p>
        </Alert.Heading>
        {message}
      </Alert>
    );
  }

  renderInfoMessage({ title, message }) {
    const {
      couponData: { errors },
      couponOverviewError,
    } = this.props;

    return (
      <Alert
        variant="info"
        className={classNames({ 'mt-2': errors.length > 0 || couponOverviewError })}
      >
        <Alert.Heading>
          {title}
        </Alert.Heading>
        <p>{message}</p>
      </Alert>
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
      couponData: {
        id, errors, num_unassigned: numUnassignedCodes, available: couponAvailable,
      },
      couponDetailsTable: { data: tableData },
      couponOverviewLoading,
      couponOverviewError,
      isExpanded,
    } = this.props;

    const shouldDisplayErrors = selectedToggle === 'unredeemed' && errors.length > 0;
    const isTableLoading = this.isTableLoading();
    const hasTableData = !!(tableData && tableData.count);

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
              <div className="details-header row no-gutters mb-5">
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
                    disabled={isTableLoading}
                  />
                </div>
              </div>
              <FilterBulkActionRow
                selectedToggle={selectedToggle}
                isTableLoading={isTableLoading}
                couponFilterProps={{
                  tableFilterSelectOptions: this.getTableFilterSelectOptions(),
                  handleToggleSelect: this.handleToggleSelect,
                }}
                couponBulkActionProps={{
                  handleBulkAction: this.handleBulkAction,
                  numUnassignedCodes,
                  couponAvailable,
                  hasTableData,
                  numSelectedCodes: selectedCodes?.length || 0,
                }}
              />
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
                      title: SUCCESS_MESSAGES.assign,
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
                      message: SUCCESS_MESSAGES.remind,
                    })}
                    {isCodeRevokeSuccessful && this.renderSuccessMessage({
                      message: SUCCESS_MESSAGES.revoke,
                    })}
                    {doesCodeActionHaveErrors && this.renderErrorMessage({
                      title: 'An unexpected error has occurred. Please try again or contact your Customer Success Manager.',
                      message: '',
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
                key={`table-${selectedToggle}--${refreshIndex}`}
                id="coupon-details"
                className="coupon-details-table"
                fetchMethod={(enterpriseId, options) => {
                  const apiOptions = {
                    ...options,
                    code_filter: selectedToggle,
                  };

                  return EcommerceApiService.fetchCouponDetails(id, apiOptions);
                }}
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
