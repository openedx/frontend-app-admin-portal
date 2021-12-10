import React from 'react';

import SettingsAccessTabSection from './SettingsAccessTabSection';

const SettingsAccessSSOManagement = () => {
  // TODO: fetch feature setting and handle toggle
  const FAKE_SETTING = true;
  const handleSSOAccessToggleChanged = () => {
    // console.log(e.target.checked);
  };

  return (
    <SettingsAccessTabSection
      title="Access via Single Sign-on"
      checked={FAKE_SETTING}
      onChange={handleSSOAccessToggleChanged}
    >
      <p>Give learners with Single Sign-On access to the catalog.</p>
    </SettingsAccessTabSection>
  );
};

export default SettingsAccessSSOManagement;
