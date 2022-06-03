/* eslint-disable import/prefer-default-export */
import LmsApiService from '../../../data/services/LmsApiService';

async function deleteSamlProviderData(pdid, enterpriseId) {
  return LmsApiService.deleteProviderData(pdid, enterpriseId);
}

async function updateSamlProviderData({
  enterpriseId,
  metadataURL,
  entityID,
}) {
  const formData = new FormData();
  formData.append('enterprise_customer_uuid', enterpriseId);
  formData.append('entity_id', entityID);
  formData.append('metadata_url', metadataURL);
  return LmsApiService.syncProviderData(formData);
}

export { updateSamlProviderData, deleteSamlProviderData };
