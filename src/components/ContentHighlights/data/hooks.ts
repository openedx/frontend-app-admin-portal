import { camelCaseObject } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { useContextSelector } from 'use-context-selector';
import EnterpriseCatalogApiService from '../../../data/services/EnterpriseCatalogApiService';
import type { HighlightSet, HighlightedContentItem } from '../../../data/services/types';
import { ContentHighlightsContext } from '../ContentHighlightsContext';

type HighlightSetForCuration = {
  isPublished: boolean;
  [key: string]: unknown;
};

type EnterpriseCurationWithHighlightSets = {
  highlightSets?: HighlightSetForCuration[];
};

type ExistingContentItem = {
  aggregationKey?: string;
  contentKey: string;
};

type UpdateHighlightSetResponse = {
  title?: string;
  highlightSet?: {
    title?: string;
  };
};

export const getHighlightSetQueryKey = (highlightSetUUID: string | undefined) => ['highlightSet', highlightSetUUID] as const;

export function useHighlightSetsForCuration(enterpriseCuration?: EnterpriseCurationWithHighlightSets | null) {
  const [highlightSets, setHighlightSets] = useState<{
    draft: HighlightSetForCuration[];
    published: HighlightSetForCuration[];
  }>({
    draft: [],
    published: [],
  });

  useEffect(() => {
    const highlightSetsForCuration = enterpriseCuration?.highlightSets;
    const draftHighlightSets: HighlightSetForCuration[] = [];
    const publishedHighlightSets: HighlightSetForCuration[] = [];

    highlightSetsForCuration?.forEach((highlightSet) => {
      if (highlightSet.isPublished) {
        publishedHighlightSets.push(highlightSet);
      } else {
        draftHighlightSets.push(highlightSet);
      }
    });

    setHighlightSets({
      draft: draftHighlightSets,
      published: publishedHighlightSets,
    });
  }, [enterpriseCuration]);

  return highlightSets;
}

type ApiResponse<T> = T | { data: T } | null | undefined;

function getApiPayload<T>(response: ApiResponse<T>): T | null {
  if (response == null) {
    return null;
  }
  if (typeof response === 'object' && 'data' in response) {
    return (response as { data: T }).data ?? null;
  }
  return response as T;
}

