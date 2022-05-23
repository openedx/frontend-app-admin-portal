import LmsApiService from '../../../../data/services/LmsApiService';
import { updateSamlProviderData, deleteSamlProviderData } from '../utils';

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
  test('calls syncProviderData with correct data under direct entry', async () => {
    const enterpriseId = 'a-id';
    const entityID = 'anId';
    const ssoUrl = 'https://foobar.com';
    const publicKey = '123abc';
    const entryType = 'direct';
    const formData = new FormData();
    formData.append('enterprise_customer_uuid', enterpriseId);
    formData.append('entity_id', entityID);
    formData.append('sso_url', ssoUrl);
    formData.append('public_key', publicKey);
    LmsApiService.syncProviderData.mockResolvedValue({ lepard: 'def' });
    const value = await updateSamlProviderData({
      enterpriseId, entityID, ssoUrl, publicKey, entryType,
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
