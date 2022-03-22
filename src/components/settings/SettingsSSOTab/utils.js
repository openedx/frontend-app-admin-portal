/* eslint-disable import/prefer-default-export */
import LmsApiService from '../../../data/services/LmsApiService';

async function updateSamlProviderData({ enterpriseId, metadataURL, entityID }) {
  const formData = new FormData();
  formData.append('enterprise_customer_uuid', enterpriseId);
  formData.append('metadata_url', metadataURL);
  formData.append('entity_id', entityID);
  return LmsApiService.syncProviderData(formData);
}

export { updateSamlProviderData };
