import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Row, Col, Breadcrumb, Stack,
} from '@edx/paragon';

import { ROUTE_NAMES } from '../EnterpriseApp/data/constants';
import { useBudgetId, useSubsidyAccessPolicy } from './data';

const BudgetDetailPageHeader = ({ enterpriseSlug }) => {
  const { subsidyAccessPolicyId } = useBudgetId();
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);
  const budgetDisplayName = subsidyAccessPolicy?.displayName || 'Overview';
  return (
    <Stack gap={2}>
      <Row>
        <Col className="small">
          <Breadcrumb
            ariaLabel="Learner Credit Management breadcrumb navigation"
            links={[{
              label: 'Budgets',
              to: `/${enterpriseSlug}/admin/${ROUTE_NAMES.learnerCredit}`,
            }]}
            linkAs={Link}
            activeLabel={budgetDisplayName || 'Overview'}
          />
        </Col>
      </Row>
      {budgetDisplayName && (
        <Row>
          <Col>
            <h2 className="mb-0">{budgetDisplayName}</h2>
          </Col>
        </Row>
      )}
    </Stack>
  );
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

BudgetDetailPageHeader.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
};

export default connect(mapStateToProps)(BudgetDetailPageHeader);
