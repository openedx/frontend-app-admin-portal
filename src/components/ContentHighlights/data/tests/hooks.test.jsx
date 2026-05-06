import React, { useState } from 'react';
import {
  act, renderHook, waitFor,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useContextSelector } from 'use-context-selector';
import { logError } from '@edx/frontend-platform/logging';
import EnterpriseCatalogApiService from '../../../../data/services/EnterpriseCatalogApiService';
import { ContentHighlightsContext } from '../../ContentHighlightsContext';
import {
  useContentHighlightsContext,
  useHighlightSet,
  useHighlightSetsForCuration,
} from '../hooks';

jest.mock('../../../../data/services/EnterpriseCatalogApiService');
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

const initialContextState = {
  stepperModal: {
    isOpen: false,
    highlightTitle: null,
    titleStepValidationError: null,
    currentSelectedRowIds: {},
    isEditMode: false,
    highlightSetUuid: null,
    existingContentKeys: [],
  },
  contentHighlights: [],
  algolia: {
    searchClient: null,
    securedAlgoliaApiKey: null,
    isLoading: false,
  },
};

const createWrapper = (contextState = initialContextState) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }) {
    const contextValue = useState(contextState);

    return (
      <QueryClientProvider client={queryClient}>
        <ContentHighlightsContext.Provider value={contextValue}>
          {children}
        </ContentHighlightsContext.Provider>
      </QueryClientProvider>
    );
  };
};

describe('ContentHighlights data hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useHighlightSetsForCuration', () => {
    it('splits draft and published highlight sets', () => {
      const enterpriseCuration = {
        highlightSets: [
          { uuid: '1', isPublished: true },
          { uuid: '2', isPublished: false },
          { uuid: '3', isPublished: true },
        ],
      };

      const { result } = renderHook(() => useHighlightSetsForCuration(enterpriseCuration));

      expect(result.current).toEqual({
        draft: [{ uuid: '2', isPublished: false }],
        published: [
          { uuid: '1', isPublished: true },
          { uuid: '3', isPublished: true },
        ],
      });
    });
  });

  describe('useHighlightSet', () => {
    it('does not fetch when highlightSetUUID is undefined', () => {
      const { result } = renderHook(() => useHighlightSet(undefined), {
        wrapper: createWrapper(),
      });

      expect(EnterpriseCatalogApiService.fetchHighlightSet).not.toHaveBeenCalled();
      expect(result.current.highlightSet).toBeNull();
    });

    it('fetches and updates highlighted content in query cache', async () => {
      EnterpriseCatalogApiService.fetchHighlightSet.mockResolvedValue({
        data: {
          uuid: 'test-uuid',
          title: 'Test title',
          highlighted_content: [],
        },
      });

      const { result } = renderHook(() => useHighlightSet('test-uuid'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.highlightSet).toEqual({
        uuid: 'test-uuid',
        title: 'Test title',
        highlightedContent: [],
      });

      const updatedHighlightedContent = [
        { contentKey: 'course-v1:test+TST101+2024' },
      ];

      await act(async () => {
        result.current.updateHighlightSet(updatedHighlightedContent);
      });

      await waitFor(() => {
        expect(result.current.highlightSet.highlightedContent).toEqual(updatedHighlightedContent);
      });
    });

    it('keeps state unchanged when cached highlight set is null', async () => {
      EnterpriseCatalogApiService.fetchHighlightSet.mockResolvedValue({
        data: null,
      });

      const { result } = renderHook(() => useHighlightSet('test-uuid'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.updateHighlightSet([
          { contentKey: 'course-v1:test+TST101+2024' },
        ]);
      });

      expect(result.current.highlightSet).toBeNull();
    });

    it('updates title from flat update response', async () => {
      EnterpriseCatalogApiService.fetchHighlightSet
        .mockResolvedValueOnce({
          data: {
            uuid: 'test-uuid',
            title: 'Old title',
            highlighted_content: [],
          },
        })
        .mockResolvedValueOnce({
          data: {
            uuid: 'test-uuid',
            title: 'New title',
            highlighted_content: [],
          },
        });

      EnterpriseCatalogApiService.updateHighlightSet.mockResolvedValue({
        data: { title: 'New title' },
      });

      const { result } = renderHook(() => useHighlightSet('test-uuid'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let updateResult;
      await act(async () => {
        updateResult = await result.current.updateHighlightTitle('New title');
      });

      expect(result.current.highlightSet.title).toBe('New title');
      expect(updateResult).toEqual({ title: 'New title' });
    });

    it('updates title from nested update response', async () => {
      EnterpriseCatalogApiService.fetchHighlightSet
        .mockResolvedValueOnce({
          data: {
            uuid: 'test-uuid',
            title: 'Old title',
            highlighted_content: [],
          },
        })
        .mockResolvedValueOnce({
          data: {
            uuid: 'test-uuid',
            title: 'Nested title',
            highlighted_content: [],
          },
        });

      EnterpriseCatalogApiService.updateHighlightSet.mockResolvedValue({
        data: {
          highlight_set: { title: 'Nested title' },
        },
      });

      const { result } = renderHook(() => useHighlightSet('test-uuid'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let updateResult;
      await act(async () => {
        updateResult = await result.current.updateHighlightTitle('Nested title');
      });

      expect(result.current.highlightSet.title).toBe('Nested title');
      expect(updateResult).toEqual({ title: 'Nested title' });
    });

    it('logs and exposes fetch errors', async () => {
      const error = new Error('fetch failed');
      EnterpriseCatalogApiService.fetchHighlightSet.mockRejectedValue(error);

      const { result } = renderHook(() => useHighlightSet('test-uuid'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe(error);
      expect(result.current.highlightSet).toBeNull();
      expect(logError).toHaveBeenCalledWith(error);
    });

    it('logs and rethrows update errors', async () => {
      const error = new Error('update failed');

      EnterpriseCatalogApiService.fetchHighlightSet.mockResolvedValue({
        data: {
          uuid: 'test-uuid',
          title: 'Old title',
          highlighted_content: [],
        },
      });

      EnterpriseCatalogApiService.updateHighlightSet.mockRejectedValue(error);

      const { result } = renderHook(() => useHighlightSet('test-uuid'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(result.current.updateHighlightTitle('New title')).rejects.toThrow('update failed');
      await waitFor(() => {
        expect(result.current.error).toBe(error);
      });
      expect(logError).toHaveBeenCalledWith(error);
    });
  });

  describe('useContentHighlightsContext', () => {
    it('deletes selected row ids from the latest state', () => {
      const wrapper = createWrapper({
        ...initialContextState,
        stepperModal: {
          ...initialContextState.stepperModal,
          currentSelectedRowIds: {
            'course:one': true,
            'course:two': true,
          },
        },
      });

      const { result } = renderHook(() => {
        const actions = useContentHighlightsContext();
        const currentSelectedRowIds = useContextSelector(
          ContentHighlightsContext,
          v => v[0].stepperModal.currentSelectedRowIds,
        );

        return {
          actions,
          currentSelectedRowIds,
        };
      }, { wrapper });

      act(() => {
        result.current.actions.deleteSelectedRowId('course:one');
      });

      expect(result.current.currentSelectedRowIds).toEqual({
        'course:two': true,
      });
    });
  });
});
