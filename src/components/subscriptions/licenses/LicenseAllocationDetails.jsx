import React from 'react';
import LicenseAllocationHeader from './LicenseAllocationHeader';
import LicenseManagementTable from './LicenseManagementTable';

const LicenseAllocationDetails = () => (
  <div className="row mb-3">
    <div className="col">
      <div className="mb-3">
        <LicenseAllocationHeader />
      </div>
      <LicenseManagementTable />
    </div>
  </div>
);

export default LicenseAllocationDetails;
