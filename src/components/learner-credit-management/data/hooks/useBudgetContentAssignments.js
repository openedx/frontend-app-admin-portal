import {
  useCallback, useMemo, useState, useRef,
} from 'react';
import debounce from 'lodash.debounce';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';
import EVENT_NAMES from '../../../../eventTracking';

const initialContentAssignmentsState = {
  results: [],
  count: 0,
  numPages: 0,
  currentPage: 1,
  learnerStateCounts: [],
};

export const applyFiltersToOptions = (filters, options) => {
  if (!filters || filters.length === 0) {
    return;
  }
  const searchQuery = filters.find(filter => filter.id === 'assignmentDetails')?.value;
  if (searchQuery) {
    Object.assign(options, { search: searchQuery });
  }
  const learnerStateFilter = filters.find(filter => filter.id === 'learnerState')?.value;
  if (learnerStateFilter) {
    Object.assign(options, { learnerState: learnerStateFilter.join(',') });
  }
};

export const applySortByToOptions = (sortBy, options) => {
  if (!sortBy || sortBy.length === 0) {
    return;
  }
  const apiFieldsForColumnAccessor = {
    recentAction: { key: 'recent_action_time' },
    learnerState: { key: 'learner_state_sort_order' },
    amount: { key: 'content_quantity', isReversed: true },
  };
  const orderingStrings = sortBy.map(({ id, desc }) => {
    const apiFieldForColumnAccessor = apiFieldsForColumnAccessor[id];
    if (!apiFieldForColumnAccessor) {
      return undefined;
    }
    const isApiFieldOrderingReversed = apiFieldForColumnAccessor.isReversed;
    const apiFieldKey = apiFieldForColumnAccessor.key;
    // Determine whether the API field ordering should be reversed based on the column accessor. This is
    // necessary because the content_quantity field is a negative number, but if the column is sorted in a
    // descending order, users would likely expect the larger content quantity to be at the top of the list,
    // which is technically the smaller number since its negative.
    if (isApiFieldOrderingReversed) {
      return desc ? apiFieldKey : `-${apiFieldKey}`;
    }
    return desc ? `-${apiFieldKey}` : apiFieldKey;
  }).filter(orderingString => !!orderingString);
  Object.assign(options, {
    ordering: orderingStrings.join(','),
  });
};

const useBudgetContentAssignments = ({
  assignmentConfigurationUUID,
  isEnabled,
  enterpriseId,
}) => {
  const currentArgsRef = useRef(null);
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
      applySortByToOptions(args.sortBy, options);

      /* This logic in conjunction with useRef is being used to prevent track events
      from being called when the page re-renders without the specifically selected
      arguments (argCopy) being changed */
      const argsCopy = {
        pageIndex: args.pageIndex,
        pageSize: args.pageSize,
        filters: args.filters,
        sortBy: args.sortBy,
      };
      const shouldEmitSegmentEvent = !!currentArgsRef.current && (
        JSON.stringify(argsCopy) !== JSON.stringify(currentArgsRef.current));
      if (shouldEmitSegmentEvent) {
        const trackEventMetadata = {
          filters: {
            learnerState: options.learnerState || null,
            search: options.search || null,
          },
          ordering: options.ordering || null,
          page: options.page || null,
          pageSize: options.pageSize || null,
        };
        await sendEnterpriseTrackEvent(
          enterpriseId,
          EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT.BUDGET_DETAILS_ASSIGNED_DATATABLE_SORT_BY_OR_FILTER,
          trackEventMetadata,
        );
      }
      const assignmentsResponse = await EnterpriseAccessApiService.listContentAssignments(
        assignmentConfigurationUUID,
        options,
      );
      setContentAssignments(camelCaseObject(assignmentsResponse.data));
      setIsLoading(false);
      // Memoizes argsCopy to be referenced against future re-renders
      currentArgsRef.current = argsCopy;
    };
    getContentAssignments();
  }, [isEnabled, assignmentConfigurationUUID, enterpriseId]);

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
