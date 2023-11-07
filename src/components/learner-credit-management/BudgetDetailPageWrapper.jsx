import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { Container, Toast } from '@edx/paragon';

import Hero from '../Hero';
import { useSuccessfulAssignmentToastContextValue } from './data';

const PAGE_TITLE = 'Learner Credit Management';

export const BudgetDetailPageContext = React.createContext();

const BudgetDetailPageWrapper = ({
  subsidyAccessPolicy,
  includeHero,
  children,
}) => {
  // display name is an optional field, and may not be set for all budgets so fallback to "Overview"
  // similar to the display name logic for budgets on the overview page route.
  const budgetDisplayName = subsidyAccessPolicy?.displayName || 'Overview';
  const helmetPageTitle = budgetDisplayName ? `${budgetDisplayName} - ${PAGE_TITLE}` : PAGE_TITLE;

  const successfulAssignmentToastContextValue = useSuccessfulAssignmentToastContextValue();
  const {
    isSuccessfulAssignmentAllocationToastOpen,
    successfulAssignmentAllocationToastMessage,
    closeToastForAssignmentAllocation,
  } = successfulAssignmentToastContextValue;

  return (
    <BudgetDetailPageContext.Provider value={successfulAssignmentToastContextValue}>
      <Helmet title={helmetPageTitle} />
      {includeHero && <Hero title={PAGE_TITLE} />}
      <Container className="py-3" fluid>
        {children}
      </Container>
      {/**
        Successful assignment allocation Toast notification. It is rendered here to guarantee that the
        Toast component will not be unmounted when the user programmatically navigates to the "Activity"
        tab, which will unmount the course cards that rendered the assignment modal. Thus, the Toast must
        be rendered within the component tree that's common to both the "Activity" and "Overview" tabs.
      */}
      <Toast
        onClose={closeToastForAssignmentAllocation}
        show={isSuccessfulAssignmentAllocationToastOpen}
      >
        {successfulAssignmentAllocationToastMessage}
      </Toast>
    </BudgetDetailPageContext.Provider>
  );
};

BudgetDetailPageWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  subsidyAccessPolicy: PropTypes.shape(),
  includeHero: PropTypes.bool,
};

BudgetDetailPageWrapper.defaultProps = {
  includeHero: true,
  subsidyAccessPolicy: undefined,
};

export default BudgetDetailPageWrapper;
