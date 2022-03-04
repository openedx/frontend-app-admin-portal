import React, {
  useCallback, useEffect, useState,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Stack } from '@edx/paragon';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';

import SubsidyRequestManagementTable, {
  transformRequestOverview,
  transformRequests,
} from '../SubsidyRequestManagementTable';
import EnterpriseAccessApiService from '../../data/services/EnterpriseAccessApiService';

export const PAGE_SIZE = 20;

const ManageRequestsTab = ({ enterpriseId }) => {
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
   *
   * TODO: will need to handle when a search query (email) is present
   */
  const fetchOverview = async () => {
    setIsLoadingRequestsOverview(true);
    try {
      const response = await EnterpriseAccessApiService.getCouponCodeRequestOverview(enterpriseId);
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
   * Fetches license requests from the API.
   *
   * TODO: will need to handle when a search query (email) is present
   *
   * @param {integer} page Page number
   * @param {Array} requestStatusFilters List of statuses to filter requests, e.g., ['requested', 'approved']
   */
  const fetchRequests = async (page, requestStatusFilters) => {
    setIsLoadingRequests(true);
    try {
      const options = {
        page,
        page_size: PAGE_SIZE,
      };
      const response = await EnterpriseAccessApiService.getCouponCodeRequests(
        enterpriseId, requestStatusFilters, options,
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
   * Fetches counts of each license request state for use in the table filters
   * on initial component mount.
   */
  useEffect(() => { fetchOverview(); }, []);

  /**
   * Fetches license requests data from the API on initial component mount, and
   * pagination/filter/sort changes.
   *
   * @param {Object} args See Paragon documentation on the args passed to the
   * callback fn of `fetchData`.
   */
  const handleFetchRequests = useCallback(
    (args) => {
      const requestStatusFilters = args.filters.find(filter => filter.id === 'requestStatus')?.value;
      const page = args.pageIndex + 1;
      fetchRequests(page, requestStatusFilters);
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
