import { useParams } from 'react-router-dom';

import { SETTINGS_TAB_PARAM, DEFAULT_TAB } from './constants';

export const useSettingsTab = () => {
  const params = useParams();
  const settingsTab = params[SETTINGS_TAB_PARAM];
  if (settingsTab) {
    return settingsTab;
  }
  return DEFAULT_TAB;
};

export default {
  useSettingsTab,
};
