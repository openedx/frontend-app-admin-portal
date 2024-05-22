import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Hyperlink } from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform/config';
import { useNavigate, useLocation } from 'react-router-dom';

import { FormattedMessage } from '@edx/frontend-platform/i18n';
import LearnerCreditAllocationTable from './LearnerCreditAllocationTable';
import { useBudgetId, useBudgetRedemptions } from './data';

const BudgetDetailRedemptions = ({ enterpriseFeatures, enterpriseUUID }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state: locationState } = location;
  const { enterpriseOfferId, subsidyAccessPolicyId } = useBudgetId();
  const spentHeadingRef = useRef();
  const {
    isLoading,
    budgetRedemptions,
    fetchBudgetRedemptions,
  } = useBudgetRedemptions(
    enterpriseUUID,
    enterpriseOfferId,
    subsidyAccessPolicyId,
    enterpriseFeatures.topDownAssignmentRealTimeLcm,
  );

  useEffect(() => {
    if (locationState?.budgetActivityScrollToKey === 'spent') {
      spentHeadingRef.current?.scrollIntoView({ behavior: 'smooth' });
      const newState = { ...locationState };
      delete newState.budgetActivityScrollToKey;
      navigate(location.pathname, { ...location, state: newState });
    }
  }, [navigate, location, locationState]);

  return (
    <section data-testid="spent-section">
      <h3 className="mb-3" ref={spentHeadingRef}>
        <FormattedMessage
          id="lcm.budget.detail.page.spent.heading"
          defaultMessage="Spent"
          description="Heading for the spent section of the budget detail page"
        />
      </h3>
      <p className="small mb-4">
        <FormattedMessage
          id="lcm.budget.detail.page.spent.description"
          defaultMessage="Spent activity is driven by completed enrollments."
          description="Description for the spent section of the budget detail page"
        />
        {(enterpriseOfferId || (subsidyAccessPolicyId && !enterpriseFeatures.topDownAssignmentRealTimeLcm)) ? (
          <FormattedMessage
            id="lcm.budget.detail.page.spent.description.enterprise"
            defaultMessage="Enrollment data is automatically updated every 12 hours. Come back later to view more recent enrollments."
            description="Description for the spent section of the budget detail page for enterprise users"
          />
        ) : (
          <FormattedMessage
            id="lcm.budget.detail.page.spent.description.learn.more"
            defaultMessage="<a>Learn more</a>"
            description="Description for the spent section of the budget detail page with a link to learn more"
            values={{
              // eslint-disable-next-line react/no-unstable-nested-components
              a: (chunks) => (
                <Hyperlink destination={getConfig().ENTERPRISE_SUPPORT_LEARNER_CREDIT_URL} target="_blank">
                  {chunks}
                </Hyperlink>
              ),
            }}
          />
        )}
      </p>
      <LearnerCreditAllocationTable
        isLoading={isLoading}
        tableData={budgetRedemptions}
        fetchTableData={fetchBudgetRedemptions}
      />
    </section>
  );
};

const mapStateToProps = state => ({
  enterpriseFeatures: state.portalConfiguration.enterpriseFeatures,
  enterpriseUUID: state.portalConfiguration.enterpriseId,
});

BudgetDetailRedemptions.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
  enterpriseFeatures: PropTypes.shape({
    topDownAssignmentRealTimeLcm: PropTypes.bool,
  }).isRequired,
};

export default connect(mapStateToProps)(BudgetDetailRedemptions);