export function useHighlightSet(highlightSetUUID: string | undefined) {
  const queryClient = useQueryClient();
  const [mutationError, setMutationError] = useState<Error | null>(null);

  const {
    data: highlightSet,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery<HighlightSet | null>({
    queryKey: getHighlightSetQueryKey(highlightSetUUID),
    queryFn: async () => {
      const response = await EnterpriseCatalogApiService.fetchHighlightSet(highlightSetUUID as string);
      const payload = getApiPayload<unknown>(response as ApiResponse<unknown>);
      if (!payload) {
        return null;
      }
      return camelCaseObject(payload) as HighlightSet;
    },
    enabled: !!highlightSetUUID,
  });

  useEffect(() => {
    if (queryError) {
      logError(queryError);
    }
  }, [queryError]);

  const updateHighlightSet = useCallback((highlightSetContentItems: HighlightedContentItem[]) => {
    if (!highlightSetUUID) {
      return;
    }

    queryClient.setQueryData<HighlightSet | null>(
      getHighlightSetQueryKey(highlightSetUUID),
      (previousHighlightSet) => {
        if (!previousHighlightSet) {
          return previousHighlightSet;
        }

        return {
          ...previousHighlightSet,
          highlightedContent: highlightSetContentItems,
        };
      },
    );
  }, [highlightSetUUID, queryClient]);

  const updateHighlightTitle = useCallback(async (newTitle: string) => {
    if (!highlightSetUUID) {
      return null;
    }

    setMutationError(null);

    try {
      const response = await EnterpriseCatalogApiService.updateHighlightSet(
        highlightSetUUID,
        { title: newTitle },
      );
      const payload = getApiPayload<unknown>(response as ApiResponse<unknown>);
      const result = camelCaseObject(payload || {}) as UpdateHighlightSetResponse;
      const updatedTitle = result.highlightSet?.title ?? result.title ?? newTitle;

      queryClient.setQueryData<HighlightSet | null>(
        getHighlightSetQueryKey(highlightSetUUID),
        (previousHighlightSet) => {
          if (!previousHighlightSet) {
            return previousHighlightSet;
          }

          return {
            ...previousHighlightSet,
            title: updatedTitle,
          };
        },
      );

      await queryClient.invalidateQueries({
        queryKey: getHighlightSetQueryKey(highlightSetUUID),
        exact: true,
      });

      return result.highlightSet ?? result;
    } catch (e) {
      const error = e as Error;
      setMutationError(error);
      logError(error);
      throw error;
    }
  }, [highlightSetUUID, queryClient]);

  return {
    updateHighlightSet,
    updateHighlightTitle,
    highlightSet: highlightSet || null,
    isLoading,
    error: queryError || mutationError,
    refetch,
  };
}

/**
 * Defines an interface to mutate the `ContentHighlightsContext` context value.
 */
export function useContentHighlightsContext() {
  const setState = useContextSelector(ContentHighlightsContext, v => v[1]);

  const openStepperModal = useCallback(() => {
    setState(s => ({
      ...s,
      stepperModal: {
        ...s.stepperModal,
        isOpen: true,
        isEditMode: false,
        highlightSetUuid: null,
        existingContentKeys: [],
      },
    }));
  }, [setState]);

  const openEditStepperModal = useCallback(({
    highlightTitle,
    highlightSetUuid,
    existingContent,
  }: {
    highlightTitle: string;
    highlightSetUuid: string;
    existingContent?: ExistingContentItem[] | null;
  }) => {
    const preSelectedRowIds: Record<string, boolean> = {};
    (existingContent || []).forEach((item) => {
      const aggregationKey = item.aggregationKey || `course:${item.contentKey}`;
      preSelectedRowIds[aggregationKey] = true;
    });

    setState(s => ({
      ...s,
      stepperModal: {
        ...s.stepperModal,
        isOpen: true,
        isEditMode: true,
        highlightTitle,
        highlightSetUuid,
        existingContentKeys: (existingContent || []).map(
          (item) => item.aggregationKey || `course:${item.contentKey}`,
        ),
        currentSelectedRowIds: preSelectedRowIds,
      },
    }));
  }, [setState]);

  const resetStepperModal = useCallback(() => {
    setState(s => ({
      ...s,
      stepperModal: {
        ...s.stepperModal,
        isOpen: false,
        highlightTitle: null,
        titleStepValidationError: null,
        currentSelectedRowIds: {},
        isEditMode: false,
        highlightSetUuid: null,
        existingContentKeys: [],
      },
    }));
  }, [setState]);

  const setCurrentSelectedRowIds = useCallback((selectedRowIds: Record<string, boolean>) => {
    setState(s => ({
      ...s,
      stepperModal: {
        ...s.stepperModal,
        currentSelectedRowIds: selectedRowIds,
      },
    }));
  }, [setState]);

  const deleteSelectedRowId = useCallback((rowId: string) => {
    setState(s => {
      const currentRowIds = { ...s.stepperModal.currentSelectedRowIds };
      delete currentRowIds[rowId];

      return {
        ...s,
        stepperModal: {
          ...s.stepperModal,
          currentSelectedRowIds: currentRowIds,
        },
      };
    });
  }, [setState]);

  const setHighlightTitle = useCallback(({
    highlightTitle,
    titleStepValidationError,
  }: {
    highlightTitle: string | null;
    titleStepValidationError: string | null;
  }) => {
    setState(s => ({
      ...s,
      stepperModal: {
        ...s.stepperModal,
        highlightTitle,
        titleStepValidationError,
      },
    }));
  }, [setState]);

  const setCatalogVisibilityAlert = useCallback(({ isOpen }: { isOpen: boolean }) => {
    setState(s => ({
      ...s,
      catalogVisibilityAlertOpen: isOpen,
    }));
  }, [setState]);

  return {
    openStepperModal,
    openEditStepperModal,
    resetStepperModal,
    deleteSelectedRowId,
    setCurrentSelectedRowIds,
    setHighlightTitle,
    setCatalogVisibilityAlert,
  };
}
