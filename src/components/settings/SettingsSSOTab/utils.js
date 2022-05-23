/* eslint-disable import/prefer-default-export */
import LmsApiService from '../../../data/services/LmsApiService';

async function deleteSamlProviderData(pdid, enterpriseId) {
  return LmsApiService.deleteProviderData(pdid, enterpriseId);
}

async function updateSamlProviderData({
  enterpriseId,
  metadataURL,
  entityID,
  ssoUrl,
  publicKey,
  entryType,
}) {
  const formData = new FormData();
  formData.append('enterprise_customer_uuid', enterpriseId);
  formData.append('entity_id', entityID);
  if (entryType === 'url') {
    formData.append('metadata_url', metadataURL);
  } else if (entryType === 'direct') {
    formData.append('sso_url', ssoUrl);
    formData.append('public_key', publicKey);
  }
  return LmsApiService.syncProviderData(formData);
}

export { updateSamlProviderData, deleteSamlProviderData };
