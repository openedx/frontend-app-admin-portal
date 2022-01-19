/* eslint-disable import/prefer-default-export */
function createSAMLURLs({
  configuration, idpSlug, enterpriseSlug, learnerPortalEnabled,
}) {
  const learnerPortalUrl = `${configuration.ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}`;
  const testLink = learnerPortalEnabled === true ? learnerPortalUrl : `${configuration.LMS_BASE_URL}/dashboard?tpa_hint=saml-${idpSlug}`;
  const spMetadataLink = `${configuration.LMS_BASE_URL}/auth/saml/metadata.xml?tpa_hint=${idpSlug}`;
  return { testLink, spMetadataLink };
}

export { createSAMLURLs };
