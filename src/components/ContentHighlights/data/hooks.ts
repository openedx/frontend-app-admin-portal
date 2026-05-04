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

const getHighlightSetQueryKey = (highlightSetUUID: string | undefined) => ['highlightSet', highlightSetUUID] as const;

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
    queryFn: () => EnterpriseCatalogApiService.fetchHighlightSet(highlightSetUUID as string),
    enabled: !!highlightSetUUID,
  });

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
    try {
      const result = await EnterpriseCatalogApiService.updateHighlightSet(
        highlightSetUUID as string,
        { title: newTitle },
      );
      const updatedTitle = (result as { title?: string })?.title ?? newTitle;
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
      return result;
    } catch (e) {
      setMutationError(e as Error);
      throw e;
    }
  }, [highlightSetUUID, queryClient]);

  return {
    updateHighlightSet,
    updateHighlightTitle,
    highlightSet: highlightSet || [],
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
  // eslint-disable-next-line max-len
  const currentSelectedRowState = useContextSelector(ContentHighlightsContext, v => v[0].stepperModal.currentSelectedRowIds);

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
    // Pre-select existing content using aggregationKey as the row ID
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
      const currentRowIds = { ...currentSelectedRowState };
      delete currentRowIds[rowId];
      return {
        ...s,
        stepperModal: {
          ...s.stepperModal,
          currentSelectedRowIds: currentRowIds,
        },
      };
    });
  }, [setState, currentSelectedRowState]);

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
