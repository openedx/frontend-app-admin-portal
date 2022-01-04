import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import { SETTINGS_TAB_PARAM } from './constants';
import LicenseManagerApiService from '../../../data/services/LicenseManagerAPIService';

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

const initialCustomerAgreementState = {
  netDaysUntilExpiration: 0,
};
/*
 * @param {Objet {enterpriseId: string}}
 * @returns {customerAgreement: Object, loadingCustomerAgreement: bool}
 * customerAgreement:{
 *  netDaysUntilExpiration: number
 * }
 */
export const useCustomerAgreementData = ({ enterpriseId, handleError }) => {
  const [customerAgreement, setCustomerAgreement] = useState(initialCustomerAgreementState);
  const [loadingCustomerAgreement, setLoadingCustomerAgreement] = useState(true);

  const loadCustomerAgreementData = (page = 1) => {
    if (!loadingCustomerAgreement) {
      setLoadingCustomerAgreement(true);
    }
    LicenseManagerApiService.fetchCustomerAgreementData({ enterprise_customer_uuid: enterpriseId, page })
      .then((response) => {
        const newCustomerAgreementData = {
          netDaysUntilExpiration: 0,
        };
        const { data: customerAgreementData } = camelCaseObject(response);
        if (customerAgreementData.results && customerAgreementData.count) {
          // Only look at customer agreements with subs
          customerAgreementData.results.filter(result => (result.subscriptions && result.subscriptions.length))
            .forEach(agreement => {
              // only use highest netDaysUntilExpiration
              if (newCustomerAgreementData.netDaysUntilExpiration < agreement.netDaysUntilExpiration) {
                newCustomerAgreementData.netDaysUntilExpiration = agreement.netDaysUntilExpiration;
              }
            });
        }
        setCustomerAgreement(newCustomerAgreementData);
      })
      .catch((err) => {
        if (handleError) {
          handleError(err);
        }
      }).finally(() => {
        setLoadingCustomerAgreement(false);
      });
  };

  useEffect(loadCustomerAgreementData, [enterpriseId]);
  return {
    customerAgreement,
    loadingCustomerAgreement,
  };
};

export default {
  useCustomerAgreementData,
  useCurrentSettingsTab,
  useLinkManagement,
};
