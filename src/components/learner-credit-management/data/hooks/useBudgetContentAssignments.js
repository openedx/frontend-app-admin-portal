import { useCallback, useMemo, useState } from 'react';
import debounce from 'lodash.debounce';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';

const initialContentAssignmentsState = {
  results: [],
  count: 0,
  numPages: 0,
  currentPage: 1,
};

const applyFiltersToOptions = (filters, options) => {
  if (!filters?.length === 0) {
    return;
  }
  const searchQuery = filters.find(filter => filter.id === 'assignmentDetails')?.value;
  if (searchQuery) {
    Object.assign(options, { search: searchQuery });
  }
};

const useBudgetContentAssignments = ({
  assignmentConfigurationUUID,
  isEnabled,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [contentAssignments, setContentAssignments] = useState(initialContentAssignmentsState);

  const fetchContentAssignments = useCallback((args) => {
    if (!isEnabled || !assignmentConfigurationUUID) {
      setIsLoading(false);
      return;
    }
    const getContentAssignments = async () => {
      setIsLoading(true);
      const options = {
        page: args.pageIndex + 1, // `DataTable` uses zeo-indexed array
        pageSize: args.pageSize,
      };
      applyFiltersToOptions(args.filters, options);
      const assignmentsResponse = await EnterpriseAccessApiService.listContentAssignments(
        assignmentConfigurationUUID,
        options,
      );
      setContentAssignments(camelCaseObject(assignmentsResponse.data));
      setIsLoading(false);
    };
    getContentAssignments();
  }, [isEnabled, assignmentConfigurationUUID]);

  const debouncedFetchContentAssigments = useMemo(
    () => debounce(fetchContentAssignments, 300),
    [fetchContentAssignments],
  );

  return {
    isLoading,
    contentAssignments,
    fetchContentAssignments: debouncedFetchContentAssigments,
  };
};

export default useBudgetContentAssignments;
