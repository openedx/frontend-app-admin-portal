import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { SubscriptionDetailContext } from './SubscriptionDetailData';
import { formatTimestamp } from '../../utils';

const SubscriptionDetails = ({ enterpriseSlug }) => {
  const { details } = useContext(SubscriptionDetailContext);

  return (
    <>
      <div className="container-fluid mt-3">
        <div className="row mb-5">
          <div className="col-12 col-lg-8 mb-3 mb-lg-0">
            <h2>Details</h2>
            <div className="mt-3 d-flex align-items-center">
              <div className="mr-5">
                <div className="text-uppercase text-muted">
                  <small>Start Date</small>
                </div>
                <div className="lead">
                  {formatTimestamp({ timestamp: details.startDate })}
                </div>
              </div>
              <div>
                <div className="text-uppercase text-muted">
                  <small>End Date</small>
                </div>
                <div className="lead">
                  {formatTimestamp({ timestamp: details.expirationDate })}
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-4 text-lg-right">
            <Link to={`/${enterpriseSlug}/admin/support`} className="btn btn-outline-primary">
              Contact Customer Support
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

SubscriptionDetails.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(SubscriptionDetails);
