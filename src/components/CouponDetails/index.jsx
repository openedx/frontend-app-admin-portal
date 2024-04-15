import { useCallback, useMemo, useEffect, useState } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { Alert, Button, DataTable, Icon } from "@edx/paragon";
import { CheckCircle, Error } from "@edx/paragon/icons";

import DownloadCsvButton from "../../containers/DownloadCsvButton";
import CodeAssignmentModal from "../../containers/CodeAssignmentModal";
import CodeReminderModal from "../../containers/CodeReminderModal";
import CodeRevokeModal from "../../containers/CodeRevokeModal";

import EcommerceApiService from "../../data/services/EcommerceApiService";
import { cleanUndefinedKeys, updateUrl } from "../../utils";
import { MODAL_TYPES } from "../EmailTemplateForm/constants";
import { getFilterOptions } from "./helpers";
import {
  ACTIONS,
  COUPON_FILTERS,
  DEFAULT_TABLE_COLUMNS,
  SUCCESS_MESSAGES,
} from "./constants";
import ActionButton from "./ActionButton";
import FilterBulkActionRow from "./FilterBulkActionRow";
import { withLocation, withNavigate } from "../../hoc";
import useCouponCodes from "../learner-credit-management/data/hooks/useCouponCodes";
import useCouponCodeSelections from "../learner-credit-management/data/hooks/useCouponCodeSelections";

