import { camelCaseObject } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';
import { useCallback, useState, useEffect } from 'react';
import { useContextSelector } from 'use-context-selector';
import EnterpriseCatalogApiService from '../../../data/services/EnterpriseCatalogApiService';
import { ContentHighlightsContext } from '../ContentHighlightsContext';
import Cookies from 'universal-cookie';
import { NEW_ARCHIVED_COURSE_ALERT_DISMISSED_COOKIE_NAME } from './constants';
import { EnterpriseAppContext } from '../../EnterpriseApp/EnterpriseAppContextProvider';
import { useContext } from 'react';

const archivedHighlightsCoursesCookies = new Cookies();

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
        titleStepValidationError: null,
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

  const setCatalogVisibilityAlert = useCallback(({ isOpen }) => {
    setState(s => ({
      ...s,
      catalogVisibilityAlertOpen: isOpen,
    }));
  }, [setState]);

  return {
    openStepperModal,
    resetStepperModal,
    deleteSelectedRowId,
    setCurrentSelectedRowIds,
    setHighlightTitle,
    setCatalogVisibilityAlert,
  };
}


export function useSetArchivedHighlightsCoursesCookies() {
  const [highlightSet, setHighlightSet] = useState({});
  const [isCookieLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cookieValue, setCookieValue] = useState({});

  const { enterpriseCuration: { enterpriseCuration: { highlightSets } } } = useContext(EnterpriseAppContext);
  const [isNewArchivedCourses, setIsNewArchivedCourses] = useState(false);

  useEffect(() => {
    const dismissedCookies = archivedHighlightsCoursesCookies.get(NEW_ARCHIVED_COURSE_ALERT_DISMISSED_COOKIE_NAME);

    const isDismissedArchivedCoursesSet = dismissedCookies !== undefined;
    const dismissedArchivedCourses = isDismissedArchivedCoursesSet ? dismissedCookies : {};

    highlightSets.forEach(async(highlight) => {
      try {
        const { data } = await EnterpriseCatalogApiService.fetchHighlightSet(highlight.uuid);
        const result = camelCaseObject(data);
        setHighlightSet(result);
      } catch (e) {
        setError(e);
        logError(e);
      } finally {
        setIsLoading(false);
      }

      const highlightedSetContent = highlightSet?.highlightedContent;
      // checks that the highlight uuid isn't set
      if (!dismissedArchivedCourses[highlight.uuid]) {
        highlightedSetContent?.forEach(content => {
          // if the length is greater than 1 for the course run status e.g. ["archived", "published"]
          // the course should not be archived
          if (content.courseRunStatuses?.length === 1 && content.courseRunStatuses?.includes("archived")) {
            setCookieValue( {
              ...dismissedArchivedCourses,
              [highlight.uuid]: [content.contentKey],
            })
            setIsNewArchivedCourses(true);
          }
        })
      // else the highlightUUID is in the cookie so we loop through each content key of that highlighted content
      } else {
        highlightedSetContent?.forEach(content => {
          if (content.courseRunStatuses?.length === 1 && content.courseRunStatuses?.includes("archived") && !dismissedArchivedCourses[highlight.uuid].includes(content.contentKey)) {
            setCookieValue({
              ...dismissedArchivedCourses,
              [highlight.uuid]: [...dismissedArchivedCourses[highlight.uuid], content.contentKey],
            })
            setIsNewArchivedCourses(true);
          }
        })
      }
    });
  }, [])

  const setNewCourseCookies = () => {
    archivedHighlightsCoursesCookies.set(
      NEW_ARCHIVED_COURSE_ALERT_DISMISSED_COOKIE_NAME, cookieValue,
    );

    setIsNewArchivedCourses(false);
  }
  
  return { isNewArchivedCourses, setNewCourseCookies, isCookieLoading };
}