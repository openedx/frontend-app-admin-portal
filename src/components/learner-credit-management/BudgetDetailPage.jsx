import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Row,
  Col,
  Breadcrumb,
  Container,
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

const PAGE_TITLE = 'Learner Credit Management';

const BudgetDetailPage = ({
  enterpriseUUID,
  enterpriseSlug,
  enableLearnerPortal,
}) => {
  const { budgetId } = useParams();
  const enterpriseOfferId = isUUID(budgetId) ? null : budgetId;
  const subsidyAccessPolicyId = isUUID(budgetId) ? budgetId : null;

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
        <LearnerCreditAllocationTable
          isLoading={isLoadingOfferRedemptions}
          tableData={offerRedemptions}
          fetchTableData={fetchOfferRedemptions}
          enterpriseUUID={enterpriseUUID}
          enterpriseSlug={enterpriseSlug}
          enableLearnerPortal={enableLearnerPortal}
        />
      </Container>
    </>
  );
};

const mapStateToProps = state => ({
  enterpriseUUID: state.portalConfiguration.enterpriseId,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enableLearnerPortal: state.portalConfiguration.enableLearnerPortal,
});

BudgetDetailPage.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  enableLearnerPortal: PropTypes.bool.isRequired,
};

export default connect(mapStateToProps)(BudgetDetailPage);
