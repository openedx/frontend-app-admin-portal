import React, {
  useState, useCallback, useMemo, useContext, useEffect, useRef,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  Alert, Button, Icon, DataTable, DataTableContext,
} from '@openedx/paragon';
import { CheckCircle, Error } from '@openedx/paragon/icons';

import DownloadCsvButton from '../../containers/DownloadCsvButton';
import CodeAssignmentModal from '../../containers/CodeAssignmentModal';
import CodeReminderModal from '../../containers/CodeReminderModal';
import CodeRevokeModal from '../../containers/CodeRevokeModal';

import EcommerceApiService from '../../data/services/EcommerceApiService';
import { MODAL_TYPES } from '../EmailTemplateForm/constants';
import {
  getFilterOptions, shouldShowSelectAllStatusAlert,
} from './helpers';
import {
  ACTIONS, COUPON_FILTERS, SUCCESS_MESSAGES,
} from './constants';
import ActionButton from './ActionButton';
import FilterBulkActionRow from './FilterBulkActionRow';

/**
 * Rendered as a child of DataTable to bridge DataTable's internal row-selection
 * state back to the parent via an `onSelectionChange` callback.  The component
 * produces no DOM output.
 */
const SelectionBridge = ({ onSelectionChange }) => {
  const { state: { selectedRowIds = {} }, rows = [] } = useContext(DataTableContext);
  const prevIdsRef = useRef(null);

  // Stringify to get a stable comparison so the callback is only triggered on real changes.
  const idsJson = JSON.stringify(selectedRowIds);

  useEffect(() => {
    if (prevIdsRef.current === idsJson) {
      return;
    }
    prevIdsRef.current = idsJson;
    const selected = rows
      .filter(row => selectedRowIds[row.id])
      .map(row => row.original);
    onSelectionChange(selected);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsJson]);

  return null;
};

SelectionBridge.propTypes = {
  onSelectionChange: PropTypes.func.isRequired,
};

