import Router from 'react-router-dom';
import { renderHook, act } from '@testing-library/react-hooks/dom';
import { waitFor } from '@testing-library/react';

import LmsApiService from '../../../../data/services/LmsApiService';
import {
  useCurrentSettingsTab,
  useLinkManagement,
} from '../hooks';

const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';
jest.mock('../../../../data/services/LmsApiService');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

describe('settings hooks', () => {
  describe('useCurrentSettingsTab', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    test('returns expected route param', () => {
      jest.spyOn(Router, 'useParams').mockReturnValue({ settingsTab: 'access' });
      const { result } = renderHook(useCurrentSettingsTab);
      expect(result.current).toEqual('access');
    });
  });

  describe('useLinkManagement', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    test('success', () => {
      const expectedData = [
        { uuid: 'test-uuid-1' },
        { uuid: 'test-uuid-2' },
      ];
      const expectedResponse = {
        data: expectedData,
      };
      LmsApiService.getAccessLinks.mockResolvedValue(expectedResponse);
      const queryParams = new URLSearchParams();
      queryParams.append('enterprise_customer_uuid', TEST_ENTERPRISE_UUID);

      let result;
      act(() => {
        ({ result } = renderHook(() => useLinkManagement(TEST_ENTERPRISE_UUID)));
        expect(result.current).toStrictEqual({
          links: [],
          loadingLinks: true,
          refreshLinks: expect.any(Function),
        });
      });
      waitFor(() => {
        expect(result.current).toStrictEqual({
          links: expectedData,
          loadingLinks: false,
          refreshLinks: expect.any(Function),
        });
      });
    });
  });
});
