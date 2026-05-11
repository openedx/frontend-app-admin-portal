/* eslint-disable import/no-extraneous-dependencies */
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import EnterpriseCatalogApiService from '../EnterpriseCatalogApiService';

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);

axiosMock.onAny().reply(200);
axios.get = jest.fn().mockResolvedValue({ data: {} });
axios.post = jest.fn().mockResolvedValue({ data: {} });
axios.patch = jest.fn().mockResolvedValue({ data: {} });
axios.delete = jest.fn().mockResolvedValue({ data: {} });
const enterpriseCatalogBaseUrl = `${process.env.ENTERPRISE_CATALOG_BASE_URL}/api/v1`;

const mockHighlightSetUUID = 'test-highlight-set-uuid';
const mockEnterpriseId = 'test-enterprise-id';
const mockEnterpriseCurationUUID = 'test-enterprise-curation-uuid';
const mockCatalogUuid = 'test-catalog-uuid';

describe('EnterpriseCatalogApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('fetchHighlightSet calls enterprise-catalog', async () => {
    await EnterpriseCatalogApiService.fetchHighlightSet(mockHighlightSetUUID);
    expect(axios.get).toBeCalledWith(`${enterpriseCatalogBaseUrl}/highlight-sets-admin/${mockHighlightSetUUID}`);
  });

  test('fetchEnterpriseCatalogMetadata calls the correct endpoint', async () => {
    await EnterpriseCatalogApiService.fetchEnterpriseCatalogMetadata({ catalogUuid: mockCatalogUuid });
    expect(axios.get).toHaveBeenCalledWith(
      `${enterpriseCatalogBaseUrl}/enterprise-catalogs/${mockCatalogUuid}/get_content_metadata/`,
    );
  });

  test('fetchApplicableCatalogs includes course_run_ids when provided', async () => {
    await EnterpriseCatalogApiService.fetchApplicableCatalogs({
      enterpriseId: mockEnterpriseId,
      courseRunIds: ['course-v1:edX+DemoX+Demo_Course', 'course-v1:edX+Extra+2024'],
    });

    expect(axios.get).toHaveBeenCalledWith(
      `${enterpriseCatalogBaseUrl}/enterprise-customer/${mockEnterpriseId}/contains_content_items/?get_catalogs_containing_specified_content_ids=true&course_run_ids=course-v1%3AedX%2BDemoX%2BDemo_Course%2Ccourse-v1%3AedX%2BExtra%2B2024`,
    );
  });

  test('fetchApplicableCatalogs omits course_run_ids when empty', async () => {
    await EnterpriseCatalogApiService.fetchApplicableCatalogs({
      enterpriseId: mockEnterpriseId,
      courseRunIds: [],
    });

    expect(axios.get).toHaveBeenCalledWith(
      `${enterpriseCatalogBaseUrl}/enterprise-customer/${mockEnterpriseId}/contains_content_items/?get_catalogs_containing_specified_content_ids=true`,
    );
  });

  test('fetchEnterpriseCustomerCatalogs adds enterprise_customer query param', async () => {
    await EnterpriseCatalogApiService.fetchEnterpriseCustomerCatalogs(mockEnterpriseId);
    expect(axios.get).toHaveBeenCalledWith(
      `${enterpriseCatalogBaseUrl}/enterprise-catalogs/?enterprise_customer=${mockEnterpriseId}`,
    );
  });

  test('getEnterpriseCurationConfig calls admin endpoint with query param', async () => {
    await EnterpriseCatalogApiService.getEnterpriseCurationConfig(mockEnterpriseId);
    expect(axios.get).toHaveBeenCalledWith(
      `${enterpriseCatalogBaseUrl}/enterprise-curations-admin/?enterprise_customer=${mockEnterpriseId}`,
    );
  });

  test('createEnterpriseCurationConfig posts snake_case payload', async () => {
    const options = {
      canOnlyViewHighlightSets: true,
      title: 'Enterprise Curation',
    };
    await EnterpriseCatalogApiService.createEnterpriseCurationConfig(mockEnterpriseId, options);

    expect(axios.post).toHaveBeenCalledWith(
      `${enterpriseCatalogBaseUrl}/enterprise-curations-admin/`,
      {
        enterprise_customer: mockEnterpriseId,
        can_only_view_highlight_sets: true,
        title: 'Enterprise Curation',
      },
    );
  });

  test('updateEnterpriseCurationConfig patches snake_case payload and UUID path', async () => {
    const options = {
      isHighlightFeatureActive: true,
      canOnlyViewHighlightSets: false,
    };
    await EnterpriseCatalogApiService.updateEnterpriseCurationConfig(mockEnterpriseCurationUUID, options);

    expect(axios.patch).toHaveBeenCalledWith(
      `${enterpriseCatalogBaseUrl}/enterprise-curations-admin/${mockEnterpriseCurationUUID}/`,
      {
        is_highlight_feature_active: true,
        can_only_view_highlight_sets: false,
      },
    );
  });

  test('createHighlightSet posts snake_case payload with enterprise id', async () => {
    const options = {
      title: 'My Highlight Set',
      isPublished: false,
    };
    await EnterpriseCatalogApiService.createHighlightSet(mockEnterpriseId, options);

    expect(axios.post).toHaveBeenCalledWith(
      `${enterpriseCatalogBaseUrl}/highlight-sets-admin/`,
      {
        enterprise_customer: mockEnterpriseId,
        title: 'My Highlight Set',
        is_published: false,
      },
    );
  });

  test('deleteHighlightSet calls enterprise-catalog', () => {
    EnterpriseCatalogApiService.deleteHighlightSet(mockHighlightSetUUID);
    expect(axios.delete).toBeCalledWith(`${enterpriseCatalogBaseUrl}/highlight-sets-admin/${mockHighlightSetUUID}/`);
  });

  test('deleteHighlightSetContent posts content keys to remove-content endpoint', async () => {
    const contentKeys = ['course-v1:edX+DemoX+Demo_Course', 'course-v1:edX+Extra+2024'];
    await EnterpriseCatalogApiService.deleteHighlightSetContent(mockHighlightSetUUID, contentKeys);

    expect(axios.post).toHaveBeenCalledWith(
      `${enterpriseCatalogBaseUrl}/highlight-sets-admin/${mockHighlightSetUUID}/remove-content/`,
      {
        content_keys: contentKeys,
      },
    );
  });
});
