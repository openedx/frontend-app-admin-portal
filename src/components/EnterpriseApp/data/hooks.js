import {
  useCallback, useEffect, useState, useMemo,
} from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import EnterpriseCatalogApiService from '../../../data/services/EnterpriseCatalogApiService';

/**
 * TODO
 * @param {*} param0
 * @returns
 */
export function useEnterpriseCuration({ enterpriseId, curationTitleForCreation }) {
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState();
  const [enterpriseCuration, setEnterpriseCuration] = useState();

  const createEnterpriseCuration = useCallback(async () => {
    try {
      const response = await EnterpriseCatalogApiService.createEnterpriseCurationConfig(enterpriseId, {
        title: curationTitleForCreation,
      });
      const result = camelCaseObject(response.data);
      return result;
    } catch (error) {
      logError(error);
      throw error;
    }
  }, [enterpriseId, curationTitleForCreation]);

  const getEnterpriseCuration = useCallback(
    async () => {
      try {
        const response = await EnterpriseCatalogApiService.getEnterpriseCurationConfig(enterpriseId);
        const formattedResponse = camelCaseObject(response.data);
        const result = formattedResponse.results[0];
        return result;
      } catch (error) {
        logError(error);
        throw error;
      }
    }, [enterpriseId],
  );

  useEffect(() => {
    if (!enterpriseId) {
      return;
    }
    const getOrCreateConfiguration = async () => {
      try {
        let curation = await getEnterpriseCuration();
        if (!curation) {
          curation = await createEnterpriseCuration();
        }
        setEnterpriseCuration(curation);
      } catch (error) {
        logError(error);
        setFetchError(error);
      } finally {
        setIsLoading(false);
      }
    };

    getOrCreateConfiguration();
  }, [enterpriseId, getEnterpriseCuration, createEnterpriseCuration]);

  return {
    isLoading,
    enterpriseCuration,
    fetchError,
  };
}

/**
 * TODO
 * @param {*} param0
 * @returns
 */
export function useEnterpriseCurationContext({
  enterpriseId,
  curationTitleForCreation,
}) {
  const {
    isLoading,
    enterpriseCuration,
    fetchError,
  } = useEnterpriseCuration({
    enterpriseId,
    curationTitleForCreation,
  });

  const contextValue = useMemo(() => ({
    isLoading,
    enterpriseCuration,
    fetchError,
  }), [isLoading, enterpriseCuration, fetchError]);

  return contextValue;
}
