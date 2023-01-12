import { camelCaseObject } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';
import { useCallback, useState, useEffect } from 'react';
import { useContextSelector } from 'use-context-selector';
import EnterpriseCatalogApiService from '../../../data/services/EnterpriseCatalogApiService';
import { ContentHighlightsContext } from '../ContentHighlightsContext';

export function useHighlightSetsForCuration(enterpriseCuration) {
  const [highlightSets, setHighlightSets] = useState({
    draft: [],
    published: [],
  });

  useEffect(() => {
    const highlightSetsForCuration = enterpriseCuration?.highlightSets;
    const draftHighlightSets = [];
    const publishedHighlightSets = [];

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

export function useHighlightSet(highlightSetUUID) {
  const [highlightSet, setHighlightSet] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getHighlightSet = useCallback(async () => {
    try {
      const { data } = await EnterpriseCatalogApiService.fetchHighlightSet(highlightSetUUID);
      const result = camelCaseObject(data);
      setHighlightSet(result);
    } catch (e) {
      setError(e);
      logError(e);
    } finally {
      setIsLoading(false);
    }
  }, [highlightSetUUID]);

  useEffect(() => {
    getHighlightSet();
  }, [getHighlightSet]);

  return {
    highlightSet,
    isLoading,
    error,
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
        currentSelectedRowIds: {},
      },
    }));
  }, [setState]);

  const setCurrentSelectedRowIds = useCallback((selectedRowIds) => {
    setState(s => ({
      ...s,
      stepperModal: {
        ...s.stepperModal,
        currentSelectedRowIds: selectedRowIds,
      },
    }));
  }, [setState]);

  const deleteSelectedRowId = useCallback((rowId) => {
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

  const setHighlightTitle = useCallback(({ highlightTitle, titleStepValidationError }) => {
    setState(s => ({
      ...s,
      stepperModal: {
        ...s.stepperModal,
        highlightTitle,
        titleStepValidationError,
      },
    }));
  }, [setState]);

  return {
    openStepperModal,
    resetStepperModal,
    deleteSelectedRowId,
    setCurrentSelectedRowIds,
    setHighlightTitle,
  };
}
