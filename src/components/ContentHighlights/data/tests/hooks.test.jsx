import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useContextSelector } from 'use-context-selector';

import EnterpriseCatalogApiService from '../../../../data/services/EnterpriseCatalogApiService';
import { ContentHighlightsContext } from '../../ContentHighlightsContext';
import {
  useContentHighlightsContext,
  useHighlightSet,
  useHighlightSetsForCuration,
} from '../hooks';

jest.mock('../../../../data/services/EnterpriseCatalogApiService');

const createWrapper = (queryClient) => function Wrapper({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('ContentHighlights data hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useHighlightSetsForCuration', () => {
    it('splits published and draft highlight sets', () => {
      const enterpriseCuration = {
        highlightSets: [
          { uuid: 'draft-1', isPublished: false },
          { uuid: 'published-1', isPublished: true },
          { uuid: 'draft-2', isPublished: false },
        ],
      };

      const { result } = renderHook(() => useHighlightSetsForCuration(enterpriseCuration));

      expect(result.current).toEqual({
        draft: [
          { uuid: 'draft-1', isPublished: false },
          { uuid: 'draft-2', isPublished: false },
        ],
        published: [
          { uuid: 'published-1', isPublished: true },
        ],
      });
    });

    it('returns empty arrays when highlight sets are absent', () => {
      const enterpriseCuration = {};
      const { result } = renderHook(() => useHighlightSetsForCuration(enterpriseCuration));

      expect(result.current).toEqual({
        draft: [],
        published: [],
      });
    });
  });

  describe('useHighlightSet', () => {
    it('does not fetch when highlightSetUUID is undefined', () => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
      });
      const wrapper = createWrapper(queryClient);
      const setQueryDataSpy = jest.spyOn(queryClient, 'setQueryData');

      const { result } = renderHook(() => useHighlightSet(undefined), { wrapper });

      act(() => {
        result.current.updateHighlightSet([{ contentKey: 'course-v1:edX+DemoX+Demo_Course' }]);
      });

      expect(EnterpriseCatalogApiService.fetchHighlightSet).not.toHaveBeenCalled();
      expect(result.current.highlightSet).toEqual([]);
      expect(setQueryDataSpy).not.toHaveBeenCalled();
    });

    it('fetches and updates highlighted content in query cache', async () => {
      const highlightSetUUID = 'test-highlight-set-uuid';
      const initialHighlightSet = {
        uuid: highlightSetUUID,
        highlightedContent: [{ contentKey: 'initial-content' }],
      };
      const updatedHighlightedContent = [
        { contentKey: 'updated-content-1' },
        { contentKey: 'updated-content-2' },
      ];

      EnterpriseCatalogApiService.fetchHighlightSet.mockResolvedValueOnce(initialHighlightSet);
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
      });
      const wrapper = createWrapper(queryClient);

      const { result } = renderHook(() => useHighlightSet(highlightSetUUID), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.updateHighlightSet(updatedHighlightedContent);
      });

      await waitFor(() => {
        expect(result.current.highlightSet.highlightedContent).toEqual(updatedHighlightedContent);
      });
    });

    it('keeps state unchanged when cached highlight set is null', async () => {
      const highlightSetUUID = 'test-highlight-set-uuid';
      EnterpriseCatalogApiService.fetchHighlightSet.mockResolvedValueOnce(null);
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
      });
      const wrapper = createWrapper(queryClient);

      const { result } = renderHook(() => useHighlightSet(highlightSetUUID), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.updateHighlightSet([{ contentKey: 'should-not-apply' }]);
      });

      expect(result.current.highlightSet).toEqual([]);
    });
  });

  describe('useContentHighlightsContext', () => {
    const createContextWrapper = () => function ContextWrapper({ children }) {
      const contextValue = React.useState({
        stepperModal: {
          isOpen: false,
          highlightTitle: null,
          titleStepValidationError: null,
          currentSelectedRowIds: {
            initial: true,
            removeMe: true,
          },
        },
        catalogVisibilityAlertOpen: false,
      });

      return (
        <ContentHighlightsContext.Provider value={contextValue}>
          {children}
        </ContentHighlightsContext.Provider>
      );
    };

    it('updates modal state through context mutators', () => {
      const wrapper = createContextWrapper();
      const { result } = renderHook(() => ({
        actions: useContentHighlightsContext(),
        state: useContextSelector(ContentHighlightsContext, v => v[0]),
      }), { wrapper });

      act(() => {
        result.current.actions.openStepperModal();
      });
      expect(result.current.state.stepperModal.isOpen).toBe(true);

      act(() => {
        result.current.actions.setHighlightTitle({
          highlightTitle: 'Test title',
          titleStepValidationError: 'Some validation error',
        });
      });
      expect(result.current.state.stepperModal.highlightTitle).toBe('Test title');
      expect(result.current.state.stepperModal.titleStepValidationError).toBe('Some validation error');

      act(() => {
        result.current.actions.setCurrentSelectedRowIds({ abc: true, xyz: true });
      });
      expect(result.current.state.stepperModal.currentSelectedRowIds).toEqual({ abc: true, xyz: true });

      act(() => {
        result.current.actions.resetStepperModal();
      });
      expect(result.current.state.stepperModal.isOpen).toBe(false);
      expect(result.current.state.stepperModal.highlightTitle).toBeNull();
      expect(result.current.state.stepperModal.titleStepValidationError).toBeNull();
      expect(result.current.state.stepperModal.currentSelectedRowIds).toEqual({});
    });

    it('deletes selected row id and toggles catalog visibility alert', () => {
      const wrapper = createContextWrapper();
      const { result } = renderHook(() => ({
        actions: useContentHighlightsContext(),
        state: useContextSelector(ContentHighlightsContext, v => v[0]),
      }), { wrapper });

      act(() => {
        result.current.actions.deleteSelectedRowId('removeMe');
      });
      expect(result.current.state.stepperModal.currentSelectedRowIds).toEqual({ initial: true });

      act(() => {
        result.current.actions.setCatalogVisibilityAlert({ isOpen: true });
      });
      expect(result.current.state.catalogVisibilityAlertOpen).toBe(true);
    });
  });
});
