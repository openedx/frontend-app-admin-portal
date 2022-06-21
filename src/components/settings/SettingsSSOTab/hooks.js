/* eslint-disable import/prefer-default-export */
import {
  useEffect, useState, useContext, useCallback,
} from 'react';
import { logInfo } from '@edx/frontend-platform/logging';
import LmsApiService from '../../../data/services/LmsApiService';
import { SSOConfigContext } from './SSOConfigContext';
import {
  updateIdpMetadataURLAction, updateIdpEntryTypeAction, updateEntityIDAction,
  updateIdpDirtyState,
} from './data/actions';
import { updateSamlProviderData, deleteSamlProviderData } from './utils';

const useIdpState = () => {
  const {
    ssoState, dispatchSsoState, setProviderConfig, currentError, setCurrentError,
  } = useContext(SSOConfigContext);
  const {
    idp: {
      metadataURL,
      entityID,
      entryType,
      isDirty,
      publicKey,
      ssoUrl,
    },
  } = ssoState;
  const handleMetadataURLUpdate = useCallback((event) => {
    dispatchSsoState(updateIdpMetadataURLAction(event.target.value));
  }, [dispatchSsoState]);
  const handleMetadataEntryTypeUpdate = useCallback((event) => {
    dispatchSsoState(updateIdpEntryTypeAction(event.target.value));
  }, [dispatchSsoState]);
  const handleEntityIDUpdate = useCallback((event) => {
    dispatchSsoState(updateEntityIDAction(event.target.value));
  }, [dispatchSsoState]);
  const createOrUpdateIdpRecord = async ({
    enterpriseName,
    enterpriseSlug,
    enterpriseId,
    providerConfig = null,
    existingProviderData,
    onSuccess,
  }) => {
    if (!isDirty && currentError === null) {
      dispatchSsoState(updateIdpDirtyState(false));
      onSuccess();
      return;
    }
    // This function will do two things when isDirty is true:
    //  1:   Send a post to create a SAMLProviderConfig record (and to request creation of SAMLProviderData)
    //     OR,
    //  2:  An update instead of create will be called if providerConfig is not null (based on its id)
    //  if that succeeds, it will dispatch to ssoState to update it per server
    //  if that fails,
    //     dispatch to ssoState to update just the currentError to the error
    //     dispatch to ssoState to set idp.isComplete = false
    //     sets ssoState.currentState to 'idp' to take user back to idp screen if necessary
    const formData = new FormData();
    formData.append('name', enterpriseName);
    formData.append('slug', enterpriseSlug);
    formData.append('enabled', true);
    formData.append('enterprise_customer_uuid', enterpriseId);
    formData.append('metadata_source', metadataURL);
    formData.append('entity_id', entityID);
    formData.append('skip_hinted_login_dialog', true);
    formData.append('skip_registration_form', true);
    formData.append('skip_email_verification', true);
    formData.append('visible', false);
    formData.append('skip_email_verification', true);
    formData.append('send_to_registration_first', true);
    formData.append('sync_learner_profile_data', false);
    formData.append('enable_sso_id_verification', true);

    try {
      let response;
      if (!providerConfig) {
        response = await LmsApiService.postNewProviderConfig(formData);
      } else {
        logInfo(`Updating ProviderConfig for id: ${providerConfig.id}`);
        response = await LmsApiService.updateProviderConfig(formData, providerConfig.id);
      }

      // response.data is the providerConfig
      // here we can assume the customer only has one sso config, at this time
      // but we need to update this support the case when the correct sso config must be updated
      setProviderConfig(response.data);

      // If the user already has a provider data entry with a different entityID, remove it before
      // creating a new one
      existingProviderData.forEach(async (idpData) => {
        if (idpData.entity_id !== entityID) {
          await deleteSamlProviderData(idpData.id, enterpriseId);
        }
      });

      // Make sure samlproviderdata is updated from remote metadata url
      const providerdataResponse = await updateSamlProviderData({ enterpriseId, metadataURL, entityID });
      logInfo(providerdataResponse);
      setCurrentError(null);
      // then save samlproviderdata before running onSuccess callback
      onSuccess();
    } catch (error) {
      const { message, customAttributes } = error;
      if (error.customAttributes?.httpErrorStatus === 406) {
        setCurrentError(
          ': Unable to verify provided metadata URL, please check your information and try again.',
        );
      } else if (error.customAttributes?.httpErrorResponseData) {
        const errorResponseData = JSON.parse(error.customAttributes.httpErrorResponseData);
        if (errorResponseData.non_field_errors[0].includes('Entity ID:')) {
          setCurrentError(': Entity ID already in use.');
        } else {
          setCurrentError(`${message} Details: ${JSON.stringify(customAttributes)}`);
        }
      } else {
        setCurrentError(`${message} Details: ${JSON.stringify(customAttributes)}`);
      }
    }
    dispatchSsoState(updateIdpDirtyState(false)); // we must reset dirty state
  };
  return {
    metadataURL,
    entryType,
    entityID,
    ssoUrl,
    publicKey,
    handleMetadataURLUpdate,
    handleMetadataEntryTypeUpdate,
    handleEntityIDUpdate,
    createOrUpdateIdpRecord,
  };
};

const useExistingProviderData = (enterpriseUuid, refreshBool) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [samlData, setSamlData] = useState([]);

  useEffect(() => {
    let isMounted = true;
    if (enterpriseUuid) {
      const fetchData = async () => {
        const response = await LmsApiService.getProviderData(enterpriseUuid);
        // SAML provider data is returned as a list as there can be multiple per configuration
        return response.data.results;
      };
      fetchData().then(data => {
        if (isMounted) {
          setSamlData(data);
          setLoading(false);
        }
      }).catch(err => {
        if (isMounted) {
          setLoading(false);
          if (err.customAttributes?.httpErrorStatus !== 404) {
            // nothing found is okay for this fetcher.
            setError(err);
          } else {
            setSamlData([]);
          }
        }
      });
    }
    return () => { isMounted = false; };
  }, [enterpriseUuid, refreshBool]);

  return [samlData, error, loading];
};

const useExistingSSOConfigs = (enterpriseUuid, refreshBool) => {
  const [ssoConfigs, setSsoConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (enterpriseUuid) {
      const fetchConfig = async () => {
        const response = await LmsApiService.getProviderConfig(enterpriseUuid);
        return response.data.results;
      };
      fetchConfig().then(configs => {
        setSsoConfigs(configs);
        setLoading(false);
      }).catch(err => {
        setLoading(false);
        if (err.customAttributes?.httpErrorStatus !== 404) {
          // nothing found is okay for this fetcher.
          setError(err);
        } else {
          setSsoConfigs([]);
        }
      });
    }
  }, [enterpriseUuid, refreshBool]);

  return [ssoConfigs, error, loading];
};

export {
  useExistingSSOConfigs,
  useExistingProviderData,
  useIdpState,
};
