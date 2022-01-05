import React, { createContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { useCustomerAgreementData } from './data/hooks';

export const SettingsContext = createContext({});

function SettingsContextProvider({ children, enterpriseId }) {
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

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(SettingsContextProvider);
