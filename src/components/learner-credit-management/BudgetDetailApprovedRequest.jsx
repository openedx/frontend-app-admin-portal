import React, { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Hyperlink } from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform/config';
import { useNavigate, useLocation } from 'react-router-dom';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import useBnrSubsidyRequests from './data/hooks/useBnrSubsidyRequests';
import { SUBSIDY_REQUEST_STATUS } from '../../data/constants/subsidyRequests';
import BudgetDetailApprovedRequestTable from './BudgetDetailApprovedRequestTable';

const BudgetDetailApprovedRequestHeader = () => {
  const approvedHeadingRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();
  const { state: locationState } = location;

  useEffect(() => {
    if (locationState?.budgetActivityScrollToKey === 'approved-requests') {
      approvedHeadingRef.current?.scrollIntoView({ behavior: 'smooth' });
      const newState = { ...locationState };
      delete newState.budgetActivityScrollToKey;
      navigate(location.pathname, {
        ...location,
        state: newState,
        replace: true,
      });
    }
  }, [navigate, location, locationState]);

  return (
    <>
      <h3 className="mb-3" ref={approvedHeadingRef}>
        <FormattedMessage
          id="lcm.budget.detail.page.approved.requests.heading"
          defaultMessage="Pending"
          description="Heading for the approved requests section on the budget detail page activty tab"
        />
      </h3>
      <p className="small mb-4">
        <FormattedMessage
          id="lcm.budget.detail.page.approved.requests.description"
          defaultMessage="pending activity earmarks funds in your budget so you can’t overspend. For funds to move from pending to spent, your learners must complete enrollment. <a>Learn more</a>"
          description="Description for the approved requests section on the budget detail page. Includes a link to learn more."
          values={{
            // eslint-disable-next-line react/no-unstable-nested-components
            a: (chunks) => (
              <Hyperlink
                destination={getConfig().ENTERPRISE_SUPPORT_LEARNER_CREDIT_URL}
                target="_blank"
              >
                {chunks}
              </Hyperlink>
            ),
          }}
        />
      </p>
    </>
  );
};

const BudgetDetailApprovedRequest = ({ enterpriseId }) => {
  const { isLoading, bnrRequests, fetchBnrRequests } = useBnrSubsidyRequests({ enterpriseId });

  const fetchApprovedRequests = useCallback(
    (args = {}) => {
      const filters = args.filters || [];
      // Add an approved status filter in the format expected by the hook
      const updatedFilters = [
        ...filters.filter((f) => f.id !== 'requestStatus'),
        { id: 'requestStatus', value: [SUBSIDY_REQUEST_STATUS.APPROVED] },
      ];
      return fetchBnrRequests({ ...args, filters: updatedFilters });
    },
    [fetchBnrRequests],
  );

  // Transform the data to match the expected table format
  // Generate status counts from the actual results data
  const statusCounts = {};
  (bnrRequests.results || []).forEach((request) => {
    const { lastActionStatus } = request;
    if (lastActionStatus) {
      statusCounts[lastActionStatus] = (statusCounts[lastActionStatus] || 0) + 1;
    }
  });

  const requestStatusCounts = Object.entries(statusCounts).map(
    ([lastActionStatus, count]) => ({
      lastActionStatus,
      count,
    }),
  );

  const approvedRequests = {
    count: bnrRequests.itemCount || 0,
    numPages: bnrRequests.pageCount || 1,
    results: bnrRequests.results || [],
    requestStatusCounts,
  };

  return (
    <section className="budget-detail-approved-requests">
      <BudgetDetailApprovedRequestHeader />
      <BudgetDetailApprovedRequestTable
        isLoading={isLoading}
        tableData={approvedRequests}
        fetchTableData={fetchApprovedRequests}
      />
    </section>
  );
};

BudgetDetailApprovedRequest.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(BudgetDetailApprovedRequest);
