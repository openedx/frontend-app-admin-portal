import React from 'react';
import { Hyperlink } from '@edx/paragon';
import ZeroStateCard from './ZeroStateCard';
import Success from './Success';

const SettingsApiCredentialsTab = () => (
  <div>
    <h2 className="py-2">API credentials
      <Hyperlink
        destination="https://www.edx.org"
        target="_blank"
        className="btn btn-outline-primary side-button"
      >
        Help Center: Credentials
      </Hyperlink>
    </h2>
    <ZeroStateCard />

  </div>
);

export default SettingsApiCredentialsTab;
