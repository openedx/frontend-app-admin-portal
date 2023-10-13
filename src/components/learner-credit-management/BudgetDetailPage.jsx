import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Row,
  Col,
  Breadcrumb,
  Container,
  Skeleton,
} from '@edx/paragon';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Hero from '../Hero';

import { EnterpriseSubsidiesContext } from '../EnterpriseSubsidiesContext';

import { ROUTE_NAMES } from '../EnterpriseApp/data/constants';
import BudgetDetailTabsAndRoutes from './BudgetDetailTabsAndRoutes';
import BudgetDetailActivityTabContents from './BudgetDetailActivityTabContents';

const PAGE_TITLE = 'Learner Credit Management';

const BudgetDetailPage = ({
  enterpriseUUID,
  enterpriseSlug,
  enableLearnerPortal,
  enterpriseFeatures,
}) => {
  const { isLoading } = useContext(EnterpriseSubsidiesContext);

  if (isLoading) {
    return <Skeleton height="100%" className="sr-only" />;
  }
  const links = [
    {
      label: 'Budgets',
      to: `/${enterpriseSlug}/admin/${ROUTE_NAMES.learnerCredit}`,
    },
  ];

  const isTopDownAssignmentRealTimeLcmEnabled = enterpriseFeatures?.topDownAssignmentRealTimeLcm;
  // assignments.length > 0 && subsidyAccessPolicyType === 'AssignedLearnerCreditAccessPolicy'
  const hasPendingAssignments = false;
  // offerRedemptions.length > 0;
  const hasCompletedTransactions = true;
  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <Hero title={PAGE_TITLE} />
      <Container className="py-3" fluid>
        <Row>
          <Col className="small">
            <Breadcrumb
              ariaLabel="Learner Credit Management breadcrumb navigation"
              links={links}
              linkAs={Link}
              activeLabel="Overview"
            />
          </Col>
        </Row>
        {/* <BudgetDetailTabsAndRoutes /> */}
        <BudgetDetailActivityTabContents
          isTopDownAssignmentRealTimeLcmEnabled={isTopDownAssignmentRealTimeLcmEnabled}
          hasPendingAssignments={hasPendingAssignments}
          hasCompletedTransactions={hasCompletedTransactions}
          enterpriseUUID={enterpriseUUID}
          enterpriseSlug={enterpriseSlug}
          enterpriseLearnerPortal={enableLearnerPortal}
        />
      </Container>
    </>
  );
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enableLearnerPortal: state.portalConfiguration.enableLearnerPortal,
  enterpriseFeatures: state.portalConfiguration.enterpriseFeatures,
});

BudgetDetailPage.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  enableLearnerPortal: PropTypes.bool.isRequired,
  enterpriseFeatures: PropTypes.shape({
    topDownAssignmentRealTimeLcm: PropTypes.bool,
  }).isRequired,
};

export default connect(mapStateToProps)(BudgetDetailPage);
