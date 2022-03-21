/* eslint-disable import/prefer-default-export */
import { useEffect, useState, useContext } from 'react';
import LmsApiService from '../../../data/services/LmsApiService';
import { SSOConfigContext } from './SSOConfigContext';
import {
  updateIdpMetadataURLAction, updateIdpEntryTypeAction, updateEntityIDAction,
  updateCurrentError, setProviderConfig,
} from './data/actions';
import { fetchMetadataFromRemote } from './utils';

const useIdpState = () => {
  const { ssoState, dispatchSsoState } = useContext(SSOConfigContext);
  const { idp: { metadataURL, entityID, entryType } } = ssoState;
  const handleMetadataURLUpdate = event => dispatchSsoState(updateIdpMetadataURLAction(event.target.value));
  const handleMetadataEntryTypeUpdate = event => dispatchSsoState(updateIdpEntryTypeAction(event.target.value));
  const handleEntityIDUpdate = event => dispatchSsoState(updateEntityIDAction(event.target.value));
  const createOrUpdateIdpRecord = async ({
    enterpriseName,
    enterpriseSlug,
    enterpriseId,
    onSuccess,
  }) => {
    // handler to call when we click 'next' on the first step (IDP creation initial)
    // this function will do two things:
    // send a post to server to create/update a SAMLProviderConfig record (and to request creation of SAMLProviderData)
    // if that succeeds, it will dispatch to ssoState to update it per server
    // if that fails,
    //   dispatch to ssoState to update just the currentError to the error
    //   dispatch to ssoState to set idp.isComplete = false
    //   sets ssoState.currentState to 'idp' to take user back to idp screen if necessary
    const formData = new FormData();
    formData.append('name', enterpriseName);
    formData.append('slug', enterpriseSlug);
    formData.append('enterprise_customer_uuid', enterpriseId);
    formData.append('metadata_source', metadataURL);
    formData.append('entity_id', entityID);
    try {
      const response = await LmsApiService.postNewProviderConfig(formData);
      // response.data is the providerConfig
      // here we can assume the customer only has one sso config, at this time
      // but we need to update this support the case when the correct sso config must be updated
      dispatchSsoState(setProviderConfig(response.data));

      // also fetch and parse remote metadata and extract the needed fields to save samlproviderdata
      const { parsedEntityID, parsedSSOURL, parsedX509Cert } = await fetchMetadataFromRemote(metadataURL);
      console.log({ parsedEntityID, parsedSSOURL, parsedX509Cert });
      // then save samlproviderdata before running onSuccess callback
      onSuccess();
    } catch (error) {
      dispatchSsoState(updateCurrentError(error));
    }
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
