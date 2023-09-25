import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Row,
  Col,
  Breadcrumb,
} from '@edx/paragon';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import Hero from '../Hero';

import LoadingMessage from '../LoadingMessage';
import { EnterpriseSubsidiesContext } from '../EnterpriseSubsidiesContext';

import LearnerCreditAllocationTable from './LearnerCreditAllocationTable';
import { useOfferRedemptions } from './data/hooks';
import { isUUID } from './data/utils';
import { ROUTE_NAMES } from '../EnterpriseApp/data/constants';

const PAGE_TITLE = 'Learner Credit Budget Detail';

const BudgetDetailPage = ({
  enterpriseUUID,
  enterpriseSlug,
}) => {
  const { id } = useParams();
  const offerId = isUUID(id) ? null : id;
  const budgetId = isUUID(id) ? id : null;

  const { isLoading } = useContext(EnterpriseSubsidiesContext);
  const {
    isLoading: isLoadingOfferRedemptions,
    offerRedemptions,
    fetchOfferRedemptions,
  } = useOfferRedemptions(enterpriseUUID, offerId, budgetId);
  if (isLoading) {
    return <LoadingMessage className="offers" />;
  }
  const links = [
    { label: 'Budgets', href: `/${enterpriseSlug}/admin/${ROUTE_NAMES.learnerCredit}` },
  ];
  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <Hero title={PAGE_TITLE} />
      <Row className="m-3">
        <Col xs="12">
          <Breadcrumb
            ariaLabel="Breadcrumb"
            links={links}
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
        enableLearnerPortal
      />
    </>
  );
};

const mapStateToProps = state => ({
  enterpriseUUID: state.portalConfiguration.enterpriseId,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

BudgetDetailPage.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
};

export default connect(mapStateToProps)(BudgetDetailPage);
