import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Row,
  Col,
  Breadcrumb,
  Container,
  Tab,
  Tabs,
} from '@edx/paragon';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import Hero from '../Hero';

import LoadingMessage from '../LoadingMessage';
import { EnterpriseSubsidiesContext } from '../EnterpriseSubsidiesContext';

import LearnerCreditAllocationTable from './LearnerCreditAllocationTable';
import { useOfferRedemptions } from './data/hooks';
import { isUUID } from './data/utils';
import { ROUTE_NAMES } from '../EnterpriseApp/data/constants';
import NoBudgetActivityCard from './NoBudgetActivityCard';

const PAGE_TITLE = 'Learner Credit Management';

const BudgetDetailPage = ({
  enterpriseUUID,
  enterpriseSlug,
  enableLearnerPortal,
  enterpriseFeatures,
}) => {
  const { budgetId } = useParams();
  const enterpriseOfferId = isUUID(budgetId) ? null : budgetId;
  const subsidyAccessPolicyId = isUUID(budgetId) ? budgetId : null;
  const [activeTab, setActiveTab] = useState('activity');

  const { isLoading } = useContext(EnterpriseSubsidiesContext);
  const {
    isLoading: isLoadingOfferRedemptions,
    offerRedemptions,
    fetchOfferRedemptions,
  } = useOfferRedemptions(enterpriseUUID, enterpriseOfferId, subsidyAccessPolicyId);
  if (isLoading) {
    return <LoadingMessage className="offers" />;
  }
  const links = [
    { label: 'Budgets', to: `/${enterpriseSlug}/admin/${ROUTE_NAMES.learnerCredit}` },
  ];

  const isTopDownAssignmentRealTimeLcmEnabled = enterpriseFeatures?.top_down_assignment_real_time_lcm || true;
  // assignments.length > 0 && subsidyAccessPolicyType === 'PerLearnerSpendCreditAccessPolicy'
  const hasPendingAssignments = true;
  const hasCompletedTransactions = offerRedemptions.length > 0;

  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <Hero title={PAGE_TITLE} />
      <Container className="py-3" fluid>
        <Row className="m-3">
          <Col xs="12">
            <Breadcrumb
              ariaLabel="Learner Credit Management breadcrumb navigation"
              links={links}
              linkAs={Link}
              activeLabel="Overview"
            />
          </Col>
        </Row>
        <Tabs
          id="controlled-tab-example"
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
        >
          <Tab eventKey="activity" title="Activity">
            {isTopDownAssignmentRealTimeLcmEnabled ? (
              <>
                {(!hasPendingAssignments && !hasCompletedTransactions) && <NoBudgetActivityCard />}
                {(!hasPendingAssignments && hasCompletedTransactions) && (
                  <>
                    <NoBudgetActivityCard />
                    <LearnerCreditAllocationTable
                      isLoading={isLoadingOfferRedemptions}
                      tableData={offerRedemptions}
                      fetchTableData={fetchOfferRedemptions}
                      enterpriseUUID={enterpriseUUID}
                      enterpriseSlug={enterpriseSlug}
                      enableLearnerPortal={enableLearnerPortal}
                    />
                  </>
                )}
                {(hasPendingAssignments && !hasCompletedTransactions) && (
                  <h4>Assignments Table</h4>
                )}
                {(hasPendingAssignments && hasCompletedTransactions) && (
                  <>
                    <h4>Assignments Table</h4>
                    <LearnerCreditAllocationTable
                      isLoading={isLoadingOfferRedemptions}
                      tableData={offerRedemptions}
                      fetchTableData={fetchOfferRedemptions}
                      enterpriseUUID={enterpriseUUID}
                      enterpriseSlug={enterpriseSlug}
                      enableLearnerPortal={enableLearnerPortal}
                    />
                  </>
                )}
              </>
            ) : (
              <LearnerCreditAllocationTable
                isLoading={isLoadingOfferRedemptions}
                tableData={offerRedemptions}
                fetchTableData={fetchOfferRedemptions}
                enterpriseUUID={enterpriseUUID}
                enterpriseSlug={enterpriseSlug}
                enableLearnerPortal={enableLearnerPortal}
              />
            )}
          </Tab>
          <Tab eventKey="catalog" title="Catalog">
            <h4>Catalog Table</h4>
          </Tab>
        </Tabs>
      </Container>
    </>
  );
};

const mapStateToProps = state => ({
  enterpriseUUID: state.portalConfiguration.enterpriseId,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enableLearnerPortal: state.portalConfiguration.enableLearnerPortal,
  enterpriseFeatures: state.portalConfiguration.enterpriseFeatures,
});

BudgetDetailPage.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  enableLearnerPortal: PropTypes.bool.isRequired,
  enterpriseFeatures: PropTypes.shape({
    top_down_assignment_real_time_lcm: PropTypes.bool,
  }).isRequired,
};

export default connect(mapStateToProps)(BudgetDetailPage);
