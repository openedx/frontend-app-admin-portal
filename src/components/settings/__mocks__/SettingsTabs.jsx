import React from 'react';
import { useLocation } from 'react-router-dom';
import { useCurrentSettingsTab } from '../data/hooks';

const MockSettingsTabs = () => {
  const tab = useCurrentSettingsTab();
  const location = useLocation();

  return (
    <>
      <p>{location.pathname.replace('/', '')}</p>
      <p>{tab}</p>
    </>
  );
};

export default MockSettingsTabs;
