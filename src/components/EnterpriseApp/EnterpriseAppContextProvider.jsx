import React, { createContext, useMemo } from 'react';
import PropTypes from 'prop-types';

import { EnterpriseSubsidiesContext, useEnterpriseSubsidiesContext } from '../EnterpriseSubsidiesContext';
import { SubsidyRequestsContext, useSubsidyRequestsContext } from '../subsidy-requests/SubsidyRequestsContext';
import { useEnterpriseCurationContext } from './data/hooks';
import EnterpriseAppSkeleton from './EnterpriseAppSkeleton';

/**
 * @typedef THighlightSet
 * @property {String} uuid
 * @property {Boolean} isPublished
 * @property {String} title
 * @property {String[]} highlightedContentUuids
 */

/**
 * @typedef TEnterpriseCuration
 * @property {String} uuid
 * @property {String} title
 * @property {Boolean} isHighlightFeatureActive
 * @property {THighlightSet[]} highlightSets
 * @property {String} created
 * @property {String} modified
 */

/**
 * @typedef TEnterpriseCurationData
 * @property {TEnterpriseCuration} enterpriseCuration
 * @property {Boolean} isLoading
 * @property {Error} fetchError
 */

/**
 * @typedef {Object} TEnterpriseAppContext
 * @property {TEnterpriseCurationData} enterpriseCuration
 */

/** @type {React.Context<TEnterpriseAppContext>} */
export const EnterpriseAppContext = createContext();

function EnterpriseAppContextProvider({
  enterpriseId,
  enterpriseName,
  enablePortalLearnerCreditManagementScreen,
  children,
}) {
  // subsidies for the enterprise customer
  const enterpriseSubsidiesContext = useEnterpriseSubsidiesContext({
    enterpriseId,
    enablePortalLearnerCreditManagementScreen,
  });

  // subsidy requests for the enterprise customer
  const {
    enterpriseSubsidyTypes,
  } = enterpriseSubsidiesContext;
  const subsidyRequestsContext = useSubsidyRequestsContext({ enterpriseId, enterpriseSubsidyTypes });

  // content highlights for the enterprise customer
  const enterpriseCurationContext = useEnterpriseCurationContext({
    enterpriseId,
    curationTitleForCreation: enterpriseName,
  });

  const isLoading = (
    subsidyRequestsContext.isLoading
    || enterpriseSubsidiesContext.isLoading
    || enterpriseCurationContext.isLoading
  );

  // [tech debt] consolidate the other context values (e.g., useSubsidyRequestsContext)
  // into a singular `EnterpriseAppContext.Provider`.
  const enterpriseAppContext = useMemo(() => ({
    enterpriseCuration: enterpriseCurationContext,
  }), [enterpriseCurationContext]);

  if (isLoading) {
    return <EnterpriseAppSkeleton />;
  }

  return (
    <EnterpriseAppContext.Provider value={enterpriseAppContext}>
      {/* [tech debt] consolidate EnterpriseSubsidiesContext and SubsidyRequestsContext into EnterpriseAppContext */}
      <EnterpriseSubsidiesContext.Provider value={enterpriseSubsidiesContext}>
        <SubsidyRequestsContext.Provider value={subsidyRequestsContext}>
          {children}
        </SubsidyRequestsContext.Provider>
      </EnterpriseSubsidiesContext.Provider>
    </EnterpriseAppContext.Provider>
  );
}

EnterpriseAppContextProvider.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  enterpriseName: PropTypes.string.isRequired,
  enablePortalLearnerCreditManagementScreen: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
};

export default EnterpriseAppContextProvider;
