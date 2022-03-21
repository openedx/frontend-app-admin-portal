import React, { createContext, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { camelCaseObject } from '@edx/frontend-platform';
import { useCustomerAgreementData } from './data/hooks';
import { fetchCouponOrders } from '../../data/actions/coupons';
import LoadingMessage from '../LoadingMessage';

export const SettingsContext = createContext({});

function SettingsContextProvider({
  children,
  enterpriseId,
  fetchCoupons,
  loadingCoupons,
  couponsData,
}) {
  const {
    customerAgreement,
    loadingCustomerAgreement,
  } = useCustomerAgreementData({ enterpriseId });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const context = useMemo(() => ({
    enterpriseId,
    customerAgreement,
    couponsData,
  }), [customerAgreement, couponsData]);

  if (loadingCustomerAgreement || loadingCoupons) {
    return <LoadingMessage className="settings mt-3" />;
  }

  return (
    <SettingsContext.Provider value={context}>
      {children}
    </SettingsContext.Provider>
  );
}

SettingsContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
  enterpriseId: PropTypes.string.isRequired,
  loadingCoupons: PropTypes.bool.isRequired,
  couponsData: PropTypes.shape({
    results: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      endDate: PropTypes.string,
      title: PropTypes.string,
      numUnassigned: PropTypes.number,
      maxUses: PropTypes.number,
    })),
  }).isRequired,
  fetchCoupons: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
  loadingCoupons: state.coupons.loading,
  couponsData: state.coupons.data ? camelCaseObject(state.coupons.data) : { results: [] },
});

const mapDispatchToProps = dispatch => ({
  fetchCoupons: (options) => {
    dispatch(fetchCouponOrders(options));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(SettingsContextProvider);
