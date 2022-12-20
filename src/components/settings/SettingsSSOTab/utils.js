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

function createSAMLURLs({
  configuration, idpSlug, enterpriseSlug, learnerPortalEnabled,
}) {
  const learnerPortalUrl = `${configuration.ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}`;
  const testLink = learnerPortalEnabled === true ? learnerPortalUrl : `${configuration.LMS_BASE_URL}/dashboard?tpa_hint=saml-${idpSlug}`;
  const spMetadataLink = `${configuration.LMS_BASE_URL}/auth/saml/metadata.xml?tpa_hint=${idpSlug}`;
  return { testLink, spMetadataLink };
}

export { updateSamlProviderData, deleteSamlProviderData, createSAMLURLs };
