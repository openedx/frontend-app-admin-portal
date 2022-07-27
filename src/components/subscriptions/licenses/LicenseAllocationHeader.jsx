import React, { useContext } from 'react';
import { SubscriptionDetailContext } from '../SubscriptionDetailContextProvider';
import { SubsidyRequestsContext } from '../../subsidy-requests';
import NewFeatureAlertBrowseAndRequest from '../../NewFeatureAlertBrowseAndRequest';
import { SUPPORTED_SUBSIDY_TYPES } from '../../../data/constants/subsidyRequests';

function LicenseAllocationHeader() {
  const {
    subscription,
  } = useContext(SubscriptionDetailContext);
  const { subsidyRequestConfiguration } = useContext(SubsidyRequestsContext);

  // don't show alert if the enterprise already has subsidy requests enabled
  const isBrowseAndRequestFeatureAlertShown = subsidyRequestConfiguration?.subsidyType
    === SUPPORTED_SUBSIDY_TYPES.license && !subsidyRequestConfiguration?.subsidyRequestsEnabled;

  return (
    <>
      {isBrowseAndRequestFeatureAlertShown && <NewFeatureAlertBrowseAndRequest />}
      <h2 className="mb-2">License Allocation</h2>
      <p className="lead">
        {subscription.licenses?.allocated}
        {' of '}
        {subscription.licenses?.total} licenses allocated
      </p>
    </>
  );
}

export default LicenseAllocationHeader;
