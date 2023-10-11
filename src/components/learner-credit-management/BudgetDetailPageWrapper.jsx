import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { Container } from '@edx/paragon';

import Hero from '../Hero';

const PAGE_TITLE = 'Learner Credit Management';

const BudgetDetailPageWrapper = ({ subsidyAccessPolicy, children }) => {
  // display name is an optional field, and may not be set for all budgets so fallback to "Overview"
  // similar to the display name logic for budgets on the overview page route.
  const budgetDisplayName = subsidyAccessPolicy?.displayName || 'Overview';
  const helmetPageTitle = budgetDisplayName ? `${budgetDisplayName} - ${PAGE_TITLE}` : PAGE_TITLE;
  return (
    <>
      <Helmet title={helmetPageTitle} />
      <Hero title={PAGE_TITLE} />
      <Container className="py-3" fluid>
        {children}
      </Container>
    </>
  );
};

BudgetDetailPageWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  subsidyAccessPolicy: PropTypes.shape(),
};

export default BudgetDetailPageWrapper;
