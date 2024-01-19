import React from 'react';
import { useCurrentSettingsTab } from '../data/hooks';

const MockSettingsTabs = () => {
  const tab = useCurrentSettingsTab();

  return (
    <p>{tab}</p>
  );
};

export default MockSettingsTabs;
