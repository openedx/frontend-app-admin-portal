import { camelCaseObject } from '@edx/frontend-platform';
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

export function useHighlightSetItems(highlightSetUUID) {
  const [highlightSetItems, setHighlightSetItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getHighlightSetItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await EnterpriseCatalogApiService.fetchHighlightSetItems(highlightSetUUID);
      const result = camelCaseObject(data);
      setHighlightSetItems(result);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [highlightSetUUID]);

  useEffect(() => {
    getHighlightSetItems();
  }, [getHighlightSetItems]);

  return {
    highlightSetItems,
    loading,
    error,
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
    setCurrentSelectedRowIds,
    setHighlightTitle,
  };
}
