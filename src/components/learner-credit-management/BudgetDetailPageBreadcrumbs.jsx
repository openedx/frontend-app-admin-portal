import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Breadcrumb } from '@edx/paragon';
import { Link } from 'react-router-dom';
import React from 'react';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { ROUTE_NAMES } from '../EnterpriseApp/data/constants';
import EVENT_NAMES from '../../eventTracking';
import { useBudgetId, useSubsidyAccessPolicy } from './data';

const BudgetDetailPageBreadcrumbs = ({ enterpriseId, enterpriseSlug, budgetDisplayName }) => {
  const { subsidyAccessPolicyId } = useBudgetId();
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);

  const trackEventMetadata = {};
  if (subsidyAccessPolicy) {
    const {
      subsidyUuid, assignmentConfiguration, isSubsidyActive, catalogUuid, aggregates, isAssignable,
    } = subsidyAccessPolicy;
    Object.assign(
      trackEventMetadata,
      {
        subsidyUuid,
        assignmentConfiguration,
        isSubsidyActive,
        isAssignable,
        catalogUuid,
        aggregates,
      },
    );
  }

  return (
    <div className="small">
      <Breadcrumb
        ariaLabel="Learner Credit Management breadcrumb navigation"
        links={[{
          label: 'Budgets',
          to: `/${enterpriseSlug}/admin/${ROUTE_NAMES.learnerCredit}`,
        }]}
        linkAs={Link}
        activeLabel={budgetDisplayName}
        clickHandler={() => sendEnterpriseTrackEvent(
          enterpriseId,
          EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT.BREADCRUMB_FROM_BUDGET_DETAIL_TO_BUDGETS,
          trackEventMetadata,
        )}
      />
    </div>
  );
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

BudgetDetailPageBreadcrumbs.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  budgetDisplayName: PropTypes.string.isRequired,
};

export default connect(mapStateToProps)(BudgetDetailPageBreadcrumbs);
