import LmsApiService from '../../../../data/services/LmsApiService';
import { createSAMLURLs, updateSamlProviderData, deleteSamlProviderData } from '../utils';

jest.mock('../../../../data/services/LmsApiService', () => ({
  syncProviderData: jest.fn(),
  deleteProviderData: jest.fn(),
}));
describe('update saml provider data', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('calls syncProviderData with correct data under url entry', async () => {
    const enterpriseId = 'a-id';
    const metadataURL = 'http://url';
    const entityID = 'anId';
    const entryType = 'url';
    const formData = new FormData();
    formData.append('enterprise_customer_uuid', enterpriseId);
    formData.append('entity_id', entityID);
    formData.append('metadata_url', metadataURL);
    LmsApiService.syncProviderData.mockResolvedValue({ lepard: 'def' });
    const value = await updateSamlProviderData({
      enterpriseId, metadataURL, entityID, entryType,
    });
    expect(value).toStrictEqual({ lepard: 'def' });
    expect(LmsApiService.syncProviderData).toBeCalledWith(formData);
  });
});
describe('delete saml provider data', () => {
  test('calls deleteProviderData', async () => {
    const enterpriseId = 'a-id';
    const pdid = 1;
    LmsApiService.deleteProviderData.mockResolvedValue({ lepard: 'def' });
    const value = await deleteSamlProviderData(pdid, enterpriseId);
    expect(value).toStrictEqual({ lepard: 'def' });
    expect(LmsApiService.deleteProviderData).toBeCalledWith(pdid, enterpriseId);
  });
});
describe('tests for SAML', () => {
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
