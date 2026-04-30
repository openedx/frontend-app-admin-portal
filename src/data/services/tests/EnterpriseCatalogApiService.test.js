/* eslint-disable import/no-extraneous-dependencies */
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import EnterpriseCatalogApiService from '../EnterpriseCatalogApiService';

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);

axiosMock.onAny().reply(200);
axios.get = jest.fn();
axios.delete = jest.fn();
axios.patch = jest.fn();
const enterpriseCatalogBaseUrl = `${process.env.ENTERPRISE_CATALOG_BASE_URL}/api/v1`;

const mockHighlightSetUUID = 'test-highlight-set-uuid';

describe('EnterpriseCatalogApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('fetchHighlightSet calls enterprise-catalog', () => {
    EnterpriseCatalogApiService.fetchHighlightSet(mockHighlightSetUUID);
    expect(axios.get).toBeCalledWith(`${enterpriseCatalogBaseUrl}/highlight-sets-admin/${mockHighlightSetUUID}`);
  });
  test('deleteHighlightSet calls enterprise-catalog', () => {
    EnterpriseCatalogApiService.deleteHighlightSet(mockHighlightSetUUID);
    expect(axios.delete).toBeCalledWith(`${enterpriseCatalogBaseUrl}/highlight-sets-admin/${mockHighlightSetUUID}/`);
  });
  test('updateHighlightSet calls enterprise-catalog with correct payload', () => {
    const options = { remove_content_keys: ['edX+Course1', 'edX+Course2'] };
    EnterpriseCatalogApiService.updateHighlightSet(mockHighlightSetUUID, options);
    expect(axios.patch).toBeCalledWith(
      `${enterpriseCatalogBaseUrl}/highlight-sets-admin/${mockHighlightSetUUID}/`,
      options,
    );
  });
  test('updateHighlightSet calls enterprise-catalog with PATCH', () => {
    const updatePayload = { title: 'Updated Title' };
    EnterpriseCatalogApiService.updateHighlightSet(mockHighlightSetUUID, updatePayload);
    expect(axios.patch).toBeCalledWith(
      `${enterpriseCatalogBaseUrl}/highlight-sets-admin/${mockHighlightSetUUID}/`,
      expect.any(Object),
    );
  });
});
