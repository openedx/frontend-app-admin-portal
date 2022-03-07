import React, {
  useCallback, useEffect, useState,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Stack } from '@edx/paragon';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';
import debounce from 'lodash.debounce';

import SubsidyRequestManagementTable, {
  transformRequestOverview,
  transformRequests,
} from '../SubsidyRequestManagementTable';
import EnterpriseAccessApiService from '../../data/services/EnterpriseAccessApiService';

export const PAGE_SIZE = 20;
export const DEBOUNCE_TIME_MS = 200;

export const useIsMounted = () => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  return isMounted;
};

const ManageRequestsTab = ({ enterpriseId }) => {
  const isMounted = useIsMounted();
  const [searchOptions, setSearchOptions] = useState({
    query: '',
    page: 1,
    filters: {
      requestStatus: [],
    },
  });
  const debouncedSetSearchOptions = debounce(setSearchOptions, DEBOUNCE_TIME_MS);
  const [codeRequests, setCodeRequests] = useState({
    requests: [],
    pageCount: 0,
    itemCount: 0,
  });
  const [codeRequestsOverview, setCodeRequestsOverview] = useState([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [isLoadingRequestsOverview, setIsLoadingRequestsOverview] = useState(false);

  const isLoading = isLoadingRequests || isLoadingRequestsOverview;

  /**
   * Fetches counts of each request status.
   */
  const fetchOverview = async () => {
    setIsLoadingRequestsOverview(true);
    try {
      const options = {};
      if (searchOptions.query) {
        options.search = searchOptions.query;
      }
      const response = await EnterpriseAccessApiService.getCouponCodeRequestOverview(
        enterpriseId,
        options,
      );
      const data = camelCaseObject(response.data);
      const result = transformRequestOverview(data);
      setCodeRequestsOverview(result);
    } catch (err) {
      logError(err);
    } finally {
      setIsLoadingRequestsOverview(false);
    }
  };

  /**
   * Fetches coupon code requests from the API.
   */
  const fetchRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const options = {
        page: searchOptions.page,
        page_size: PAGE_SIZE,
      };
      if (searchOptions.query) {
        options.search = searchOptions.query;
      }
      const response = await EnterpriseAccessApiService.getCouponCodeRequests(
        enterpriseId,
        searchOptions.filters?.requestStatus,
        options,
      );
      const data = camelCaseObject(response.data);
      const requests = transformRequests(data.results);
      setCodeRequests({
        requests,
        pageCount: data.numPages,
        itemCount: data.count,
      });
    } catch (err) {
      logError(err);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  /**
   * Fetches counts of each coupon code request state for use in the table filters
   * on initial component mount.
   */
  useEffect(() => {
    if (!isMounted) { return; }
    fetchOverview();
    fetchRequests();
  }, [isMounted, searchOptions]);

  /**
   * Handles table pagination/filter/sort changes.
   *
   * @param {Object} args See Paragon documentation on the args passed to the
   * callback fn of `fetchData`.
   */
  const handleFetchRequests = useCallback(
    (args) => {
      const requestStatusFilters = args.filters.find(filter => filter.id === 'requestStatus')?.value;
      const page = args.pageIndex + 1;
      const query = args.filters.find(filter => filter.id === 'email')?.value || '';
      debouncedSetSearchOptions({
        page,
        query,
        filters: {
          requestStatus: requestStatusFilters,
        },
      });
    },
    [],
  );

  const handleApprove = (row) => console.log('approve', row);
  const handleDecline = (row) => console.log('decline', row);

  return (
    <Stack gap={2}>
      <div>
        <h2>Enrollment requests</h2>
        <p>Approve or decline enrollment requests for individual learners below.</p>
      </div>
      <SubsidyRequestManagementTable
        pageCount={codeRequests.pageCount}
        itemCount={codeRequests.itemCount}
        data={codeRequests.requests}
        fetchData={handleFetchRequests}
        requestStatusFilterChoices={codeRequestsOverview}
        onApprove={handleApprove}
        onDecline={handleDecline}
        isLoading={isLoading}
        initialTableOptions={{
          getRowId: row => row.uuid,
        }}
        initialState={{
          pageSize: PAGE_SIZE,
          pageIndex: 0,
        }}
      />
    </Stack>
  );
};

ManageRequestsTab.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(ManageRequestsTab);
