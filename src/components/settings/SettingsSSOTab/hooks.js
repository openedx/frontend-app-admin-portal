/* eslint-disable import/prefer-default-export */
import { useEffect, useState, useContext } from 'react';
import { logInfo } from '@edx/frontend-platform/logging';
import LmsApiService from '../../../data/services/LmsApiService';
import { SSOConfigContext } from './SSOConfigContext';
import {
  updateIdpMetadataURLAction, updateIdpEntryTypeAction, updateEntityIDAction,
  updateCurrentError, updateIdpDirtyState,
} from './data/actions';
import { updateSamlProviderData } from './utils';

const useIdpState = () => {
  const { ssoState, dispatchSsoState, setProviderConfig } = useContext(SSOConfigContext);
  const {
    idp: {
      metadataURL,
      entityID,
      entryType,
      isDirty,
    },
  } = ssoState;
  const handleMetadataURLUpdate = event => dispatchSsoState(updateIdpMetadataURLAction(event.target.value));
  const handleMetadataEntryTypeUpdate = event => dispatchSsoState(updateIdpEntryTypeAction(event.target.value));
  const handleEntityIDUpdate = event => dispatchSsoState(updateEntityIDAction(event.target.value));
  const createOrUpdateIdpRecord = async ({
    enterpriseName,
    enterpriseSlug,
    enterpriseId,
    providerConfig = null,
    onSuccess,
  }) => {
    if (!isDirty) {
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
    formData.append('enterprise_customer_uuid', enterpriseId);
    formData.append('metadata_source', metadataURL);
    formData.append('entity_id', entityID);
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

      // also get samlproviderdata updated from remote metadata url
      const providerdataResponse = await updateSamlProviderData({
        enterpriseId,
        metadataURL,
        entityID,
      });
      logInfo(providerdataResponse);

      // then save samlproviderdata before running onSuccess callback
      onSuccess();
    } catch (error) {
      dispatchSsoState(updateCurrentError(error));
    }
    dispatchSsoState(updateIdpDirtyState(false)); // we must reset dirty state
  };
  return {
    metadataURL,
    entryType,
    entityID,
    handleMetadataURLUpdate,
    handleMetadataEntryTypeUpdate,
    handleEntityIDUpdate,
    createOrUpdateIdpRecord,
  };
};

const useExistingSSOConfigs = (enterpriseUuid) => {
  const [ssoConfigs, setSsoConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (enterpriseUuid) {
      const fetchData = async () => {
        const response = await LmsApiService.getProviderConfig(enterpriseUuid);
        return response.data.results;
      };
      fetchData().then(configs => {
        setSsoConfigs(configs);
        setLoading(false);
      }).catch(err => {
        setLoading(false);
        if (err.customAttributes?.httpErrorStatus !== 404) {
          // nothing found is okay for this fetcher.
          setError(err);
        }
      });
    }
  }, [enterpriseUuid]);
  return [ssoConfigs, error, loading];
};

export {
  useExistingSSOConfigs,
  useIdpState,
};
