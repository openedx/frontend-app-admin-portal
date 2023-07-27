import {
  useCallback, useEffect, useState,
} from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { getConfig } from '@edx/frontend-platform/config';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import EnterpriseCatalogApiService from '../../../../data/services/EnterpriseCatalogApiService';

/**
 * TODO
 * @param {*} param0
 * @returns
 */
function useEnterpriseCuration({ enterpriseId, curationTitleForCreation }) {
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [enterpriseCuration, setEnterpriseCuration] = useState(null);

  const config = getConfig();

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

  const getEnterpriseCuration = useCallback(async () => {
    try {
      const response = await EnterpriseCatalogApiService.getEnterpriseCurationConfig(enterpriseId);
      const formattedResponse = camelCaseObject(response.data);
      const result = formattedResponse.results[0];
      return result;
    } catch (error) {
      logError(error);
      throw error;
    }
  }, [enterpriseId]);

  const updateEnterpriseCuration = useCallback(async (options) => {
    try {
      const response = await EnterpriseCatalogApiService.updateEnterpriseCurationConfig(
        enterpriseCuration.uuid,
        options,
      );
      const result = camelCaseObject(response?.data);
      setEnterpriseCuration(result);
      return result;
    } catch (error) {
      logError(error);
      setFetchError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [enterpriseCuration]);

  useEffect(() => {
    if (!enterpriseId || !config.FEATURE_CONTENT_HIGHLIGHTS) {
      setIsLoading(false);
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
  }, [
    enterpriseId,
    getEnterpriseCuration,
    createEnterpriseCuration,
    config,
  ]);

  return {
    isLoading,
    enterpriseCuration,
    fetchError,
    updateEnterpriseCuration,
  };
}

export default useEnterpriseCuration;
