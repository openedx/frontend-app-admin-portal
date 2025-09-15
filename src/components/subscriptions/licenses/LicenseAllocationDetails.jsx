import React from 'react';
import LicenseAllocationHeader from './LicenseAllocationHeader';
import LicenseManagementTable from './LicenseManagementTable';
import { ADMINISTER_SUBSCRIPTIONS_TARGETS } from '../../ProductTours/AdminOnboardingTours/constants';

const LicenseAllocationDetails = () => (
  <div className="row mb-3" id={ADMINISTER_SUBSCRIPTIONS_TARGETS.LICENSE_ALLOCATION_SECTION}>
    <div className="col">
      <div className="mb-3">
        <LicenseAllocationHeader />
      </div>
      <LicenseManagementTable />
    </div>
  </div>
);

export default LicenseAllocationDetails;
