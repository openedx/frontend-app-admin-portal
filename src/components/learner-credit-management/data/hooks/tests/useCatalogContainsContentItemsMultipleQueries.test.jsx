import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-hooks/dom';
import { v4 as uuidv4 } from 'uuid';

import useCatalogContainsContentItemsMultipleQueries from '../useCatalogContainsContentItemsMultipleQueries';
import EnterpriseCatalogApiServiceV2 from '../../../../../data/services/EnterpriseCatalogApiServiceV2';
import { queryClient } from '../../../../test/testUtils';

const TEST_CATALOG_UUID = uuidv4();
const courseRunKeys = [
  'course-v1:edX+test+course.1',
  'course-v1:edX+test+course.2',
];

jest.mock('../../../../../data/services/EnterpriseCatalogApiServiceV2');

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient()}>{children}</QueryClientProvider>
);

describe('useCatalogContainsContentItemsMultipleQueries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch contains_content_items for requested restricted runs', async () => {
    EnterpriseCatalogApiServiceV2.retrieveContainsContentItems
      .mockResolvedValueOnce({ data: { foo: 'bar' } })
      .mockResolvedValueOnce({ data: { bin: 'baz' } });

    const { result, waitForNextUpdate } = renderHook(
      () => useCatalogContainsContentItemsMultipleQueries(
        TEST_CATALOG_UUID,
        courseRunKeys,
      ),
      { wrapper },
    );

    expect(result.current).toMatchObject({
      data: [undefined, undefined],
      dataByContentKey: {
        'course-v1:edX+test+course.1': undefined,
        'course-v1:edX+test+course.2': undefined,
      },
      isLoading: true,
      isFetching: true,
      isError: false,
      errorByContentKey: {
        'course-v1:edX+test+course.1': null,
        'course-v1:edX+test+course.2': null,
      },
    });

    await waitForNextUpdate();

    expect(result.current).toMatchObject({
      data: [{ foo: 'bar' }, { bin: 'baz' }],
      dataByContentKey: {
        'course-v1:edX+test+course.1': { foo: 'bar' },
        'course-v1:edX+test+course.2': { bin: 'baz' },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      errorByContentKey: {
        'course-v1:edX+test+course.1': null,
        'course-v1:edX+test+course.2': null,
      },
    });
  });
});
