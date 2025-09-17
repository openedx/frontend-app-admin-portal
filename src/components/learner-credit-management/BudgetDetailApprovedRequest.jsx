import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Hyperlink } from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform/config';
import { useNavigate, useLocation } from 'react-router-dom';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import useBnrSubsidyRequests from './data/hooks/useBnrSubsidyRequests';
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
          defaultMessage="Pending activity earmarks funds in your budget so you can’t overspend. For funds to move from pending to spent, your learners must complete enrollment. <a>Learn more</a>"
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
  const { isLoading, bnrRequests, fetchApprovedRequests } = useBnrSubsidyRequests({ enterpriseId });

  const approvedRequests = {
    count: bnrRequests.itemCount || 0,
    numPages: bnrRequests.pageCount || 1,
    results: bnrRequests.results || [],
    requestStatusCounts: bnrRequests.learnerRequestStateCounts || [],
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
