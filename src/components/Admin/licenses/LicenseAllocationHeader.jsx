import React, { useContext } from 'react';
import { Badge } from '@edx/paragon';
import { SubscriptionDetailContext } from '../../subscriptions/SubscriptionDetailContextProvider';
import { SubsidyRequestsContext } from '../../subsidy-requests';
import NewFeatureAlertBrowseAndRequest from '../../NewFeatureAlertBrowseAndRequest';
import { SUPPORTED_SUBSIDY_TYPES } from '../../../data/constants/subsidyRequests';

const LicenseAllocationHeader = () => {
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
      <div className="ml-4">
        <h4 style={{ display: 'inline-block' }}>Licenses:</h4>
        <Badge className="mr-2 ml-2" variant="light">Unassigned: {subscription.licenses?.unassigned}
          {' of '}
          {subscription.licenses?.total} total
        </Badge>
        <Badge variant="light">Activated: {subscription.licenses?.activated}
          {' of '}
          {subscription.licenses?.assigned} assigned
        </Badge>
      </div>
    </>
  );
};

export default LicenseAllocationHeader;
