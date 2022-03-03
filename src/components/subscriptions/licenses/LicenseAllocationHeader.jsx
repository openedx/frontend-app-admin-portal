import React, { useContext } from 'react';
import { SubscriptionDetailContext } from '../SubscriptionDetailContextProvider';
import LicenseAllocationBanner from './LicenseAllocationBanner';
import BrowseAndRequestAlert from './BrowseAndRequestAlert';

const LicenseAllocationHeader = () => {
  const {
    subscription,
  } = useContext(SubscriptionDetailContext);

  return (
    <>
      <BrowseAndRequestAlert />
      <h2 className="mb-2">License Allocation</h2>
      <p className="lead">
        {subscription.licenses?.allocated}
        {' of '}
        {subscription.licenses?.total} licenses allocated
      </p>
      <LicenseAllocationBanner />
    </>
  );
};

export default LicenseAllocationHeader;