const CouponDetails = ({
  fetchCouponOrder,
  couponData,
  couponOverviewError,
  couponOverviewLoading,
  isExpanded,
}) => {
  const {
    id,
    errors,
    title: couponTitle,
    num_unassigned: numUnassignedCodes,
    usage_limitation: couponType,
    available: couponAvailable,
  } = couponData;

  const [selectedToggle, setSelectedToggle] = useState(COUPON_FILTERS.unassigned.value);
  const [selectedCodes, setSelectedCodes] = useState([]);
  const [hasAllCodesSelected, setHasAllCodesSelected] = useState(false);
  const [tableData, setTableData] = useState({ count: 0, num_pages: 0, results: [] });
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [modals, setModals] = useState({ assignment: null, revoke: null, remind: null });
  const [isCodeAssignmentSuccessful, setIsCodeAssignmentSuccessful] = useState(undefined);
  const [isCodeReminderSuccessful, setIsCodeReminderSuccessful] = useState(undefined);
  const [isCodeRevokeSuccessful, setIsCodeRevokeSuccessful] = useState(undefined);
  const [doesCodeActionHaveErrors, setDoesCodeActionHaveErrors] = useState(undefined);

  // ─── helpers ──────────────────────────────────────────────────────────────

  const resetCodeActionStatus = useCallback(() => {
    setIsCodeAssignmentSuccessful(undefined);
    setIsCodeReminderSuccessful(undefined);
    setIsCodeRevokeSuccessful(undefined);
    setDoesCodeActionHaveErrors(undefined);
  }, []);

  const resetModals = useCallback(() => {
    setModals({ assignment: null, revoke: null, remind: null });
  }, []);

  const setModalState = useCallback(({ key, options }) => {
    setModals(prev => ({ ...prev, [key]: options }));
  }, []);

  const updateCouponOverviewData = useCallback(() => {
    fetchCouponOrder(id);
  }, [fetchCouponOrder, id]);

  // ─── filter toggle ─────────────────────────────────────────────────────────

  const handleToggleSelect = useCallback((newValue) => {
    const value = newValue || selectedToggle;
    resetCodeActionStatus();
    setSelectedToggle(value);
    setSelectedCodes([]);
    setHasAllCodesSelected(false);
  }, [selectedToggle, resetCodeActionStatus]);

  // ─── selection bridge ──────────────────────────────────────────────────────

  const handleSelectionChange = useCallback((rows) => {
    setSelectedCodes(rows);
    // Clear the "select all codes" flag when the page-level selection changes.
    setHasAllCodesSelected(false);
  }, []);

  // ─── data fetching ─────────────────────────────────────────────────────────
  // DataTable calls fetchData with { pageIndex, pageSize } whenever pagination
  // changes.  We keep a ref to selectedToggle so the callback is stable and
  // does not need to be in the DataTable key dep-set separately.
  const selectedToggleRef = useRef(selectedToggle);
  useEffect(() => {
    selectedToggleRef.current = selectedToggle;
  }, [selectedToggle]);

  const fetchData = useCallback(async ({ pageIndex, pageSize }) => {
    setIsTableLoading(true);
    try {
      const response = await EcommerceApiService.fetchCouponDetails(id, {
        page: pageIndex + 1,
        page_size: pageSize,
        code_filter: selectedToggleRef.current,
      });
      setTableData(response.data);
    } catch (_err) {
      // DataTable will show an empty state; error is non-fatal for UI.
    } finally {
      setIsTableLoading(false);
    }
  }, [id]);

  // ─── code-action success ───────────────────────────────────────────────────

  const handleCodeActionSuccess = useCallback((action, response) => {
    let doesHaveErrors;
    if (action === ACTIONS.revoke.value || action === ACTIONS.remind.value) {
      doesHaveErrors = response && response.some && response.some(item => item.detail === 'failure');
    }
    if (action === ACTIONS.assign.value || action === ACTIONS.revoke.value) {
      updateCouponOverviewData();
    }

    resetCodeActionStatus();

    switch (action) {
      case ACTIONS.assign.value:
        setIsCodeAssignmentSuccessful(true);
        break;
      case ACTIONS.revoke.value:
        setIsCodeRevokeSuccessful(true);
        setDoesCodeActionHaveErrors(doesHaveErrors);
        break;
      case ACTIONS.remind.value:
        setIsCodeReminderSuccessful(true);
        setDoesCodeActionHaveErrors(doesHaveErrors);
        break;
      default:
        break;
    }

    // Force a new DataTable instance so rows and checkboxes are reset.
    setRefreshIndex(prev => prev + 1);
    setSelectedCodes([]);
    setHasAllCodesSelected(false);
  }, [resetCodeActionStatus, updateCouponOverviewData]);

  // ─── bulk actions ──────────────────────────────────────────────────────────

  const handleBulkAction = useCallback((bulkActionToggle) => {
    if (bulkActionToggle === ACTIONS.assign.value) {
      setModalState({
        key: 'assignment',
        options: {
          couponId: id,
          title: couponTitle,
          isBulkAssign: true,
          data: {
            unassignedCodes: numUnassignedCodes,
            selectedCodes: hasAllCodesSelected ? [] : selectedCodes,
            hasAllCodesSelected,
            couponType,
          },
        },
      });
    } else if (bulkActionToggle === ACTIONS.revoke.value) {
      setModalState({
        key: 'revoke',
        options: {
          couponId: id,
          title: couponTitle,
          isBulkRevoke: true,
          data: { selectedCodes },
        },
      });
    } else if (bulkActionToggle === ACTIONS.remind.value) {
      setModalState({
        key: 'remind',
        options: {
          couponId: id,
          title: couponTitle,
          isBulkRemind: true,
          selectedToggle,
          data: { selectedCodes },
        },
      });
    }
  }, [
    id, couponTitle, numUnassignedCodes, couponType,
    hasAllCodesSelected, selectedCodes, selectedToggle, setModalState,
  ]);

  // ─── isExpanded lifecycle ──────────────────────────────────────────────────

  const prevIsExpandedRef = useRef(isExpanded);
  useEffect(() => {
    const wasExpanded = prevIsExpandedRef.current;
    prevIsExpandedRef.current = isExpanded;

    if (isExpanded && !wasExpanded) {
      // Ensure the correct toggle view is active on re-expand.
      handleToggleSelect();
    }
    if (!isExpanded && wasExpanded) {
      // Reset to clean state on collapse.
      resetModals();
      resetCodeActionStatus();
      setSelectedCodes([]);
      setHasAllCodesSelected(false);
      setRefreshIndex(0);
    }
  }, [isExpanded, handleToggleSelect, resetModals, resetCodeActionStatus]);

  // ─── derived state ─────────────────────────────────────────────────────────

  const hasTableData = !!(tableData && tableData.count);
  const shouldDisplayErrors = selectedToggle === 'unredeemed' && errors.length > 0;

  const showSelectAllStatusAlert = shouldShowSelectAllStatusAlert({
    tableData,
    selectedToggle,
    selectedCodes,
    hasAllCodesSelected,
  });

  const hasStatusAlert = !isTableLoading && [
    errors.length > 0,
    couponOverviewError,
    isCodeAssignmentSuccessful,
    isCodeReminderSuccessful,
    isCodeRevokeSuccessful,
    doesCodeActionHaveErrors,
    showSelectAllStatusAlert,
  ].some(Boolean);

  const tableFilterSelectOptions = getFilterOptions(couponData.usage_limitation);

  // ─── DataTable column definitions ─────────────────────────────────────────
  // Column `Header` values intentionally match constants.DEFAULT_TABLE_COLUMNS
  // labels so existing tests that assert on header text continue to pass.
  /* eslint-disable react/no-unstable-nested-components, react/prop-types */
  const columns = useMemo(() => {
    const commonColumns = [
      {
        Header: 'Redemptions',
        accessor: 'redemptions',
        Cell: ({ row }) => `${row.original.redemptions.used} of ${row.original.redemptions.total}`,
        disableSortBy: true,
      },
      {
        Header: 'Code',
        accessor: 'code',
        Cell: ({ row }) => <span data-hj-suppress>{row.original.code}</span>,
        disableSortBy: true,
      },
    ];

    const actionsColumn = {
      Header: 'Actions',
      accessor: 'actions',
      Cell: ({ row }) => (
        <ActionButton
          code={row.original}
          couponData={couponData}
          selectedToggle={selectedToggle}
          handleCodeActionSuccess={handleCodeActionSuccess}
          setModalState={setModalState}
        />
      ),
      disableSortBy: true,
    };

    const assignedToColumn = {
      Header: 'Assigned to',
      accessor: 'assigned_to',
      Cell: ({ row }) => {
        const code = row.original;
        if (code.error) {
          return (
            <span className="text-danger">
              <Icon className="mr-2" screenReaderText="Error" src={Error} />
              {code.error}
            </span>
          );
        }
        return code.assigned_to;
      },
      disableSortBy: true,
    };

    const redemptionDateColumns = [
      {
        Header: 'Assignment date',
        accessor: 'assignment_date',
        disableSortBy: true,
      },
      {
        Header: 'Last reminder date',
        accessor: 'last_reminder_date',
        disableSortBy: true,
      },
    ];

    switch (selectedToggle) {
      case COUPON_FILTERS.unassigned.value:
        return [
          ...commonColumns,
          {
            Header: 'Assignments remaining',
            accessor: 'assignments_remaining',
            Cell: ({ row }) => {
              const r = row.original.redemptions;
              return `${r.total - r.used - r.num_assignments}`;
            },
            disableSortBy: true,
          },
          actionsColumn,
        ];
      case COUPON_FILTERS.unredeemed.value:
      case COUPON_FILTERS.partiallyRedeemed.value:
        return [
          assignedToColumn,
          ...commonColumns,
          ...redemptionDateColumns,
          actionsColumn,
        ];
      case COUPON_FILTERS.redeemed.value:
        return [
          {
            Header: 'Redeemed by',
            accessor: 'assigned_to',
            disableSortBy: true,
          },
          ...commonColumns,
          ...redemptionDateColumns,
        ];
      default:
        return commonColumns;
    }
  }, [selectedToggle, couponData, handleCodeActionSuccess, setModalState]);
  /* eslint-enable react/no-unstable-nested-components, react/prop-types */

  // ─── alert renderers ───────────────────────────────────────────────────────

  const renderErrorMessage = ({ title, message }) => (
    <Alert variant="danger" icon={Error}>
      {title && <Alert.Heading>{title}</Alert.Heading>}
      <p>{message}</p>
    </Alert>
  );

  const renderSuccessMessage = ({ title, message }) => (
    <Alert
      variant="success"
      icon={CheckCircle}
      className={classNames({ 'mt-2': errors.length > 0 || couponOverviewError })}
      onClose={resetCodeActionStatus}
      dismissible
    >
      {title && <Alert.Heading>{title}</Alert.Heading>}
      <p>{message}</p>
    </Alert>
  );

  const renderInfoMessage = ({ message }) => (
    <Alert
      variant="info"
      className={classNames({ 'mt-2': errors.length > 0 || couponOverviewError })}
    >
      <p>{message}</p>
    </Alert>
  );

  // ─── render ────────────────────────────────────────────────────────────────

  return (
    <div
      id={`coupon-details-${id}`}
      data-testid="coupon-details"
      className={classNames([
        'coupon-details row no-gutters px-2 my-3',
        { 'd-none': !isExpanded },
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
                tableFilterSelectOptions,
                handleToggleSelect,
              }}
              couponBulkActionProps={{
                handleBulkAction,
                numUnassignedCodes,
                couponAvailable,
                hasTableData,
                numSelectedCodes: selectedCodes.length,
              }}
            />

            {hasStatusAlert && (
              <div className="row mb-3">
                <div className="col">
                  {shouldDisplayErrors && renderErrorMessage({
                    message: (
                      <>
                        {errors.length > 1
                          ? `${errors.length} errors have occurred: ` : 'An error has occurred: '}
                        <ul className="m-0 pl-4">
                          {errors.map(error => (
                            <li key={error.code}>
                              {`Unable to send code assignment email to ${error.user_email} for ${error.code} code.`}
                            </li>
                          ))}
                        </ul>
                      </>
                    ),
                  })}
                  {couponOverviewError && !couponOverviewLoading && renderErrorMessage({
                    message: (
                      <>
                        Failed to fetch coupon overview data ({couponOverviewError.message}).
                        <Button
                          variant="link"
                          className="p-0 pl-1 border-0"
                          onClick={() => fetchCouponOrder(id)}
                        >
                          Please try again.
                        </Button>
                      </>
                    ),
                  })}
                  {isCodeAssignmentSuccessful && renderSuccessMessage({
                    title: SUCCESS_MESSAGES.assign,
                    message: (
                      <>
                        To view the newly assigned code(s), filter by
                        <Button
                          variant="link"
                          className="p-0 pl-1 border-0"
                          onClick={() => handleToggleSelect('unredeemed')}
                        >
                          unredeemed codes.
                        </Button>
                      </>
                    ),
                  })}
                  {isCodeReminderSuccessful && renderSuccessMessage({
                    message: SUCCESS_MESSAGES.remind,
                  })}
                  {isCodeRevokeSuccessful && renderSuccessMessage({
                    message: SUCCESS_MESSAGES.revoke,
                  })}
                  {doesCodeActionHaveErrors && renderErrorMessage({
                    title: 'An unexpected error has occurred. Please try again or contact your Customer Success Manager.',
                    message: '',
                  })}
                  {showSelectAllStatusAlert && renderInfoMessage({
                    message: (
                      <>
                        {hasAllCodesSelected
                          ? `All ${tableData.count} codes are selected.`
                          : `${selectedCodes.length} codes are selected.`}
                        {!hasAllCodesSelected && (
                          <Button
                            variant="link"
                            className="p-0 pl-1 border-0"
                            onClick={() => setHasAllCodesSelected(true)}
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

            {/*
              * The `key` forces DataTable to fully remount whenever the active
              * filter tab or refreshIndex changes, which clears selection state
              * and triggers a fresh page-1 fetch – matching the prior behaviour
              * of the deprecated TableContainer approach.
              */}
            <DataTable
              key={`table-${selectedToggle}-${refreshIndex}`}
              className="coupon-details-table"
              isSelectable
              isPaginated
              manualPagination
              isLoading={isTableLoading}
              fetchData={fetchData}
              data={tableData.results || []}
              itemCount={tableData.count || 0}
              pageCount={tableData.num_pages || 0}
              columns={columns}
              initialState={{ pageIndex: 0, pageSize: 25 }}
            >
              {/* Syncs DataTable-internal selection up to component state */}
              <SelectionBridge onSelectionChange={handleSelectionChange} />
              <DataTable.Table />
              <DataTable.EmptyTable content="There are no results." />
              <DataTable.TableFooter />
            </DataTable>

            {modals.assignment && (
              <CodeAssignmentModal
                {...modals.assignment}
                onClose={resetModals}
                onSuccess={response => handleCodeActionSuccess(MODAL_TYPES.assign, response)}
              />
            )}
            {modals.revoke && (
              <CodeRevokeModal
                {...modals.revoke}
                onClose={resetModals}
                onSuccess={response => handleCodeActionSuccess(MODAL_TYPES.revoke, response)}
              />
            )}
            {modals.remind && (
              <CodeReminderModal
                {...modals.remind}
                onClose={resetModals}
                onSuccess={response => handleCodeActionSuccess(MODAL_TYPES.remind, response)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

CouponDetails.defaultProps = {
  isExpanded: false,
  couponOverviewError: null,
  couponOverviewLoading: false,
};

CouponDetails.propTypes = {
  // props from container
  fetchCouponOrder: PropTypes.func.isRequired,
  couponOverviewError: PropTypes.instanceOf(Error),
  couponOverviewLoading: PropTypes.bool,

  // custom props
  couponData: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    errors: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    num_unassigned: PropTypes.number.isRequired,
    usage_limitation: PropTypes.string.isRequired,
    available: PropTypes.bool.isRequired,
  }).isRequired,
  isExpanded: PropTypes.bool,
};

export default CouponDetails;