const CouponDetails = ({
  enterpriseFeatures,
  enterpriseUUID,
  isExpanded,
  navigate,
  location,
  couponData,
  couponOverviewError,
  fetchCouponOrder,
}) => {
  
  const getNewColumns = (selectedToggle) => {
    const columnValues = {
      code: ({row: {original: code}}) => {
        return <span data-hj-suppress>{code.code}</span>
      },
      assigned_to: ({row: {original: code}}) => {
        return code.error ? (
        <span className="text-danger">
          <Icon className="mr-2" screenReaderText="Error" src={Error} />
          {code.error}
        </span>
        ) : (
          code.assigned_to
          );
        },
      redemptions: ({row: {original: code}}) => `${code.redemptions.used} of ${code.redemptions.total}`,
      assignments_remaining: ({row: {original: code}}) => (`${
        code.redemptions.total -
        code.redemptions.used -
        code.redemptions.num_assignments
      }`),
      assignment_date: ({row: {original: code}}) => `${code.assignment_date}`,
      last_reminder_date: ({row: {original: code}}) => `${code.last_reminder_date}`,
      actions: ({row: {original: code}}) => (
        <ActionButton
          code={code}
          couponData={couponData}
          selectedToggle={selectedToggle}
          handleCodeActionSuccess={handleCodeActionSuccess}
          setModalState={setModalState}
        />
      ),
    };
    
    const toDataTableColumn = ({ label, key }) => {
      return { Header: label, accessor: key, Cell: columnValues[key] };
    };

    if (selectedToggle) {
      const toggleColumns = DEFAULT_TABLE_COLUMNS[selectedToggle].map(toDataTableColumn);
      return [
        ...toggleColumns,
      ];
    }
    return tableColumns;
  };

  const [modalOptions, setModalOptions] = useState({
    assignment: null,
  });
  const [selectedToggle, setSelectedToggle] = useState(
    COUPON_FILTERS.unassigned.value
  );
  const [tableColumns, setTableColumns] = useState(
    getNewColumns(COUPON_FILTERS.unassigned.value)
  );
  const [isCodeAssignmentSuccessful, setCodeAssignmentSuccessful] =
    useState(undefined);
  const [isCodeReminderSuccessful, setCodeReminderSuccessful] =
    useState(undefined);
  const [isCodeRevokeSuccessful, setCodeRevokeSuccessful] = useState(undefined);
  const [doesCodeActionHaveErrors, setCodeActionHasErrors] =
    useState(undefined);
  const [isTableLoading, setTableLoading] = useState(true);

  // TODO: Do we need this anymore?
  /**
   * In some scenarios, we want to create a new instance of the table so that it recreates
   * checkboxes (clearing their states), refetches the data, and adjusts table columns
   * appropriately. The `refreshIndex` can be used as a quick and easy way to create a new
   * table instance simply by changing it's value (e.g., incrementing). In combination with
   * the `selectedToggle` state, a new table instance is created whenever the `selectedToggle`
   * or `refreshIndex` state changes by altering the table's `key` prop.
   */
  const [refreshIndex, setRefreshIndex] = useState(0);

  const initialState = {
    pageSize: 50,
    pageIndex: 0,
  };

  const {
    couponCodes,
    count: totalCouponCount,
    numPages,
    fetchCouponCodes,
  } = useCouponCodes(couponData.id, selectedToggle);

  // Conclude loading once couponCodes change
  useEffect(() => {
    if (couponCodes) {
      setTableLoading(false);
    }
  }, [couponCodes]);

  const {
    selectedCodes,
    setSelectedCodes,
    hasAllCodesSelected,
    setAllCodesSelected,
    onSelectedRowsChanged
  } = useCouponCodeSelections(couponCodes, totalCouponCount);

  useEffect(() => {
    if (isExpanded) {
      // On expand, ensure the table view reflects the selected toggle
      handleToggleSelect();
    } else {
      // On collapse, reset to default states
      reset();
    }
  }, [isExpanded]);

  const handleToggleSelect = (newValue) => {
    const value = newValue || selectedToggle;

    resetCodeActionStatus();
    updateUrl(navigate, location.pathname, { page: undefined });
    setTableLoading(true);
    setTableColumns(getNewColumns(value));
    setSelectedToggle(value);
    setSelectedCodes([]);
    setAllCodesSelected(false);
  };

  const handleCodeActionSuccess = (action, response) => {
    let setActionSuccessful;
    let doesCodeActionHaveErrors;

    switch (action) {
      case ACTIONS.assign.value: {
        setActionSuccessful = setCodeAssignmentSuccessful;
        break;
      }
      case ACTIONS.revoke.value: {
        setActionSuccessful = setCodeRevokeSuccessful;
        doesCodeActionHaveErrors =
          response &&
          response.some &&
          response.some((item) => item.detail === "failure");
        break;
      }
      case ACTIONS.remind.value: {
        setActionSuccessful = setCodeReminderSuccessful;
        doesCodeActionHaveErrors =
          response &&
          response.some &&
          response.some((item) => item.detail === "failure");
        break;
      }
    }

    if (action === ACTIONS.assign.value || action === ACTIONS.revoke.value) {
      updateCouponOverviewData();
    }

    resetCodeActionStatus();

    if (setActionSuccessful) {
      setActionSuccessful(true);
      setRefreshIndex(refreshIndex + 1); // force new table instance
      setSelectedCodes([]);
      setCodeActionHasErrors(doesCodeActionHaveErrors);
    }
  };

  const handleBulkAction = (bulkActionToggle) => {
    const {
      id: couponId,
      title: couponTitle,
      num_unassigned: unassignedCodes,
      usage_limitation: couponType,
    } = couponData;

    if (bulkActionToggle === ACTIONS.assign.value) {
      setModalState({
        key: "assignment",
        options: {
          couponId,
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
      setModalState({
        key: "revoke",
        options: {
          couponId,
          title: couponTitle,
          isBulkRevoke: true,
          data: {
            selectedCodes,
          },
        },
      });
    } else if (bulkActionToggle === ACTIONS.remind.value) {
      setModalState({
        key: "remind",
        options: {
          couponId,
          title: couponTitle,
          isBulkRemind: true,
          selectedToggle,
          data: {
            selectedCodes,
          },
        },
      });
    }
  };



  const getTableFilterSelectOptions = () => {
    const { usage_limitation: usageLimitation } = couponData;
    return getFilterOptions(usageLimitation);
  };

  const setModalState = ({ key, options }) => {
    setModalOptions({
      modalOptions,
      [key]: options,
    });
  };

  const reset = () => {
    resetModals();
    resetCodeActionStatus();

    setSelectedCodes([]);
    setAllCodesSelected(false);
    setRefreshIndex(0);
  };

  const hasStatusAlert = () => {
    // The following are the scenarios where a status alert will be shown. Note, the coupon
    // details table must be finished loading for status alert to show:
    //  - Coupon has an error
    //  - Code assignment/remind/revoke status (error or success)
    //  - Code selection status (e.g., "50 codes selected. Select all 65 codes?")

    const { errors } = couponData;

    const hasStatusAlert = [
      errors.length > 0,
      couponOverviewError,
      isCodeAssignmentSuccessful,
      isCodeReminderSuccessful,
      isCodeRevokeSuccessful,
      doesCodeActionHaveErrors,
    ].some((item) => item);

    return !isTableLoading && hasStatusAlert;
  };

  const updateCouponOverviewData = () => {
    const { id } = couponData;
    fetchCouponOrder(id);
  };

  const resetModals = () => {
    setModalOptions({
      assignment: null,
      revoke: null,
      remind: null,
    });
  };

  const resetCodeActionStatus = () => {
    setCodeAssignmentSuccessful(undefined);
    setCodeReminderSuccessful(undefined);
    setCodeRevokeSuccessful(undefined);
    setCodeActionHasErrors(undefined);
  };

  const renderErrorMessage = ({ title, message }) => {
    return (
      <Alert variant="danger" icon={Error}>
        <Alert.Heading>{title}</Alert.Heading>
        <p>{message}</p>
      </Alert>
    );
  };

  const renderSuccessMessage = ({ title, message }) => {
    const { errors } = couponData;

    return (
      <Alert
        variant="success"
        icon={CheckCircle}
        className={classNames({
          "mt-2": errors.length > 0 || couponOverviewError,
        })}
        onClose={resetCodeActionStatus}
        dismissible
      >
        <Alert.Heading>{title}</Alert.Heading>
        <p>{message}</p>
      </Alert>
    );
  };

  const renderInfoMessage = ({ title, message }) => {
    const { errors } = couponData;

    return (
      <Alert
        variant="info"
        className={classNames({
          "mt-2": errors.length > 0 || couponOverviewError,
        })}
      >
        <Alert.Heading>{title}</Alert.Heading>
        <p>{message}</p>
      </Alert>
    );
  };

  const {
    id,
    errors,
    num_unassigned: numUnassignedCodes,
    available: couponAvailable,
  } = couponData;

  const shouldDisplayErrors =
    selectedToggle === "unredeemed" && errors.length > 0;
  const hasTableData = !!totalCouponCount;

  return (
    <div
      id={`coupon-details-${id}`}
      className={classNames([
        "coupon-details row no-gutters px-2 my-3",
        {
          "d-none": !isExpanded,
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
                  fetchMethod={() =>
                    EcommerceApiService.fetchCouponDetails(
                      id,
                      { code_filter: selectedToggle },
                      { csv: true }
                    )
                  }
                  disabled={isTableLoading}
                />
              </div>
            </div>
            <FilterBulkActionRow
              selectedToggle={selectedToggle}
              isTableLoading={isTableLoading}
              couponFilterProps={{
                tableFilterSelectOptions: getTableFilterSelectOptions(),
                handleToggleSelect: handleToggleSelect,
              }}
              couponBulkActionProps={{
                handleBulkAction: handleBulkAction,
                numUnassignedCodes,
                couponAvailable,
                hasTableData,
                numSelectedCodes: selectedCodes?.length || 0,
              }}
            />
            {hasStatusAlert() && (
              <div className="row mb-3">
                <div className="col">
                  {shouldDisplayErrors &&
                    renderErrorMessage({
                      message: (
                        <>
                          {errors.length > 1
                            ? `${errors.length} errors have occurred: `
                            : "An error has occurred: "}
                          <ul className="m-0 pl-4">
                            {errors.map((error) => (
                              <li key={error.code}>
                                {`Unable to send code assignment email to
                                 ${error.user_email} for ${error.code} code.`}
                              </li>
                            ))}
                          </ul>
                        </>
                      ),
                    })}
                  {couponOverviewError &&
                    !couponOverviewLoading &&
                    renderErrorMessage({
                      message: (
                        <>
                          Failed to fetch coupon overview data (
                          {couponOverviewError.message}).
                          <Button
                            variant="link"
                            className="p-0 pl-1 border-0"
                            onClick={() => props.fetchCouponOrder(id)}
                          >
                            Please try again.
                          </Button>
                        </>
                      ),
                    })}
                  {isCodeAssignmentSuccessful &&
                    renderSuccessMessage({
                      title: SUCCESS_MESSAGES.assign,
                      message: (
                        <>
                          To view the newly assigned code(s), filter by
                          <Button
                            variant="link"
                            className="p-0 pl-1 border-0"
                            onClick={() => {
                              setSelectedToggle("unredeemed");
                              handleToggleSelect();
                            }}
                          >
                            unredeemed codes.
                          </Button>
                        </>
                      ),
                    })}
                  {isCodeReminderSuccessful &&
                    renderSuccessMessage({
                      message: SUCCESS_MESSAGES.remind,
                    })}
                  {isCodeRevokeSuccessful &&
                    renderSuccessMessage({
                      message: SUCCESS_MESSAGES.revoke,
                    })}
                  {doesCodeActionHaveErrors &&
                    renderErrorMessage({
                      title:
                        "An unexpected error has occurred. Please try again or contact your Customer Success Manager.",
                      message: "",
                    })}
                </div>
              </div>
            )}

            {/* TODO when Paragon v22.0.0 released: set itemCount to totalCouponCount */}
            <DataTable
              isLoading={isTableLoading}
              isSelectable
              isPaginated
              manualFilters
              manualPagination
              manualSortBy
              pageCount={numPages}
              onSelectedRowsChanged={onSelectedRowsChanged}
              initialState={initialState}
              itemCount={couponCodes?.length || initialState.pageSize}
              data={couponCodes || []}
              fetchData={fetchCouponCodes}
              columns={tableColumns}
            />

            {modalOptions.assignment && (
              <CodeAssignmentModal
                {...modalOptions.assignment}
                onClose={resetModals}
                onSuccess={(response) =>
                  handleCodeActionSuccess(MODAL_TYPES.assign, response)
                }
              />
            )}
            {modalOptions.revoke && (
              <CodeRevokeModal
                {...modalOptions.revoke}
                onClose={resetModals}
                onSuccess={(response) =>
                  handleCodeActionSuccess(MODAL_TYPES.revoke, response)
                }
              />
            )}
            {modalOptions.remind && (
              <CodeReminderModal
                {...modalOptions.remind}
                onClose={resetModals}
                onSuccess={(response) =>
                  handleCodeActionSuccess(MODAL_TYPES.remind, response)
                }
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

// TODO: Remove couponDetailsTable
CouponDetails.defaultProps = {
  isExpanded: false,
  couponDetailsTable: {},
  couponOverviewError: null,
  couponOverviewLoading: false,
};

CouponDetails.propTypes = {
  // props from container
  enterpriseId: PropTypes.string.isRequired,
  fetchCouponOrder: PropTypes.func.isRequired,
  couponDetailsTable: PropTypes.shape({
    data: PropTypes.shape({
      count: PropTypes.number,
      results: PropTypes.arrayOf(PropTypes.shape()),
    }),
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
  navigate: PropTypes.func,
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }),
};

export default withLocation(withNavigate(CouponDetails));
