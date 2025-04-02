import React from 'react';
import PropTypes from 'prop-types';
import LicenseManagementTable from './LicenseManagementTable';
import LicenseAllocationHeader from './LicenseAllocationHeader';

const LicenseAllocationDetails = ({ subscriptionUUID }) => (
  <div className="row mb-3" key={subscriptionUUID}>
    <div className="col">
      <div className="mb-3">
        <LicenseAllocationHeader />
      </div>
      <LicenseManagementTable subscriptionUUID={subscriptionUUID} />
    </div>
  </div>
);

LicenseAllocationDetails.propTypes = {
  subscriptionUUID: PropTypes.string.isRequired,
};
export default LicenseAllocationDetails;
