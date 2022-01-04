import React, { createContext, useMemo } from 'react';
import PropTypes from 'prop-types';

import { useCustomerAgreementData } from './data/hooks';

export const SettingsContext = createContext({});

export default function SettingsContextProvider({ children, enterpriseId }) {
  const {
    customerAgreement,
    loadingCustomerAgreement,
  } = useCustomerAgreementData({ enterpriseId });

  const context = useMemo(() => ({
    enterpriseId,
    customerAgreement,
    loadingCustomerAgreement,
  }), [customerAgreement, loadingCustomerAgreement]);

  return (
    <SettingsContext.Provider value={context}>
      {children}
    </SettingsContext.Provider>
  );
}

SettingsContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
  enterpriseId: PropTypes.string.isRequired,
};
