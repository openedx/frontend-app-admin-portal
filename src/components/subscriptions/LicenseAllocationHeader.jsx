import React, { useContext } from 'react';
import SearchBar from '../SearchBar';
import AddUsersButton from './AddUsersButton';
import { TAB_PENDING_USERS } from './data/constants';
import { SubscriptionContext } from './SubscriptionData';
import { ToastsContext } from '../Toasts';

const LicenseAllocationHeader = () => {
  const {
    details,
    fetchSubscriptionUsers,
    fetchSubscriptionDetails,
    setActiveTab,
  } = useContext(SubscriptionContext);
  const { addToast } = useContext(ToastsContext);

  return (
    <>
      <h3 className="mb-2">
        License Allocation
      </h3>
      <p className="lead">
        {details.licenses.allocated}
        {' of '}
        {details.licenses.total} licenses allocated
      </p>
      <div className="my-3 row">
        <div className="col-12 col-md-5 mb-3 mb-md-0">
          <SearchBar
            placeholder="Search by email..."
            onSearch={searchQuery => fetchSubscriptionUsers({ searchQuery })}
            onClear={() => fetchSubscriptionUsers()}
          />
        </div>
        <div className="col-12 col-md-7">
          <AddUsersButton
            onSuccess={({ numAlreadyAssociated, numSuccessfulAssignments }) => {
              fetchSubscriptionDetails();
              addToast(`${numAlreadyAssociated} email addresses were previously assigned. ${numSuccessfulAssignments} email addresses were successfully added.`);
              setActiveTab(TAB_PENDING_USERS);
            }}
          />
        </div>
      </div>
    </>
  );
};

export default LicenseAllocationHeader;
