import React from 'react';
import { Helmet } from 'react-helmet';

import Hero from '../Hero';
import SearchBar from '../SearchBar';
import SubscriptionData, { SubscriptionConsumer } from './SubscriptionData';
import SubscriptionDetails from './SubscriptionDetails';
import AddUsersDropdown from './AddUsersDropdown';
import LicenseAllocationNavigation from './LicenseAllocationNavigation';
import TabContentTable from './TabContentTable';

import './styles/SubscriptionManagementPage.scss';

const PAGE_TITLE = 'Subscription Management';

export default function SubscriptionManagementPage() {
  return (
    <SubscriptionData>
      <main role="main" className="manage-subscription">
        <Helmet title={PAGE_TITLE} />
        <Hero title={PAGE_TITLE} />
        <div className="container-fluid mt-3">
          <div className="row mb-5">
            <div className="col-12 col-lg-8 mb-3 mb-lg-0">
              <SubscriptionDetails />
            </div>
            <div className="col-12 col-lg-4 text-md-right">
              <button className="btn btn-outline-primary">
                Request assistance
              </button>
            </div>
          </div>
          <div className="row mb-3">
            <div className="col">
              <div className="mb-3">
                <h3 className="mb-2">
                  License Allocation
                </h3>
                <SubscriptionConsumer>
                  {({ details, fetchSubscriptionUsers }) => (
                    <React.Fragment>
                      <p className="lead">
                        {details.licenses.allocated}
                        {' of '}
                        {details.licenses.available} licenses allocated
                      </p>
                      <div className="my-3 row">
                        <div className="col-12 col-lg-6 mb-3 mb-lg-0">
                          <SearchBar
                            placeholder="Search by email..."
                            // eslint-disable-next-line no-console
                            onSearch={query => fetchSubscriptionUsers({ searchQuery: query })}
                            // eslint-disable-next-line no-console
                            onClear={() => fetchSubscriptionUsers()}
                          />
                        </div>
                        <div className="col-12 col-lg-6">
                          <AddUsersDropdown />
                        </div>
                      </div>
                    </React.Fragment>
                  )}
                </SubscriptionConsumer>
              </div>
              <div className="row my-4">
                <div className="col-12 col-lg-3">
                  <LicenseAllocationNavigation />
                </div>
                <div className="col-12 col-lg-9">
                  <TabContentTable />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </SubscriptionData>
  );
}
