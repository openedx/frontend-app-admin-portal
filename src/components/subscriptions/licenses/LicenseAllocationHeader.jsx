import React, { useContext } from 'react';
import SearchBar from '../../SearchBar';
import { SubscriptionDetailContext } from '../SubscriptionDetailContextProvider';

const LicenseAllocationHeader = () => {
  const {
    setSearchQuery,
    subscription,
  } = useContext(SubscriptionDetailContext);
  return (
    <>
      <h2 className="mb-2">License Allocation</h2>
      <p className="lead">
        {subscription.licenses?.allocated}
        {' of '}
        {subscription.licenses?.total} licenses allocated
      </p>
      <div className="my-3 row">
        <div className="col-12 col-md-5 mb-3 mb-md-0">
          <SearchBar
            placeholder="Search by email..."
            onSearch={searchQuery => setSearchQuery(searchQuery)}
            onClear={() => setSearchQuery(null)}
          />
        </div>
      </div>
    </>
  );
};

export default LicenseAllocationHeader;
