import React, {
  useContext, useState, useMemo, useEffect, useRef,
} from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';

import {
  Alert, DataTable, TextFilter,
} from '@edx/paragon';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';

import { Link } from 'react-router-dom';
import { BulkEnrollContext } from '../BulkEnrollmentContext';
import { ADD_LEARNERS_TITLE, ADD_LEARNERS_DESCRIPTION } from './constants';
import TableLoadingSkeleton from '../../TableComponent/TableLoadingSkeleton';
import { BaseSelectWithContext, BaseSelectWithContextHeader } from '../table/BulkEnrollSelect';
import BaseSelectionStatus from '../table/BaseSelectionStatus';
import { ROUTE_NAMES } from '../../EnterpriseApp/constants';
import LicenseManagerApiService from '../../../data/services/LicenseManagerAPIService';
import { DEBOUNCE_TIME_MILLIS } from '../../../algoliaUtils';

export const ADD_LEARNERS_ERROR_TEXT = 'There was an error retrieving email data. Please try again later.';
export const TABLE_HEADERS = {
  email: 'Email',
};

export const LINK_TEXT = 'Subscription management';

const AddLearnersSelectionStatus = (props) => {
  const { emails: [selectedEmails, dispatch] } = useContext(BulkEnrollContext);

  return <BaseSelectionStatus selectedRows={selectedEmails} dispatch={dispatch} {...props} />;
};

const SelectWithContext = (props) => <BaseSelectWithContext contextKey="emails" {...props} />;

const SelectWithContextHeader = (props) => <BaseSelectWithContextHeader contextKey="emails" {...props} />;

const selectColumn = {
  id: 'selection',
  Header: SelectWithContextHeader,
  Cell: SelectWithContext,
  disableSortBy: true,
};

const tableColumns = [
  selectColumn,
  {
    Header: TABLE_HEADERS.email,
    accessor: 'userEmail',
    Filter: TextFilter,
    cellClassName: 'cell-max-width-override',
  },
];

const INITIAL_PAGE_INDEX = 0;
export const LEARNERS_PAGE_SIZE = 25;

const useIsMounted = () => {
  const componentIsMounted = useRef(true);
  useEffect(() => () => { componentIsMounted.current = false; }, []);
  return componentIsMounted;
};

const AddLearnersStep = ({
  subscriptionUUID,
  enterpriseSlug,
}) => {
  const [errors, setErrors] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ results: [], count: 0, numPages: 1 });
  const { emails: [selectedEmails] } = useContext(BulkEnrollContext);
  const { results, count, numPages } = data;
  const isMounted = useIsMounted();

  const fetchData = (tableInstance = {}) => {
    const pageIndex = tableInstance.pageIndex || INITIAL_PAGE_INDEX;
    let options = { active_only: 1, page_size: LEARNERS_PAGE_SIZE, page: pageIndex + 1 };

    const { filters } = tableInstance;
    const emailFilter = filters.find(item => item.id === 'userEmail');
    if (emailFilter) {
      options = { ...options, search: emailFilter.value };
    }
    LicenseManagerApiService.fetchSubscriptionUsers(
      subscriptionUUID,
      options,
    ).then((response) => {
      if (isMounted.current) {
        setData(camelCaseObject(response.data));
        setErrors('');
      }
    }).catch((err) => {
      logError(err);
      if (isMounted.current) {
        setErrors(err.message);
      }
    }).finally(() => {
      if (isMounted.current) {
        setLoading(false);
      }
    });
  };

  const debouncedFetchData = useMemo(
    () => debounce(fetchData, DEBOUNCE_TIME_MILLIS),
    [subscriptionUUID, enterpriseSlug],
  );
  // Stop the invocation of the debounced function on unmount
  useEffect(() => () => {
    debouncedFetchData.cancel();
  }, []);

  const initialTableOptions = useMemo(() => ({
    getRowId: (row, relativeIndex, parent) => row?.uuid || (parent ? [parent.id, relativeIndex].join('.') : relativeIndex),
  }), []);

  const filterStatusComponent = () => <DataTable.FilterStatus showFilteredFields={false} />;

  return (
    <>
      <p>
        {ADD_LEARNERS_DESCRIPTION}{' '}
        <Link to={`/${enterpriseSlug}/admin/${ROUTE_NAMES.subscriptionManagement}/${subscriptionUUID}`}>{LINK_TEXT}</Link>
      </p>
      <h2>{ADD_LEARNERS_TITLE}</h2>
      {errors && <Alert variant="danger">{ADD_LEARNERS_ERROR_TEXT}</Alert>}
      <div className="data-table-selector-column-wrapper">
        <DataTable
          isFilterable
          manualFilters
          columns={tableColumns}
          data={results}
          itemCount={count}
          isPaginated
          pageCount={numPages}
          manualPagination
          fetchData={debouncedFetchData}
          SelectionStatusComponent={AddLearnersSelectionStatus}
          initialTableOptions={initialTableOptions}
          selectedFlatRows={selectedEmails}
          FilterStatusComponent={filterStatusComponent}
        >
          {loading && <TableLoadingSkeleton data-testid="skelly" />}
          {!loading
            && (
            <>
              <DataTable.TableControlBar />
              <DataTable.Table />
              <DataTable.TableFooter />
            </>
            )}
        </DataTable>
      </div>
    </>
  );
};

AddLearnersStep.propTypes = {
  subscriptionUUID: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
};

export default AddLearnersStep;
