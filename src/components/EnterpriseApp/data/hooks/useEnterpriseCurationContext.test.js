import { renderHook } from '@testing-library/react-hooks/dom';

import useEnterpriseCuration from './useEnterpriseCuration';
import useEnterpriseCurationContext from './useEnterpriseCurationContext';

const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';
const TEST_ENTERPRISE_NAME = 'Test Enterprise';

jest.mock('./useEnterpriseCuration');

describe('useEnterpriseCurationContext', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return expected context value', async () => {
    const mockEnterpriseCurationConfig = { uuid: 'fake-uuid' };
    useEnterpriseCuration.mockReturnValue({
      isLoading: false,
      enterpriseCuration: mockEnterpriseCurationConfig,
      enterpriseHighlightedSets: null,
      fetchError: null,
    });
    const args = {
      enterpriseId: TEST_ENTERPRISE_UUID,
      curationTitleForCreation: TEST_ENTERPRISE_NAME,
    };
    const { result } = renderHook(() => useEnterpriseCurationContext(args));

    expect(result.current).toEqual(
      expect.objectContaining({
        isLoading: false,
        enterpriseCuration: mockEnterpriseCurationConfig,
        enterpriseHighlightedSets: null,
        fetchError: null,
      }),
    );
  });
});
