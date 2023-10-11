import React, { createContext, useMemo } from 'react';
import PropTypes from 'prop-types';

export const BudgetDetailPageContext = createContext();

const BudgetDetailPageContextProvider = ({
  isLoadingSubsidyAccessPolicy,
  subsidyAccessPolicy,
  children,
}) => {
  const contextValue = useMemo(() => ({
    isLoadingSubsidyAccessPolicy,
    subsidyAccessPolicy,
  }), [
    isLoadingSubsidyAccessPolicy,
    subsidyAccessPolicy,
  ]);

  return (
    <BudgetDetailPageContext.Provider value={contextValue}>
      {children}
    </BudgetDetailPageContext.Provider>
  );
};

BudgetDetailPageContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
  isLoadingSubsidyAccessPolicy: PropTypes.bool.isRequired,
  subsidyAccessPolicy: PropTypes.shape(),
};

export default BudgetDetailPageContextProvider;
