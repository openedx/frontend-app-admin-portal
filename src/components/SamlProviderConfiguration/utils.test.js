import { createSAMLURLs } from './utils';

describe('tests for utils', () => {
  test('generates correct urls for SAML with learner portal enabled', () => {
    const configuration = { ENTERPRISE_LEARNER_PORTAL_URL: 'http://base', LMS_BASE_URL: 'http://baselms' };
    const idpSlug = 'test-slug';
    const enterpriseSlug = 'enterprise-slug';
    const { testLink, spMetadataLink } = createSAMLURLs({
      configuration,
      idpSlug,
      enterpriseSlug,
      learnerPortalEnabled: true,
    });
    expect(testLink).toBe('http://base/enterprise-slug');
    expect(spMetadataLink).toBe('http://baselms/auth/saml/metadata.xml?tpa_hint=test-slug');
  });
  test('generates correct urls for SAML with learner portal off', () => {
    const configuration = { ENTERPRISE_LEARNER_PORTAL_URL: 'http://base', LMS_BASE_URL: 'http://baselms' };
    const idpSlug = 'test-slug';
    const enterpriseSlug = 'enterprise-slug';
    const { testLink, spMetadataLink } = createSAMLURLs({
      configuration,
      idpSlug,
      enterpriseSlug,
      learnerPortalEnabled: false,
    });
    expect(testLink).toBe('http://baselms/dashboard?tpa_hint=saml-test-slug');
    expect(spMetadataLink).toBe('http://baselms/auth/saml/metadata.xml?tpa_hint=test-slug');
  });
});
