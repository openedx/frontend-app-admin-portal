import React, { useContext } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import Hero from '../Hero';
import SearchBar from '../SearchBar';
import { ToastsContext } from '../Toasts';
import SubscriptionData, { SubscriptionConsumer } from './SubscriptionData';
import SubscriptionDetails from './SubscriptionDetails';
import AddUsersButton from './AddUsersButton';
import LicenseAllocationNavigation from './LicenseAllocationNavigation';
import TabContentTable from './TabContentTable';

import { TAB_PENDING_USERS } from './constants';

const PAGE_TITLE = 'Subscription Management';

function SubscriptionManagementPage({ enterpriseSlug, enterpriseId }) {
  const { addToast } = useContext(ToastsContext);

  return (
    <React.Fragment>
      <Helmet title={PAGE_TITLE} />
      <Hero title={PAGE_TITLE} />
      <SubscriptionData enterpriseId={enterpriseId}>
        <main role="main" className="manage-subscription">
          <div className="container-fluid mt-3">
            <div className="row mb-5">
              <div className="col-12 col-lg-8 mb-3 mb-lg-0">
                <SubscriptionDetails />
              </div>
              <div className="col-12 col-lg-4 text-lg-right">
                <Link to={`/${enterpriseSlug}/admin/support`} className="btn btn-outline-primary">
                  Contact Customer Support
                </Link>
              </div>
            </div>
          </div>
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
                    }) => ((
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
                      </React.Fragment>
                    ))}
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
        </main>
      </SubscriptionData>
    </React.Fragment>
  );
}

SubscriptionManagementPage.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(SubscriptionManagementPage);
