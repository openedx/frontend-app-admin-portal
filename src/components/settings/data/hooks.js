import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';

import { SETTINGS_TAB_PARAM } from './constants';
import LicenseManagerApiService from '../../../data/services/LicenseManagerAPIService';
import LmsApiService from '../../../data/services/LmsApiService';

/**
 * Checks url parameter `SETTINGS_TAB_PARAM`
 * if there is nothing there it returns DEFAULT_TAB
 * @returns Current settings tab
 */
export const useCurrentSettingsTab = () => {
  const params = useParams();
  return params[SETTINGS_TAB_PARAM];
};

/**
 * A React hook that manages the EnterpriseCustomerInviteKey urls, providing an
 * array of URLs from an API response, a boolean whether the request is pending,
 * and a function that allows subcomponents to refresh the data as needed.
 *
 * @param {string} enterpriseUUID EnterpriseCustomer UUID
 * @returns An object containing `links`, `loadingLinks`, and `refreshLinks`.
 */
export const useLinkManagement = (enterpriseUUID) => {
  const [links, setLinks] = useState([]);
  const [loadingLinks, setLoadingLinks] = useState(true);

  const loadLinks = () => {
    setLoadingLinks(true);
    const fetchLinksForEnterprise = async () => {
      try {
        const response = await LmsApiService.getAccessLinks(enterpriseUUID);
        const result = camelCaseObject(response.data);
        setLinks(result);
      } catch (error) {
        logError(error);
      } finally {
        setLoadingLinks(false);
      }
    };
    fetchLinksForEnterprise();
    return () => {
      setLoadingLinks(false);
    };
  };

  const refreshLinks = () => {
    loadLinks();
  };

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
/**
 * @param {Object {enterpriseId: string}}
 * @returns {customerAgreement: Object, loadingCustomerAgreement: bool}
 * customerAgreement:{
 *  netDaysUntilExpiration: number
 * }
 */
export const useCustomerAgreementData = ({ enterpriseId }) => {
  const [customerAgreement, setCustomerAgreement] = useState(initialCustomerAgreementState);
  const [loadingCustomerAgreement, setLoadingCustomerAgreement] = useState(true);

  const loadCustomerAgreementData = (page = 1, agreement = 0) => {
    const fetchCustomerAgreementData = async () => {
      setLoadingCustomerAgreement(true);
      try {
        const response = await LicenseManagerApiService.fetchCustomerAgreementData({
          enterprise_customer_uuid: enterpriseId,
          page,
        });
        const { data: customerAgreementData } = camelCaseObject(response);
        if (customerAgreementData.results && customerAgreementData.count) {
          setCustomerAgreement(customerAgreementData.results[agreement]);
        }
      } catch (error) {
        logError(error);
      } finally {
        setLoadingCustomerAgreement(false);
      }
    };
    fetchCustomerAgreementData();
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
