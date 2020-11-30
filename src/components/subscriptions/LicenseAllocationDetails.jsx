import React, { useContext } from 'react';
import { SubscriptionConsumer } from './SubscriptionData';
import SearchBar from '../SearchBar';
import AddUsersButton from './AddUsersButton';
import { TAB_PENDING_USERS } from './data/constants';
import LicenseAllocationNavigation from './LicenseAllocationNavigation';
import TabContentTable from './TabContentTable';
import { ToastsContext } from '../Toasts';


const LicenseAllocationDetails = () => {
  const { addToast } = useContext(ToastsContext);
  return (
    <React.Fragment>
      <div className="container-fluid">
        <div className="row mb-3">
          <div className="col">
            <div className="mb-3">
              <h3 className="mb-2">
                License Allocation
              </h3>
              <SubscriptionConsumer>
                {({
                    details,
                    fetchSubscriptionUsers,
                    fetchSubscriptionDetails,
                    setActiveTab,
                  }) => (
                    <React.Fragment>
                      <p className="lead">
                        {details.licenses.allocated}
                        {' of '}
                        {details.licenses.total} licenses allocated
                      </p>
                      <div className="my-3 row">
                        <div className="col-12 col-md-5 mb-3 mb-md-0">
                          <SearchBar
                            placeholder="Search by email..."
                            onSearch={searchQuery => fetchSubscriptionUsers({searchQuery})}
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
                    </React.Fragment>
                )}
              </SubscriptionConsumer>
            </div>
            <div className="row my-4">
              <div className="col-12 col-lg-3 mb-2 mb-lg-0">
                <LicenseAllocationNavigation />
              </div>
              <div className="col-12 col-lg-9">
                <TabContentTable />
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default LicenseAllocationDetails;
