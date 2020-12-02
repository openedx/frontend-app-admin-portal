import React from 'react';
import LicenseAllocationNavigation from './LicenseAllocationNavigation';
import TabContentTable from './TabContentTable';
import LicenseAllocationHeader from './LicenseAllocationHeader';


const LicenseAllocationDetails = () => (
  <React.Fragment>
    <div className="container-fluid">
      <div className="row mb-3">
        <div className="col">
          <div className="mb-3">
            <LicenseAllocationHeader />
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

export default LicenseAllocationDetails;
