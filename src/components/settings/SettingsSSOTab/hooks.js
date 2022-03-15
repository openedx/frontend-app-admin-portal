/* eslint-disable import/prefer-default-export */
import { useEffect, useState, useContext } from 'react';
import LmsApiService from '../../../data/services/LmsApiService';
import { SSOConfigContext } from './SSOConfigContext';
import { updateIdpMetadataURLAction, updateIdpEntryTypeAction } from './data/actions';

const useIdpMetadataURL = () => {
  const { ssoState, dispatchSsoState } = useContext(SSOConfigContext);
  const { idp: { metadataURL, entryType } } = ssoState;
  const handleMetadataURLUpdate = event => dispatchSsoState(updateIdpMetadataURLAction(event.target.value));
  const handleMetadataEntryTypeUpdate = event => dispatchSsoState(updateIdpEntryTypeAction(event.target.value));
  return {
    metadataURL, entryType, handleMetadataURLUpdate, handleMetadataEntryTypeUpdate,
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
  useIdpMetadataURL,
};
