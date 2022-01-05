import React, { useState } from 'react';

import SettingsAccessTabSection from './SettingsAccessTabSection';

const SettingsAccessSSOManagement = () => {
  const [isEnabled, setIsEnabled] = useState(true);

  const handleSSOAccessFormSwitchChanged = (e) => {
    setIsEnabled(e.target.checked);
  };

  return (
    <SettingsAccessTabSection
      title="Access via Single Sign-on"
      checked={isEnabled}
      onFormSwitchChange={handleSSOAccessFormSwitchChanged}
    >
      <p>Give learners with Single Sign-On access to the catalog.</p>
    </SettingsAccessTabSection>
  );
};

export default SettingsAccessSSOManagement;
