import React, { useState, createContext } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import Hero from '../Hero';
import SearchBar from '../SearchBar';
import SubscriptionData, { SubscriptionConsumer } from './SubscriptionData';
import SubscriptionDetails from './SubscriptionDetails';
import AddUsersButton from './AddUsersButton';
import LicenseAllocationNavigation from './LicenseAllocationNavigation';
import TabContentTable from './TabContentTable';
import StatusAlert from '../StatusAlert';

import './styles/SubscriptionManagementPage.scss';

const PAGE_TITLE = 'Subscription Management';
export const StatusContext = createContext();

function SubscriptionManagementPage({ enterpriseSlug }) {
  const [status, setStatus] = useState({
    visible: false, alertType: '', message: '',
  });

  const setSuccessStatus = ({ visible, message = '' }) => {
    setStatus({
      visible,
      alertType: 'success',
      message,
    });
  };

  const renderStatusMessage = () => (
    status && status.visible && (
      <StatusAlert
        alertType={status.alertType}
        iconClassName={status.iconClassName || `fa ${status.alertType === 'success' ? 'fa-check' : 'fa-times-circle'}`}
        title={status.title}
        message={status.message}
        onClose={() => setSuccessStatus({ visible: false })}
        dismissible
      />
    )
  );

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
              <Link to={`/${enterpriseSlug}/admin/support`} className="btn btn-outline-primary">
                Contact Customer Support
              </Link>
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
                        {details.licenses.total} licenses allocated
                      </p>
                      <div className="my-3 row">
                        <div className="col-12 col-lg-5 mb-3 mb-lg-0">
                          <SearchBar
                            placeholder="Search by email..."
                              // eslint-disable-next-line no-console
                            onSearch={searchQuery => fetchSubscriptionUsers({ searchQuery })}
                              // eslint-disable-next-line no-console
                            onClear={() => fetchSubscriptionUsers()}
                          />
                        </div>
                        <div className="col-12 col-lg-7">
                          <AddUsersButton />
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
                  {renderStatusMessage()}
                  <StatusContext.Provider value={{ setStatus, setSuccessStatus }}>
                    <TabContentTable />
                  </StatusContext.Provider>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </SubscriptionData>
  );
}

SubscriptionManagementPage.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(SubscriptionManagementPage);
