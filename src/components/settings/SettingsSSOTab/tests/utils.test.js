import LmsApiService from '../../../../data/services/LmsApiService';
import { updateSamlProviderData } from '../utils';

jest.mock('../../../../data/services/LmsApiService', () => ({
  syncProviderData: jest.fn(),
}));
describe('update saml provider data', () => {
  test('calls syncProviderData', async () => {
    const enterpriseId = 'a-id';
    const metadataURL = 'http://url';
    const entityID = 'anId';
    LmsApiService.syncProviderData.mockResolvedValue({ lepard: 'def' });
    const value = await updateSamlProviderData({ enterpriseId, metadataURL, entityID });
    expect(value).toStrictEqual({ lepard: 'def' });
  });
});
