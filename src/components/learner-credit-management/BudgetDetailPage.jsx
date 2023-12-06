import React from 'react';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Skeleton, Stack } from '@edx/paragon';

import { connect } from 'react-redux';
import { useBudgetId, useSubsidyAccessPolicy } from './data';
import BudgetDetailTabsAndRoutes from './BudgetDetailTabsAndRoutes';
import BudgetDetailPageWrapper from './BudgetDetailPageWrapper';
import BudgetDetailPageHeader from './BudgetDetailPageHeader';
import NotFoundPage from '../NotFoundPage';
import { ROUTE_NAMES } from '../EnterpriseApp/data/constants';

const BudgetDetailPage = ({ enterpriseSlug }) => {
  const { subsidyAccessPolicyId, enterpriseOfferId } = useBudgetId();
  const {
    data: subsidyAccessPolicy,
    isInitialLoading: isSubsidyAccessPolicyInitialLoading,
    isError: isSubsidyAccessPolicyError,
    error,
  } = useSubsidyAccessPolicy(subsidyAccessPolicyId);

  if (isSubsidyAccessPolicyInitialLoading) {
    return (
      <BudgetDetailPageWrapper includeHero={false}>
        <Skeleton height={25} />
        <Skeleton height={50} />
        <Skeleton height={360} />
        <Skeleton height={360} />
        <span className="sr-only">loading budget details</span>
      </BudgetDetailPageWrapper>
    );
  }
  // If the budget has a subsidyAccessPolicy but is not active, or the subsidyAccessPolicyId is invalid
  // we should redirect the user to the budget list page.
  if (!enterpriseOfferId && !subsidyAccessPolicyId) {
    // TODO: In the react router v6 upgrade, refactor to the Navigate component
    return <Redirect to={`/${enterpriseSlug}/admin/${ROUTE_NAMES.learnerCredit}`} />;
  }

  // If the budget is intended to be a subsidy access policy (by presence of a policy UUID),
  // and the subsidy access policy is not found, show 404 messaging.
  if (subsidyAccessPolicyId && isSubsidyAccessPolicyError && error?.customAttributes.httpErrorStatus === 404) {
    return <NotFoundPage />;
  }

  return (
    <BudgetDetailPageWrapper subsidyAccessPolicy={subsidyAccessPolicy}>
      <Stack gap={4}>
        <BudgetDetailPageHeader />
        <BudgetDetailTabsAndRoutes />
      </Stack>
    </BudgetDetailPageWrapper>
  );
};

BudgetDetailPage.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(BudgetDetailPage);
