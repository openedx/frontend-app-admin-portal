import { useCallback, useMemo, useState } from 'react';
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

const applyFiltersToOptions = (filters, options) => {
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

const applySortByToOptions = (sortBy, options) => {
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
    // descending order, users would likely expect the larger contenr quantity to be at the top of the list,
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
      // Checks if sortBy attribute exist to avoid sending multiple segment events
      if (args.sortBy) {
        const trackEventMetadata = {
          learnerState: options.learnerState || '',
          search: options.search || '',
          sortBy: args.sortBy[0].id,
          descending: args.sortBy[0].desc,
        };
        await sendEnterpriseTrackEvent(
          enterpriseId,
          EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT.BUDGET_DETAILS_DATATABLE_SORT_BY_OR_FILTER,
          trackEventMetadata,
        );
      }
      const assignmentsResponse = await EnterpriseAccessApiService.listContentAssignments(
        assignmentConfigurationUUID,
        options,
      );
      setContentAssignments(camelCaseObject(assignmentsResponse.data));
      setIsLoading(false);
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
