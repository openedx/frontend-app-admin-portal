import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { SETTINGS_TAB_PARAM } from './constants';

/**
 * Checks url parameter `SETTINGS_TAB_PARAM`
 * if there is nothing there it returns DEFAULT_TAB
 * @returns Current settings tab
 */
export const useCurrentSettingsTab = () => {
  const params = useParams();
  return params[SETTINGS_TAB_PARAM];
};

// TODO: Remove fake data below
const FAKE_LINK_DATA = [
  {
    link: 'some link',
    linkStatus: 'activated',
    dateCreated: '1/2/3',
    usage: '0',
    usageMax: '11',
  },
  {
    link: 'some link',
    linkStatus: 'deactivated',
    dateCreated: '1/2/3',
    usage: '2',
    usageMax: '11',
  },
];
const FAKE_API = new Promise((resolve) => setTimeout(resolve(FAKE_LINK_DATA), 3000));

export const useLinkManagement = () => {
  const [links, setLinks] = useState([]);
  const [loadingLinks, setLoadingLinks] = useState(false);

  const loadLinks = () => {
    setLoadingLinks(true);
    // TODO: use real API to fetch links
    FAKE_API.then((response) => {
      setLinks(response);
    })
      .catch(() => {
      // TODO: Handle Errors
      })
      .finally(() => {
        setLoadingLinks(false);
      });
  };

  const refreshLinks = () => {
    loadLinks();
  };

  // TODO: update link dependency
  useEffect(loadLinks, []);

  return {
    links,
    loadingLinks,
    refreshLinks,
  };
};

export default {
  useCurrentSettingsTab,
  useLinkManagement,
};
