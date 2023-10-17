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
import { Link } from 'react-router-dom';
import Hero from '../Hero';

import LoadingMessage from '../LoadingMessage';
import { EnterpriseSubsidiesContext } from '../EnterpriseSubsidiesContext';
import { ROUTE_NAMES } from '../EnterpriseApp/data/constants';
import BudgetDetailTabsAndRoutes from './BudgetDetailTabsAndRoutes';
import BudgetAggregates from './BudgetAggregates';

const PAGE_TITLE = 'Learner Credit Management';

const BudgetDetailPage = ({ enterpriseSlug }) => {
  const { isLoading, offers } = useContext(EnterpriseSubsidiesContext);

  if (isLoading) {
    return <LoadingMessage className="offers" />;
  }
  const links = [
    {
      label: 'Budgets',
      to: `/${enterpriseSlug}/admin/${ROUTE_NAMES.learnerCredit}`,
    },
  ];
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
        <BudgetAggregates offers={offers} />
        <BudgetDetailTabsAndRoutes />
      </Container>
    </>
  );
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

BudgetDetailPage.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
};

export default connect(mapStateToProps)(BudgetDetailPage);
